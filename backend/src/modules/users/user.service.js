const User = require('./user.model');
const logger = require('../../core/config/loggerConfig');
const { NotFoundError, ValidationError } = require('../../common/middleware/errorHandler');
const skillGraphService = require('../../common/utils/skillGraph');

function calculateActiveStreak(activityLog = []) {
  if (!activityLog.length) return 0;

  const normalize = (d) => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  };

  const today = normalize(new Date());

  const uniqueDays = [
    ...new Set(activityLog.map(a => normalize(a.date)))
  ].sort((a, b) => b - a);

  let streak = 0;
  let currentDay = today;

  for (const day of uniqueDays) {
    if (day === currentDay) {
      streak++;
      currentDay -= 86400000;
    } else {
      break;
    }
  }

  return streak;
}

class UserService {
  async createUser(userData) {
    try {
      const user = new User(userData);
      await user.save();
      
      // Create user node in Neo4j
      await skillGraphService.createUserNode(user._id, {
        username: user.username,
        email: user.email,
        xp: user.xp
      });

      logger.info(`User created: ${user.username}`);
      return user;
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new ValidationError(`${field} already exists`);
      }
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError('User');
      }
      return user;
    } catch (error) {
      logger.error('Error getting user by ID:', error);
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      return user;
    } catch (error) {
      logger.error('Error getting user by email:', error);
      throw error;
    }
  }

  async getUserByUsername(username) {
    try {
      const user = await User.findOne({ username: username.toLowerCase() });
      return user;
    } catch (error) {
      logger.error('Error getting user by username:', error);
      throw error;
    }
  }

  async getUserByGithubId(githubId) {
    try {
      const user = await User.findOne({ githubId });
      return user;
    } catch (error) {
      logger.error('Error getting user by GitHub ID:', error);
      throw error;
    }
  }

  async updateUser(userId, updateData) {
    try {
      // Remove fields that shouldn't be directly updated
      const { password, githubAccessToken, xp, level, ...safeUpdateData } = updateData;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: safeUpdateData },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new NotFoundError('User');
      }

      // Update Neo4j node if relevant fields changed
      if (updateData.username || updateData.email || updateData.xp) {
        await skillGraphService.createUserNode(user._id, {
          username: user.username,
          email: user.email,
          xp: user.xp
        });
      }

      await this.recordActivity(userId); 


      logger.info(`User updated: ${user.username}`);
      return user;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  async updateUserSkills(userId, skills) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError('User');
      }

      user.skills = skills;
      await user.save();
      await this.recordActivity(userId);

      // Update skills in Neo4j
      await skillGraphService.updateUserSkills(userId, skills);

      logger.info(`Skills updated for user: ${user.username}`);
      return user;
    } catch (error) {
      logger.error('Error updating user skills:', error);
      throw error;
    }
  }
  async recordActivity(userId) {
    await User.findByIdAndUpdate(userId, {
      $push: {
        activityLog: { date: new Date() }
      }
    });
  }

  async updateUserEmbedding(userId, embedding) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { skillEmbedding: embedding } },
        { new: true }
      );

      if (!user) {
        throw new NotFoundError('User');
      }

      return user;
    } catch (error) {
      logger.error('Error updating user embedding:', error);
      throw error;
    }
  }

  async addUserXP(userId, xpAmount) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError('User');
      }

      user.addXP(xpAmount);
      await user.save();
      await this.recordActivity(userId);

      logger.info(`Added ${xpAmount} XP to user: ${user.username}`);
      return user;
    } catch (error) {
      logger.error('Error adding user XP:', error);
      throw error;
    }
  }

  async updateGithubData(userId, githubData) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { 
          $set: { 
            githubData: {
              ...githubData,
              lastAnalyzed: new Date()
            }
          }
        },
        { new: true }
      );

      if (!user) {
        throw new NotFoundError('User');
      }

      return user;
    } catch (error) {
      logger.error('Error updating GitHub data:', error);
      throw error;
    }
  }

  async addMatchHistory(userId, matchData) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { 
          $push: { matchHistory: matchData },
          $inc: { 'statistics.totalMatches': 1 }
        },
        { new: true }
      );

      if (!user) {
        throw new NotFoundError('User');
      }

      return user;
    } catch (error) {
      logger.error('Error adding match history:', error);
      throw error;
    }
  }

  async updateMatchStatus(userId, matchId, status, feedback = null) {
    try {
      const updateData = {
        'matchHistory.$.status': status
      };

      if (feedback) {
        updateData['matchHistory.$.feedback'] = feedback;
      }

      const user = await User.findOneAndUpdate(
        { _id: userId, 'matchHistory._id': matchId },
        { $set: updateData },
        { new: true }
      );

      if (!user) {
        throw new NotFoundError('User or match');
      }

      // Increment successful matches if status is completed
      if (status === 'completed') {
        await User.findByIdAndUpdate(userId, {
          $inc: { 'statistics.successfulMatches': 1 }
        });
      }

      return user;
    } catch (error) {
      logger.error('Error updating match status:', error);
      throw error;
    }
  }

  async searchUsers(query, filters = {}, page = 1, limit = 20) {
    try {
      const searchQuery = {};

      // Text search on username, fullName, bio
      if (query) {
        searchQuery.$or = [
          { username: { $regex: query, $options: 'i' } },
          { fullName: { $regex: query, $options: 'i' } },
          { bio: { $regex: query, $options: 'i' } }
        ];
      }

      // Apply filters
      if (filters.skills && filters.skills.length > 0) {
        searchQuery['skills.name'] = { $in: filters.skills };
      }

      if (filters.minXP) {
        searchQuery.xp = { $gte: filters.minXP };
      }

      if (filters.isActive !== undefined) {
        searchQuery.isActive = filters.isActive;
      }

      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        User.find(searchQuery)
          .select('-githubAccessToken')
          .limit(limit)
          .skip(skip)
          .sort({ xp: -1 }),
        User.countDocuments(searchQuery)
      ]);

      return {
        users,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error searching users:', error);
      throw error;
    }
  }

  async getTopUsers(limit = 10) {
    try {
      const users = await User.find({ isActive: true })
        .select('-githubAccessToken')
        .sort({ xp: -1 })
        .limit(limit);

      return users;
    } catch (error) {
      logger.error('Error getting top users:', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        throw new NotFoundError('User');
      }

      // Delete from Neo4j
      await skillGraphService.deleteUser(userId);

      logger.info(`User deleted: ${user.username}`);
      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  async getUserStatistics(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError('User');
      }
      
      const activeStreak = calculateActiveStreak(user.activityLog);

      return {
        xp: user.xp,
        level: user.level,
        skillCount: user.skillCount,
        activeStreak,
        statistics: user.statistics,
        matchHistory: user.matchHistory
      };
    } catch (error) {
      logger.error('Error getting user statistics:', error);
      throw error;
    }
  }
}

module.exports = new UserService();