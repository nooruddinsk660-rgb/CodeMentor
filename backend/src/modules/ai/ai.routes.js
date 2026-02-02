const express = require('express');
const aiController = require('./ai.controller');
const { authMiddleware } = require('../../common/middleware/authMiddleware');

const router = express.Router();

router.post('/embed', authMiddleware, aiController.generateEmbedding);
router.post('/similarity', authMiddleware, aiController.analyzeSimilarity);
router.post('/recommend', authMiddleware, aiController.getRecommendations);
router.post('/trajectory', authMiddleware, aiController.analyzeTrajectory);
router.post('/mission/start', authMiddleware, aiController.startMission);
router.post('/interview/generate', authMiddleware, aiController.interviewGenerate);
router.post('/interview/evaluate', authMiddleware, aiController.interviewEvaluate);
router.post('/interview/chat', authMiddleware, aiController.interviewChat);
router.get('/health', aiController.healthCheck);

module.exports = router;