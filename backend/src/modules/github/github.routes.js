const express = require('express');
const githubController = require('./github.controller');
const { authMiddleware, optionalAuth } = require('../../common/middleware/authMiddleware');

const router = express.Router();

router.post('/analyze/:username', authMiddleware, githubController.analyzeUser);
router.get('/repos/:username', optionalAuth, githubController.getRepositories);
router.get('/profile/:username', optionalAuth, githubController.getProfile);
router.get('/search', optionalAuth, githubController.searchRepositories);

module.exports = router;
