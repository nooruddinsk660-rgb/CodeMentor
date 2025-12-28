const dailyService = require('./daily.service');
const { asyncHandler } = require('../../common/middleware/errorHandler');

class DailyController {
  
  // GET /api/daily/briefing
  getBriefing = asyncHandler(async (req, res) => {
    // 1. Get the quest/streak data
    // Note: ensure req.user.userId matches your JWT payload structure
    const userId = req.user.userId || req.user.id || req.user._id;
    const briefing = await dailyService.getDailyBriefing(userId);
    
    // 2. Get the heatmap data
    const matrix = await dailyService.getActivityHeatmap(userId);

    res.status(200).json({
      success: true,
      data: {
        ...briefing,
        matrix // <--- Pass this to frontend so CodePulseMatrix can use it
      }
    });
  });

  // POST /api/daily/quest/complete
  completeQuest = asyncHandler(async (req, res) => {
    const userId = req.user.userId || req.user.id;
    const { xp } = req.body; // Get XP from frontend request

    // Pass xp to the service
    const result = await dailyService.completeQuest(userId, xp);
    
    res.status(200).json({
      success: true,
      data: result
    });
  });
}

module.exports = new DailyController();