const express = require('express');
const router = express.Router();
const messageController = require('./message.controller');
const { authMiddleware } = require('../../common/middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', messageController.sendMessage);
router.get('/unread', messageController.getUnreadCount);
router.get('/:userId', messageController.getConversation);
router.put('/read', messageController.markAsRead);

module.exports = router;
