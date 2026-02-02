const express = require('express');
const router = express.Router();
const connectionController = require('./connection.controller');
const { authMiddleware } = require('../../common/middleware/authMiddleware');

router.post('/request', authMiddleware, connectionController.sendRequest);
// router.get('/', authMiddleware, connectionController.getConnections);

module.exports = router;
