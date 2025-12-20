const express = require('express');
const aiController = require('./ai.controller');
const { authMiddleware } = require('../../common/middleware/authMiddleware');

const router = express.Router();

router.post('/embed', authMiddleware, aiController.generateEmbedding);
router.post('/similarity', authMiddleware, aiController.analyzeSimilarity);
router.post('/recommend', authMiddleware, aiController.getRecommendations);
router.get('/health', aiController.healthCheck);

module.exports = router;