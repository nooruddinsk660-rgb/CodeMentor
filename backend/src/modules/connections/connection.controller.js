const Connection = require('./connection.model');
const User = require('../users/user.model');
const { NotFoundError, BadRequestError } = require('../../common/middleware/errorHandler');
const asyncHandler = require('../../common/middleware/asyncHandler'); // Assuming this exists

const connectionController = {
    // Send a connection request
    sendRequest: asyncHandler(async (req, res) => {
        const { recipientId } = req.body;
        const requesterId = req.user.userId;

        if (requesterId === recipientId) {
            throw new BadRequestError('Cannot connect with yourself');
        }

        const recipient = await User.findById(recipientId);
        if (!recipient) {
            throw new NotFoundError('Recipient user');
        }

        // Check if connection already exists
        const existingConnection = await Connection.findOne({
            $or: [
                { requester: requesterId, recipient: recipientId },
                { requester: recipientId, recipient: requesterId }
            ]
        });

        if (existingConnection) {
            if (existingConnection.status === 'pending') {
                return res.status(200).json({ success: true, message: 'Connection request already pending' });
            }
            if (existingConnection.status === 'accepted') {
                return res.status(200).json({ success: true, message: 'Already connected' });
            }
        }

        const newConnection = await Connection.create({
            requester: requesterId,
            recipient: recipientId,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Connection request sent successfully',
            data: newConnection
        });
    }),

    // Get my connections (pending or accepted)
    getConnections: asyncHandler(async (req, res) => {
        // Implementation for listing connections if needed later
        res.json({ success: true, message: "Not implemented yet" });
    })
};

module.exports = connectionController;
