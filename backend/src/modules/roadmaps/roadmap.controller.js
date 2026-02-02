const Roadmap = require('./roadmap.model');
const User = require('../users/user.model');
const { asyncHandler } = require('../../common/middleware/errorHandler');

class RoadmapController {
    // Get roadmap for a specific career path
    getRoadmap = asyncHandler(async (req, res) => {
        const { careerId } = req.params;

        const roadmap = await Roadmap.findOne({ career_id: careerId });
        if (!roadmap) {
            return res.status(404).json({ success: false, error: 'Roadmap not found' });
        }

        // Get user progress to calculate locks
        const user = await User.findById(req.user.userId);
        const completedMissionIds = user.missions
            .filter(m => m.status === 'completed')
            .map(m => m.mission_id);

        // Map missions with status
        const missionsWithStatus = roadmap.missions.map(mission => {
            const isCompleted = completedMissionIds.includes(String(mission.step)); // Using step as ID for now

            // Check if unlocked: All required steps must be completed
            let isLocked = false;
            if (mission.requires && mission.requires.length > 0) {
                const requirementsMet = mission.requires.every(reqStep =>
                    completedMissionIds.includes(String(reqStep))
                );
                isLocked = !requirementsMet;
            }

            // If already completed, it's not locked (conceptually)
            if (isCompleted) isLocked = false;

            // Check for active status
            const activeMission = user.missions.find(m => m.mission_id === String(mission.step) && m.status === 'active');

            return {
                ...mission.toObject(),
                status: isCompleted ? 'completed' : (activeMission ? 'active' : (isLocked ? 'locked' : 'available'))
            };
        });

        res.status(200).json({
            success: true,
            data: {
                ...roadmap.toObject(),
                missions: missionsWithStatus
            }
        });
    });

    // Start a mission (Updated for structured roadmap)
    startMission = asyncHandler(async (req, res) => {
        const { careerId, step } = req.body;
        console.log("START MISSION REQUEST:", { careerId, step, userId: req.user.userId });

        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        // Verify roadmap exists
        const roadmap = await Roadmap.findOne({ career_id: careerId });
        if (!roadmap) return res.status(404).json({ success: false, error: 'Roadmap not found' });

        const missionParams = roadmap.missions.find(m => m.step === Number(step));
        if (!missionParams) return res.status(404).json({ success: false, error: 'Mission step not found' });

        // Check prerequisites
        const completedMissionIds = user.missions
            .filter(m => m.status === 'completed')
            .map(m => m.mission_id);

        if (missionParams.requires && missionParams.requires.length > 0) {
            const requirementsMet = missionParams.requires.every(reqStep =>
                completedMissionIds.includes(String(reqStep))
            );
            if (!requirementsMet) {
                return res.status(403).json({ success: false, error: 'Prerequisites not met' });
            }
        }

        // Check if already active/completed
        const existing = user.missions.find(m => m.mission_id === String(step));
        if (existing) {
            console.log("Mission Check:", {
                step,
                mission_id: existing.mission_id,
                status: existing.status,
                match: existing.mission_id === String(step)
            });
        }

        if (existing && existing.status === 'active') {
            return res.status(400).json({ success: false, error: `Mission already in progress (Status: ${existing.status})` });
        }
        if (existing && existing.status === 'completed') {
            return res.status(400).json({ success: false, error: 'Mission already completed' });
        }

        // Initialize missions array if needed (though schema handle default)
        if (!user.missions) user.missions = [];

        user.missions.push({
            mission_id: String(step),
            title: missionParams.label,
            description: missionParams.description,
            status: 'active',
            startedAt: new Date()
        });

        await user.save();

        res.status(200).json({ success: true, data: user.missions });
    });

    // Complete a mission and award Gravity
    completeMission = asyncHandler(async (req, res) => {
        const { careerId, step } = req.body;

        const user = await User.findById(req.user.userId);
        const roadmap = await Roadmap.findOne({ career_id: careerId });
        const missionParams = roadmap.missions.find(m => m.step === Number(step));

        const missionIndex = user.missions.findIndex(m => m.mission_id === String(step) && m.status === 'active');

        if (missionIndex === -1) {
            return res.status(404).json({ success: false, error: 'Active mission not found' });
        }

        // Update mission status
        user.missions[missionIndex].status = 'completed';
        user.missions[missionIndex].completedAt = new Date();
        user.missions[missionIndex].progress = 100;

        // Award Gravity
        const gravityAward = missionParams.xp_reward || 100;
        user.missions[missionIndex].xp_earned = gravityAward;

        // Update global Gravity Index
        user.gravity_index = (user.gravity_index || 0) + gravityAward;

        await user.save();

        res.status(200).json({
            success: true,
            gravity_index: user.gravity_index,
            mission: user.missions[missionIndex]
        });
    });
}

module.exports = new RoadmapController();
