const mongoose = require('mongoose');

const skillEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillName: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    enum: ['DECAY', 'PRACTICE', 'PROJECT_COMPLETION', 'MANUAL_UPDATE'],
    required: true
  },
  delta: {
    type: Number, // e.g., -0.005 for decay, +0.1 for project
    required: true
  },
  currentGravity: {
    type: Number, // The resulting gravity score after this event
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for quick trajectory lookup
skillEventSchema.index({ userId: 1, skillName: 1, timestamp: -1 });

module.exports = mongoose.model('SkillEvent', skillEventSchema);