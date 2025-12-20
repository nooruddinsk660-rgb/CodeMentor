const express = require('express');
const matchController = require('./match.controller');
const { authMiddleware } = require('../../common/middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/recommendations', matchController.getRecommendations);
router.get('/complementary', matchController.getComplementaryUsers);
router.get('/similar', matchController.getSimilarUsers);
router.post('/request/:userId', matchController.requestMatch);

module.exports = router;