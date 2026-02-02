const mongoose = require('mongoose');

const missionParameterSchema = new mongoose.Schema({
    step: { type: Number, required: true },
    label: { type: String, required: true },
    description: String,
    topics: [{ type: String }],
    difficulty: { type: Number, default: 1 }, // used for calculating Gravity
    complexity: { type: Number, default: 1 }, // used for calculating Gravity
    requires: [{ type: Number }], // Array of step numbers that must be completed
    xp_reward: { type: Number, default: 100 }
});

const roadmapSchema = new mongoose.Schema({
    career_id: { type: String, required: true, unique: true }, // e.g., 'fullstack', 'ai_ml'
    title: { type: String, required: true },
    description: String,
    missions: [missionParameterSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Roadmap', roadmapSchema);
