const aiService = require('./ai.service');
const { asyncHandler } = require('../../common/middleware/errorHandler');

class AIController {
  generateEmbedding = asyncHandler(async (req, res) => {
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        error: 'Skills must be an array'
      });
    }

    const embedding = await aiService.generateEmbedding(skills);

    res.status(200).json({
      success: true,
      data: { embedding }
    });
  });

  analyzeSimilarity = asyncHandler(async (req, res) => {
    const { skills1, skills2 } = req.body;

    if (!Array.isArray(skills1) || !Array.isArray(skills2)) {
      return res.status(400).json({
        success: false,
        error: 'Both skills1 and skills2 must be arrays'
      });
    }

    const similarity = await aiService.analyzeSkillSimilarity(skills1, skills2);

    res.status(200).json({
      success: true,
      data: { similarity }
    });
  });

  getRecommendations = asyncHandler(async (req, res) => {
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        error: 'Skills must be an array'
      });
    }

    const recommendations = await aiService.generateSkillRecommendations(skills);

    res.status(200).json({
      success: true,
      data: { recommendations }
    });
  });

  healthCheck = asyncHandler(async (req, res) => {
    const isHealthy = await aiService.healthCheck();

    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      message: isHealthy ? 'AI service is healthy' : 'AI service is down'
    });
  });

  analyzeTrajectory = asyncHandler(async (req, res) => {
    const { skills, targetRole } = req.body;
    // Extract lastLogin from authenticated user found in middleware
    const lastActivity = req.user.lastLogin || req.user.updatedAt;

    // Pass to service
    const analysis = await aiService.analyzeSkillTrajectory(skills, targetRole, lastActivity);

    res.status(200).json({
      success: true,
      data: analysis
    });
  });

  // Track user progress on roadmap
  startMission = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    const User = require('../users/user.model');
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    if (!user.missions) {
      user.missions = [];
    }

    // Check if mission already exists (active)
    const existing = user.missions.find(m => m.title === title && m.status === 'active');
    if (existing) {
      return res.status(400).json({ success: false, error: 'Mission already in progress' });
    }

    user.missions.push({
      title,
      description,
      status: 'active',
      progress: 0,
      startedAt: new Date()
    });

    await user.save();

    res.status(200).json({
      success: true,
      data: user.missions
    });
  });
  // Interview Arena Methods
  interviewGenerate = asyncHandler(async (req, res) => {
    const { difficulty, topic } = req.body;
    const result = await aiService.generateInterviewQuestion({ difficulty, topic });
    res.status(200).json({ success: true, ...result });
  });

  interviewEvaluate = asyncHandler(async (req, res) => {
    const { code, language, questionId, difficulty } = req.body;

    // 1. Get Evaluation from Python Service
    const result = await aiService.evaluateInterviewSubmission({ code, language, questionId });

    // 2. XP Logic (If Accepted)
    let xpEarned = 0;
    if (result.status === 'accepted') {
      const xpMap = { easy: 10, medium: 30, hard: 50 };
      const diffKey = (difficulty || 'medium').toLowerCase();
      xpEarned = xpMap[diffKey] || 30;

      const User = require('../users/user.model');
      const user = await User.findById(req.user.userId);
      if (user) {
        user.addXP(xpEarned);
        await user.save();
      }
    }

    res.status(200).json({
      success: true,
      ...result,
      xpEarned,
      newTotalXP: req.user.xp + xpEarned
    });
  });

  interviewChat = asyncHandler(async (req, res) => {
    const { message, context } = req.body;
    const result = await aiService.chatWithInterviewer({ message, context });
    res.status(200).json({ success: true, ...result });
  });
}

module.exports = new AIController();
