const matchService = require('./match.service');
const userService = require('../users/user.service');
const { asyncHandler } = require('../../common/middleware/errorHandler');

class MatchController {
  getRecommendations = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const minScore = parseFloat(req.query.minScore) || 0.3;
    const mode = req.query.mode || 'project'; // Default to 'project' (complementary)

    const matches = await matchService.findMatches(req.user.userId, {
      limit,
      minScore,
      mode
    });

    res.status(200).json({
      success: true,
      data: matches
    });
  });

  // ✅ FIX: Get targetUserId from the BODY, not the URL params
  requestMatch = asyncHandler(async (req, res) => {
    const { targetUserId, message } = req.body;
    const userId = req.user.userId;

    if (!targetUserId) {
      return res.status(400).json({ success: false, error: "Target User ID is required" });
    }

    // 1. DAILY LIMIT CHECK (Scarcity creates value)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check how many matches user requested today (using matchHistory)
    const user = await userService.getUserById(userId);
    const dailyRequests = user.matchHistory.filter(m =>
      new Date(m.matchedAt) >= today && m.status === 'pending'
    ).length;

    const DAILY_LIMIT = 5;
    if (dailyRequests >= DAILY_LIMIT) {
      return res.status(429).json({
        success: false,
        error: "You've reached your connection limit for today. Come back tomorrow!",
        isLimitReached: true
      });
    }

    // 2. EXECUTE MATCH REQUEST
    const result = await matchService.requestMatch(
      userId,
      targetUserId,
      message
    );

    // 3. GAMIFICATION ENGINE (Variable Rewards)
    let xpAwarded = 15; // Base XP increased from 5
    let streakBonus = false;

    try {
      // Bonus for first connection of the day
      if (dailyRequests === 0) {
        xpAwarded += 50; // "First Move" Bonus
        streakBonus = true;
      }

      await userService.addUserXP(userId, xpAwarded);

      // **CRITICAL**: Keep the daily streak alive
      await userService.recordActivity(userId);

    } catch (e) { console.error("Gamification Error", e); }

    // 4. NOTIFICATION TRIGGER (Simulation)
    // In a real app, this emits a Socket.io event to the targetUser
    // notificationService.send(targetUserId, 'new_match_request', user.username);

    res.status(200).json({
      success: true,
      message: 'Connection signal sent',
      data: {
        ...result,
        rewards: {
          xp: xpAwarded,
          streakBonus,
          remainingRequests: DAILY_LIMIT - (dailyRequests + 1)
        }
      }
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