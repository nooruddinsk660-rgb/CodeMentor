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
}

module.exports = new AIController();
