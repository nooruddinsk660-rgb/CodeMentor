const matchService = require('./match.service');
const userService = require('../users/user.service');
const { asyncHandler } = require('../../common/middleware/errorHandler');

class MatchController {
  getRecommendations = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const minScore = parseFloat(req.query.minScore) || 0.3;

    const matches = await matchService.findMatches(req.user.userId, {
      limit,
      minScore
    });

    res.status(200).json({
      success: true,
      data: matches
    });
  });

  // ✅ FIX: Get targetUserId from the BODY, not the URL params
  requestMatch = asyncHandler(async (req, res) => {
    const { targetUserId, message } = req.body; // <--- CHANGED HERE

    if (!targetUserId) {
      return res.status(400).json({ success: false, error: "Target User ID is required" });
    }

    const result = await matchService.requestMatch(
      req.user.userId,
      targetUserId,
      message
    );

    // Award XP for taking initiative
    try {
        await userService.addUserXP(req.user.userId, 5);
    } catch (e) { console.error("XP Error", e); }

    res.status(200).json({
      success: true,
      message: 'Match request sent',
      data: result
    });
  });

  getComplementaryUsers = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const matches = await matchService.findMatches(req.user.userId, { limit });

    res.status(200).json({
      success: true,
      data: matches
    });
  });

  getSimilarUsers = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const users = await matchService.getSimilarUsers(req.user.userId, limit);

    res.status(200).json({
      success: true,
      data: users
    });
  });
}

module.exports = new MatchController();