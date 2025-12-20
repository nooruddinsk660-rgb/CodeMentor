const express = require('express');
const userController = require('./user.controller');
const { authMiddleware } = require('../../common/middleware/authMiddleware');

const router = express.Router();

// Protected routes - require authentication
router.use(authMiddleware);

// Get current user
router.get('/me', userController.getMe);

// Update current user
router.put('/me', userController.updateUser);

// Update user skills
router.put('/me/skills', userController.updateSkills);

// Get user skill graph
router.get('/me/graph', userController.getUserSkillGraph);

// Get skill recommendations
router.get('/me/recommendations', userController.getSkillRecommendations);

// Get user statistics
router.get('/me/statistics', userController.getUserStatistics);

// Update match feedback
router.put('/matches/:matchId', userController.updateMatchFeedback);

// Delete account
router.delete('/me', userController.deleteAccount);

// Search users
router.get('/search', userController.searchUsers);

// Get top users
router.get('/top', userController.getTopUsers);

// Get user by ID
router.get('/:userId', userController.getUserById);

// Get user by username
router.get('/username/:username', userController.getUserByUsername);

// Get user skill graph by ID
router.get('/:userId/graph', userController.getUserSkillGraph);

// Get user statistics by ID
router.get('/:userId/statistics', userController.getUserStatistics);

module.exports = router;