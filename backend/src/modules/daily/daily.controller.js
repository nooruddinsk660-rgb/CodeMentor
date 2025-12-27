const dailyService = require('./daily.service');
const { asyncHandler } = require('../../common/middleware/errorHandler');

class DailyController {
  
  // ✅ FIX 1: Combine the logic. Get Briefing + Matrix in one go.
  getBriefing = asyncHandler(async (req, res) => {
    // 1. Get the quest/streak data
    const briefing = await dailyService.getDailyBriefing(req.user.userId);
    
    // 2. Get the heatmap data
    const matrix = await dailyService.getActivityHeatmap(req.user.userId);

    res.status(200).json({
      success: true,
      data: {
        ...briefing,
        matrix // <--- Pass this to frontend
      }
    });
  });

  // ✅ FIX 2: Actually CALL the service.
  completeQuest = asyncHandler(async (req, res) => {
    // OLD CODE (BROKEN):
    // res.status(200).json({ success: true, message: 'Quest completed! XP Awarded.' });

    // NEW CODE (WORKING):
    // Call the service to save to DB and calculate XP
    const result = await dailyService.completeQuest(req.user.userId);
    
    res.status(200).json({
      success: true,
      data: result // Returns { newXP: 1200, newStreak: 5 }
    });
  });
}

module.exports = new DailyController();