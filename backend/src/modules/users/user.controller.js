const userService = require('./user.service');
const skillGraphService = require('../../common/utils/skillGraph');
const { asyncHandler } = require('../../common/middleware/errorHandler');
const Joi = require('joi');
const logger = require('../../core/config/loggerConfig');

const updateUserSchema = Joi.object({
  fullName: Joi.string().min(2).max(100),
  bio: Joi.string().max(500),
  avatar: Joi.string().uri(),
  preferences: Joi.object({
    learningGoals: Joi.array().items(Joi.string()),
    availableHours: Joi.number().min(0).max(168),
    timezone: Joi.string(),
    preferredLanguages: Joi.array().items(Joi.string()),
    interests: Joi.array().items(Joi.string())
  }),
  settings: Joi.object({
    emailNotifications: Joi.boolean(),
    matchNotifications: Joi.boolean(),
    visibility: Joi.string().valid('public', 'private', 'connections')
  })
});

const updateSkillsSchema = Joi.object({
  skills: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      proficiency: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert'),
      category: Joi.string(),
      source: Joi.string().valid('github', 'manual', 'inferred'),
      yearsOfExperience: Joi.number().min(0)
    })
  ).required()
});

class UserController {
  getMe = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.user.userId);
    
    res.status(200).json({
      success: true,
      data: user
    });
  });

  getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await userService.getUserById(userId);
    
    res.status(200).json({
      success: true,
      data: user
    });
  });

  getUserByUsername = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const user = await userService.getUserByUsername(username);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  });

  updateUser = asyncHandler(async (req, res) => {
    const { error, value } = updateUserSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const user = await userService.updateUser(req.user.userId, value);
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  });

  updateSkills = asyncHandler(async (req, res) => {
    const { error, value } = updateSkillsSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const user = await userService.updateUserSkills(req.user.userId, value.skills);
    
    // Award XP for updating skills
    await userService.addUserXP(req.user.userId, 10);
    
    res.status(200).json({
      success: true,
      message: 'Skills updated successfully',
      data: user
    });
  });

  getUserSkillGraph = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const targetUserId = userId || req.user.userId;
    
    const skillGraph = await skillGraphService.getUserSkillGraph(targetUserId);
    
    if (!skillGraph) {
      return res.status(404).json({
        success: false,
        error: 'Skill graph not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: skillGraph
    });
  });

  getSkillRecommendations = asyncHandler(async (req, res) => {
    const recommendations = await skillGraphService.getSkillRecommendations(
      req.user.userId,
      parseInt(req.query.limit) || 5
    );
    
    res.status(200).json({
      success: true,
      data: recommendations
    });
  });

  searchUsers = asyncHandler(async (req, res) => {
    const { q, skills, minXP, page = 1, limit = 20 } = req.query;
    
    const filters = {};
    if (skills) {
      filters.skills = Array.isArray(skills) ? skills : [skills];
    }
    if (minXP) {
      filters.minXP = parseInt(minXP);
    }
    
    const result = await userService.searchUsers(
      q,
      filters,
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json({
      success: true,
      data: result.users,
      pagination: result.pagination
    });
  });

  getTopUsers = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const users = await userService.getTopUsers(limit);
    
    res.status(200).json({
      success: true,
      data: users
    });
  });

  getUserStatistics = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const targetUserId = userId || req.user.userId;
    
    const statistics = await userService.getUserStatistics(targetUserId);
    
    res.status(200).json({
      success: true,
      data: statistics
    });
  });

  updateMatchFeedback = asyncHandler(async (req, res) => {
    const { matchId } = req.params;
    const { status, feedback } = req.body;
    
    if (!['accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }
    
    const user = await userService.updateMatchStatus(
      req.user.userId,
      matchId,
      status,
      feedback
    );
    
    res.status(200).json({
      success: true,
      message: 'Match feedback updated',
      data: user
    });
  });

  deleteAccount = asyncHandler(async (req, res) => {
    await userService.deleteUser(req.user.userId);
    
    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  });
}

module.exports = new UserController();