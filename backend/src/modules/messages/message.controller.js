const mongoose = require('mongoose');
const Message = require('./message.model');
const { asyncHandler } = require('../../common/middleware/errorHandler');

exports.sendMessage = asyncHandler(async (req, res) => {
    const { recipientId, content } = req.body;
    const senderId = req.user.id || req.user._id || req.user.userId;

    if (!recipientId || !content) {
        return res.status(400).json({ success: false, error: "Recipient and content are required" });
    }

    const newMessage = await Message.create({
        sender: senderId,
        recipient: recipientId,
        content
    });

    // Populate sender details for immediate frontend display
    await newMessage.populate('sender', 'username avatar fullName');

    res.status(201).json({ success: true, data: newMessage });
});

exports.getConversation = asyncHandler(async (req, res) => {
    const { userId } = req.params; // The other user in the conversation
    const myId = req.user.id || req.user._id || req.user.userId;

    const messages = await Message.find({
        $or: [
            { sender: myId, recipient: userId },
            { sender: userId, recipient: myId }
        ]
    })
        .sort({ createdAt: 1 }) // Oldest first for chat history
        .populate('sender', 'username avatar fullName')
        .populate('recipient', 'username avatar fullName');

    res.status(200).json({ success: true, count: messages.length, data: messages });
});

exports.markAsRead = asyncHandler(async (req, res) => {
    const { senderId } = req.body;
    const myId = req.user.id || req.user._id || req.user.userId;

    await Message.updateMany(
        { sender: senderId, recipient: myId, read: false },
        { read: true }
    );

    res.status(200).json({ success: true, message: "Messages marked as read" });
});

exports.getUnreadCount = asyncHandler(async (req, res) => {
    const myId = req.user.id || req.user._id || req.user.userId;

    // Aggregate unread messages by sender
    const unreadStats = await Message.aggregate([
        {
            $match: {
                recipient: new mongoose.Types.ObjectId(myId),
                read: false
            }
        },
        { $sort: { createdAt: -1 } },
        {
            $group: {
                _id: "$sender",
                count: { $sum: 1 },
                latestMessage: { $first: "$$ROOT" }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'senderDetails'
            }
        },
        { $unwind: "$senderDetails" },
        {
            $project: {
                sender: {
                    _id: "$senderDetails._id",
                    username: "$senderDetails.username",
                    avatar: "$senderDetails.avatar",
                    fullName: "$senderDetails.fullName"
                },
                count: 1,
                latestContent: "$latestMessage.content",
                latestCreatedAt: "$latestMessage.createdAt"
            }
        },
        { $sort: { latestCreatedAt: -1 } }
    ]);

    const totalUnread = unreadStats.reduce((acc, curr) => acc + curr.count, 0);

    res.status(200).json({
        success: true,
        count: totalUnread,
        details: unreadStats
    });
});
