const Skill = require("./skill.model");
const { asyncHandler } = require("../../common/middleware/errorHandler");
const aiService = require("../ai/ai.service");
const User = require("../users/user.model");
// GET /skills  → fetch all skills
exports.getAllSkills = asyncHandler(async (req, res) => {
  const skills = await Skill.find().sort({ intensity: -1 });

  res.status(200).json({
    success: true,
    data: skills,
  });
});

// GET /skills/search?q=react
exports.searchSkills = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      error: "Search query is required",
    });
  }

  const skills = await Skill.find({
    name: { $regex: q, $options: "i" },
  }).limit(20);

  res.status(200).json({
    success: true,
    data: skills,
  });
});

exports.getDashboardIntelligence = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId || req.user._id; 
    
    console.log("🔍 Looking for User ID:", userId); // Debug Log
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: 'User not found' });

    // 1. Get Trajectory Analysis from AI
    // We pass the full skill objects, including the gravityScore we calculated earlier
    const intelligence = await aiService.analyzeSkillTrajectory(
      user.skills, 
      "Senior Full Stack Engineer" // This could be dynamic based on user.preferences
    );

    // 2. Return combined data
    res.json({
      success: true,
      data: {  // <--- Wrapper required by your frontend client.js
        stats: {
          xp: user.xp,
          streak: user.dailyLog?.currentStreak || 0,
          skillCount: user.skills.length
        },
        intelligence: intelligence 
      }
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};
