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

  requestMatch = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { message } = req.body;

    const result = await matchService.requestMatch(
      req.user.userId,
      userId,
      message
    );

    await userService.addUserXP(req.user.userId, 5);

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
