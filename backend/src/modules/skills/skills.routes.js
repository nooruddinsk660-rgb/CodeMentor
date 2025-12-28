const express = require("express");
const { authMiddleware } = require("../../common/middleware/authMiddleware");
const skillsController = require("./skills.controller");
const { runGravityCycle } = require("./gravity.service")

const router = express.Router();

router.get("/", authMiddleware, skillsController.getAllSkills);
router.get("/search", authMiddleware, skillsController.searchSkills);
router.get('/intelligence', authMiddleware, skillsController.getDashboardIntelligence);

router.post("/force-gravity", authMiddleware, async (req, res) => {
  try {
    const result = await runGravityCycle();
    res.json({ 
      success: true, 
      message: "Gravity cycle executed successfully.",
      data: result 
    });
  } catch (error) {
    console.error("Gravity Cycle Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
