const Skill = require("./skill.model");
const { asyncHandler } = require("../../common/middleware/errorHandler");

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
