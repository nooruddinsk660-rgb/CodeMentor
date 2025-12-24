const express = require("express");
const { authMiddleware } = require("../../common/middleware/authMiddleware");
const skillsController = require("./skills.controller");

const router = express.Router();

router.get("/", authMiddleware, skillsController.getAllSkills);
router.get("/search", authMiddleware, skillsController.searchSkills);

module.exports = router;
