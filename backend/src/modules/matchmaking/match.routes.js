const express = require('express');
const matchController = require('./match.controller');
const { authMiddleware } = require('../../common/middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

// Alias for frontend compatibility
router.get('/browse', matchController.getRecommendations);
router.get('/recommendations', matchController.getRecommendations);
router.get('/complementary', matchController.getComplementaryUsers);
router.get('/similar', matchController.getSimilarUsers);
router.post('/request', matchController.requestMatch);

module.exports = router;
