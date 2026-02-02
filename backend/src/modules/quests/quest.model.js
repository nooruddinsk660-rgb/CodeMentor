const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
    xpReward: { type: Number, default: 100 },

    // The user who posted the quest
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    applicants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    status: {
        type: String,
        enum: ['pending', 'active', 'in_progress', 'completed', 'failed'],
        default: 'active'
    },

    resources: {
        repoUrl: String,
        kanbanBoardUrl: String
    },

    startDate: { type: Date, default: Date.now },
    completedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Quest', questSchema);
