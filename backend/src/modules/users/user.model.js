const mongoose = require('mongoose');

/* FIND THIS SECTION IN YOUR CODE */
const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  proficiency: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  },
  
  /* --- ADD THESE NEW FIELDS --- */
  logo: {
    type: String,
    // THE MAGIC: Auto-generate logo URL if missing
    default: function() {
      if (!this.name) return '';
      // cleans name (e.g. "React.js" -> "react") and builds URL
      return `https://cdn.simpleicons.org/${this.name.replace(/\s|\.|js|script/gi, '').toLowerCase()}`;
    }
  },
  themeColor: {
    type: String,
    default: 'from-blue-400 to-cyan-300' // Default "Holographic" Blue
  },
  /* --------------------------- */

  category: {
    type: String,
    default: 'general'
  },
  source: {
    type: String,
    enum: ['github', 'manual', 'inferred'],
    default: 'github'
  },
  yearsOfExperience: {
    type: Number,
    default: 0
  }
}, { 
  _id: true, 
  /* IMPORTANT: Enable virtuals so 'intensity' is sent to frontend */
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true } 
});

/* --- ADD THIS VIRTUAL PROPERTY --- */
// Automatically converts text proficiency to numbers for the progress bar
skillSchema.virtual('intensity').get(function() {
  const scores = {
    beginner: 30,
    intermediate: 60,
    advanced: 85,
    expert: 100
  };
  return scores[this.proficiency] || 50;
});

const githubDataSchema = new mongoose.Schema({
  username: String,
  profileUrl: String,
  avatarUrl: String,
  bio: String,
  company: String,
  location: String,
  publicRepos: Number,
  followers: Number,
  following: Number,
  totalStars: Number,
  totalForks: Number,
  topLanguages: [{
    language: String,
    percentage: Number,
    linesOfCode: Number
  }],
  recentActivity: {
    commits: Number,
    pullRequests: Number,
    issues: Number
  },
  lastAnalyzed: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const matchHistorySchema = new mongoose.Schema({
  matchedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matchScore: Number,
  matchedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  },
  feedback: String
}, { _id: false });

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    select: false
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  githubAccessToken: {
    type: String,
    select: false
  },
  fullName: String,
  bio: String,
  avatar: String,
  
  skills: [skillSchema],
  
  githubData: githubDataSchema,
  
  skillEmbedding: {
    type: [Number],
    default: []
  },
  
  xp: {
    type: Number,
    default: 0,
    min: 0
  },
  
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  
  matchHistory: [matchHistorySchema],
  
  preferences: {
    learningGoals: [String],
    availableHours: Number,
    timezone: String,
    preferredLanguages: [String],
    interests: [String]
  },
  
  statistics: {
    totalMatches: {
      type: Number,
      default: 0
    },
    successfulMatches: {
      type: Number,
      default: 0
    },
    projectsCompleted: {
      type: Number,
      default: 0
    },
    hoursContributed: {
      type: Number,
      default: 0
    }
  },

   activityLog: [
    {
      date: {
        type: Date,
        default: Date.now,
      }
    }
  ],
  
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  lastLogin: Date,
  
  settings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    matchNotifications: {
      type: Boolean,
      default: true
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'connections'],
      default: 'public'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
userSchema.index({ 'skills.name': 1 });
userSchema.index({ xp: -1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1, isVerified: 1 });

// Virtual for skill count
userSchema.virtual('skillCount').get(function() {
  return this.skills ? this.skills.length : 0;
});

// Calculate level based on XP
userSchema.methods.calculateLevel = function() {
  // Level formula: sqrt(xp / 100)
  this.level = Math.floor(Math.sqrt(this.xp / 100)) + 1;
  return this.level;
};

// Add XP and recalculate level
userSchema.methods.addXP = function(amount) {
  this.xp += amount;
  this.calculateLevel();
  return this.xp;
};

// Check if user has a specific skill
userSchema.methods.hasSkill = function(skillName) {
  return this.skills.some(skill => 
    skill.name.toLowerCase() === skillName.toLowerCase()
  );
};

// Get skills by category
userSchema.methods.getSkillsByCategory = function(category) {
  return this.skills.filter(skill => skill.category === category);
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Pre-save middleware
userSchema.pre('save', function(next) {
  if (this.isModified('xp')) {
    this.calculateLevel();
  }
  next();
});

// Remove sensitive data from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.githubAccessToken;
  delete obj.__v;
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;