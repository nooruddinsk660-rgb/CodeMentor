const express = require('express');
const dailyController = require('./daily.controller');
const { authMiddleware } = require('../../common/middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/briefing', dailyController.getBriefing);
router.post('/quest/complete', dailyController.completeQuest);

module.exports = router;