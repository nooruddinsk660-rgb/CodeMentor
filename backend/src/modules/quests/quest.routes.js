const express = require('express');
const router = express.Router();
const questController = require('./quest.controller');
const { authMiddleware } = require('../../common/middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', questController.getQuests);
router.post('/', questController.createQuest);
router.post('/:questId/complete', questController.completeQuest);
router.post('/:questId/apply', questController.applyForQuest);
router.post('/:questId/accept', questController.acceptApplicant);
router.put('/:questId', questController.updateQuest);
router.delete('/:questId', questController.deleteQuest);

module.exports = router;
