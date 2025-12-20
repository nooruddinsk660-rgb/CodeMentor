const User = require('../users/user.model');
const skillGraphService = require('../../common/utils/skillGraph');
const { calculateMatchScore } = require('../../common/utils/similarity');
const logger = require('../../core/config/loggerConfig');
const { NotFoundError, ValidationError } = require('../../common/middleware/errorHandler');

class MatchService {
  /**
   * Find potential matches for a user
   * @param {string} userId - User ID
   * @param {Object} options - Matching options
   * @returns {Promise<Array>} Array of match recommendations
   * @security Ensures users can't be matched with themselves
   * @performance Uses Promise.allSettled for fault tolerance
   */
  async findMatches(userId, options = {}) {
    try {
      // Input validation
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const { 
        limit = 10, 
        minScore = 0.3,
        includeInactive = false 
      } = options;

      // Validate limit
      const safeLimit = Math.max(1, Math.min(limit, 50)); // Cap at 50

      logger.info(`Finding matches for user: ${userId}`, { limit: safeLimit, minScore });

      // Get current user with error handling
      const currentUser = await User.findById(userId);
      if (!currentUser) {
        throw new NotFoundError('User');
      }

      // Check if user has skills
      if (!currentUser.skills || currentUser.skills.length === 0) {
        logger.warn(`User ${userId} has no skills defined`);
        return [];
      }

      // Get complementary users from Neo4j
      const complementaryUsers = await skillGraphService.findComplementaryUsers(
        userId,
        safeLimit * 3 // Get more candidates for better filtering
      ).catch(error => {
        logger.error('Error fetching complementary users from Neo4j:', error);
        return []; // Fallback to empty array
      });

      if (complementaryUsers.length === 0) {
        logger.info(`No complementary users found for user: ${userId}`);
        return [];
      }

      // Fetch and score potential matches
      const matchPromises = complementaryUsers.map(async (match) => {
        try {
          // Skip if no userId
          if (!match.userId) {
            return null;
          }

          // Don't match user with themselves
          if (match.userId.toString() === userId.toString()) {
            return null;
          }

          // Fetch match user
          const matchUser = await User.findById(match.userId);
          
          if (!matchUser) {
            logger.warn(`Match user not found: ${match.userId}`);
            return null;
          }

          // Skip inactive users unless explicitly included
          if (!includeInactive && !matchUser.isActive) {
            return null;
          }

          // Skip if user is already in match history
          const alreadyMatched = currentUser.matchHistory?.some(
            h => h.matchedUserId?.toString() === matchUser._id.toString()
          );

          if (alreadyMatched) {
            logger.debug(`User ${matchUser._id} already in match history`);
            return null;
          }

          // Calculate match score with error handling
          let matchData;
          try {
            matchData = calculateMatchScore(currentUser, matchUser);
          } catch (scoreError) {
            logger.error('Error calculating match score:', scoreError);
            return null;
          }

          // Apply minimum score filter
          if (matchData.score < minScore) {
            return null;
          }

          return {
            user: {
              _id: matchUser._id,
              username: matchUser.username,
              fullName: matchUser.fullName,
              bio: matchUser.bio,
              avatar: matchUser.avatar,
              skills: matchUser.skills,
              xp: matchUser.xp,
              level: matchUser.level,
              githubData: matchUser.githubData
            },
            score: matchData.score,
            breakdown: matchData.breakdown,
            complementarySkills: match.complementarySkills || [],
            commonSkills: match.commonSkills || [],
            matchedAt: new Date()
          };
        } catch (error) {
          logger.error(`Error processing match for user ${match.userId}:`, error);
          return null;
        }
      });

      // Use allSettled to handle individual failures gracefully
      const results = await Promise.allSettled(matchPromises);
      
      const validMatches = results
        .filter(result => result.status === 'fulfilled' && result.value !== null)
        .map(result => result.value)
        .sort((a, b) => b.score - a.score)
        .slice(0, safeLimit);

      logger.info(`Found ${validMatches.length} valid matches for user: ${userId}`);

      return validMatches;
    } catch (error) {
      logger.error('Error finding matches:', {
        userId,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Create a match request from one user to another
   * @param {string} fromUserId - Requesting user ID
   * @param {string} toUserId - Target user ID
   * @param {string} message - Optional message
   * @returns {Promise<Object>} Match request result
   * @security Prevents self-matching
   * @security Validates both users exist
   */
  async requestMatch(fromUserId, toUserId, message = '') {
    try {
      // Input validation
      if (!fromUserId || !toUserId) {
        throw new ValidationError('Both user IDs are required');
      }

      // Prevent self-matching
      if (fromUserId.toString() === toUserId.toString()) {
        throw new ValidationError('Cannot match with yourself');
      }

      // Sanitize message
      const sanitizedMessage = typeof message === 'string' 
        ? message.trim().substring(0, 500) // Limit message length
        : '';

      logger.info(`Match request: ${fromUserId} -> ${toUserId}`);

      // Fetch both users in parallel
      const [fromUser, toUser] = await Promise.all([
        User.findById(fromUserId),
        User.findById(toUserId)
      ]);

      if (!fromUser) {
        throw new NotFoundError('Requesting user not found');
      }

      if (!toUser) {
        throw new NotFoundError('Target user not found');
      }

      // Check if target user is active
      if (!toUser.isActive) {
        throw new ValidationError('Target user is not active');
      }

      // Check if match request already exists
      const existingMatch = fromUser.matchHistory?.find(
        h => h.matchedUserId?.toString() === toUserId.toString() &&
             h.status === 'pending'
      );

      if (existingMatch) {
        throw new ValidationError('Match request already pending');
      }

      // Calculate match score
      const matchScore = calculateMatchScore(fromUser, toUser);

      // Create match data
      const matchData = {
        matchedUserId: toUserId,
        matchScore: matchScore.score,
        status: 'pending',
        message: sanitizedMessage,
        matchedAt: new Date()
      };

      // Update requesting user's match history
      await User.findByIdAndUpdate(
        fromUserId,
        { 
          $push: { matchHistory: matchData },
          $inc: { 'statistics.totalMatches': 1 }
        },
        { new: true }
      );

      // Optionally notify target user (implement notification service)
      // await notificationService.notifyMatchRequest(toUserId, fromUserId);

      logger.info(`Match request created: ${fromUserId} -> ${toUserId}`);

      return { 
        success: true, 
        matchData: {
          ...matchData,
          targetUser: {
            _id: toUser._id,
            username: toUser.username,
            fullName: toUser.fullName,
            avatar: toUser.avatar
          }
        }
      };
    } catch (error) {
      logger.error('Error requesting match:', {
        fromUserId,
        toUserId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get users with similar skills (for mentorship matching)
   * @param {string} userId - User ID
   * @param {number} limit - Maximum results
   * @returns {Promise<Array>} Similar users
   * @performance Optimized query with projection
   */
  async getSimilarUsers(userId, limit = 10) {
    try {
      // Input validation
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const safeLimit = Math.max(1, Math.min(limit, 50));

      logger.debug(`Finding similar users for: ${userId}`);

      // Get similar users from Neo4j
      const similarUsers = await skillGraphService.findSimilarUsers(
        userId,
        safeLimit * 2
      ).catch(error => {
        logger.error('Error fetching similar users from Neo4j:', error);
        return [];
      });

      if (similarUsers.length === 0) {
        return [];
      }

      // Enrich with MongoDB data
      const enrichedUsers = await Promise.allSettled(
        similarUsers.map(async (similar) => {
          try {
            const user = await User.findById(similar.userId)
              .select('username fullName bio avatar skills xp level githubData')
              .lean();

            if (!user || !user.isActive) {
              return null;
            }

            return {
              ...user,
              commonSkills: similar.commonSkills || 0,
              matchingSkills: similar.skills || []
            };
          } catch (error) {
            logger.error(`Error enriching similar user ${similar.userId}:`, error);
            return null;
          }
        })
      );

      const validUsers = enrichedUsers
        .filter(result => result.status === 'fulfilled' && result.value !== null)
        .map(result => result.value)
        .slice(0, safeLimit);

      return validUsers;
    } catch (error) {
      logger.error('Error finding similar users:', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Update match status (accept, reject, complete)
   * @param {string} userId - User ID
   * @param {string} matchId - Match history ID
   * @param {string} newStatus - New status
   * @returns {Promise<Object>} Updated match
   * @security Validates user owns the match
   */
  async updateMatchStatus(userId, matchId, newStatus) {
    try {
      // Input validation
      if (!userId || !matchId) {
        throw new ValidationError('User ID and Match ID are required');
      }

      const validStatuses = ['accepted', 'rejected', 'completed'];
      if (!validStatuses.includes(newStatus)) {
        throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      logger.info(`Updating match status: ${matchId} -> ${newStatus}`);

      const user = await User.findOne({
        _id: userId,
        'matchHistory._id': matchId
      });

      if (!user) {
        throw new NotFoundError('Match not found');
      }

      // Update match status
      const match = user.matchHistory.id(matchId);
      match.status = newStatus;

      // Update statistics
      if (newStatus === 'completed') {
        user.statistics.successfulMatches += 1;
      }

      await user.save();

      logger.info(`Match status updated successfully: ${matchId}`);

      return {
        success: true,
        match: match
      };
    } catch (error) {
      logger.error('Error updating match status:', error);
      throw error;
    }
  }

  /**
   * Get match statistics for analytics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Match statistics
   */
  async getMatchStatistics(userId) {
    try {
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const user = await User.findById(userId).select('statistics matchHistory');

      if (!user) {
        throw new NotFoundError('User');
      }

      const matchHistory = user.matchHistory || [];

      const stats = {
        total: matchHistory.length,
        pending: matchHistory.filter(m => m.status === 'pending').length,
        accepted: matchHistory.filter(m => m.status === 'accepted').length,
        rejected: matchHistory.filter(m => m.status === 'rejected').length,
        completed: matchHistory.filter(m => m.status === 'completed').length,
        averageScore: matchHistory.length > 0
          ? matchHistory.reduce((sum, m) => sum + (m.matchScore || 0), 0) / matchHistory.length
          : 0,
        successRate: user.statistics.totalMatches > 0
          ? (user.statistics.successfulMatches / user.statistics.totalMatches * 100).toFixed(2)
          : 0
      };

      return stats;
    } catch (error) {
      logger.error('Error getting match statistics:', error);
      throw error;
    }
  }
}

module.exports = new MatchService();