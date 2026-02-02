const express = require('express');
const router = express.Router();
const roadmapController = require('./roadmap.controller');
const { authMiddleware } = require('../../common/middleware/authMiddleware');

router.get('/:careerId', authMiddleware, roadmapController.getRoadmap);
router.post('/start', authMiddleware, roadmapController.startMission);
router.post('/complete', authMiddleware, roadmapController.completeMission);

module.exports = router;
