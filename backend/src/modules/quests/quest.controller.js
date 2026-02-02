const Quest = require('./quest.model');
const { asyncHandler } = require('../../common/middleware/errorHandler');

exports.createQuest = asyncHandler(async (req, res) => {
    const { title, description, difficulty } = req.body;

    // Debug Logs
    console.log("Create Quest Request:", { body: req.body, user: req.user });

    // Robust ID extraction
    const creatorId = req.user.id || req.user._id || req.user.userId;

    if (!creatorId) {
        console.error("Authentication Error: User ID missing from token payload", req.user);
        return res.status(401).json({ success: false, error: "Authentication failed: User ID missing" });
    }

    // Simulate Repo/Kanban creation (keep this for flavor)
    const resources = {
        repoUrl: `https://github.com/orbitdev-quests/${title.replace(/\s+/g, '-').toLowerCase()}`,
        kanbanBoardUrl: `https://boards.orbitdev.ai/quest/${Date.now()}`
    };

    const newQuest = await Quest.create({
        title,
        description,
        difficulty: difficulty || 'intermediate',
        creator: creatorId,
        participants: [],
        resources,
        status: 'active'
    });

    res.status(201).json({ success: true, data: newQuest });
});

exports.getQuests = asyncHandler(async (req, res) => {
    // Populate creator details so frontend can show "Posted by X"
    const quests = await Quest.find({ status: { $ne: 'archived' } })
        .populate('creator', 'username fullName avatar level')
        .populate('applicants', 'username fullName avatar level')
        .populate('assignee', 'username fullName avatar')
        .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: quests.length, data: quests });
});

exports.completeQuest = asyncHandler(async (req, res) => {
    const { questId } = req.params;
    const quest = await Quest.findByIdAndUpdate(questId, {
        status: 'completed',
        completedAt: new Date()
    }, { new: true });

    res.status(200).json({ success: true, data: quest, message: "Quest Completed! XP Awarded." });
});

exports.deleteQuest = asyncHandler(async (req, res) => {
    const { questId } = req.params;
    const userId = req.user.id || req.user._id || req.user.userId;

    const quest = await Quest.findById(questId);
    if (!quest) {
        return res.status(404).json({ success: false, error: "Quest not found" });
    }

    if (quest.creator.toString() !== userId) {
        return res.status(403).json({ success: false, error: "Not authorized to delete this quest" });
    }

    await quest.deleteOne();
    res.status(200).json({ success: true, message: "Quest deleted successfully" });
});

exports.updateQuest = asyncHandler(async (req, res) => {
    const { questId } = req.params;
    const { title, description, difficulty } = req.body;
    const userId = req.user.id || req.user._id || req.user.userId;

    let quest = await Quest.findById(questId);
    if (!quest) {
        return res.status(404).json({ success: false, error: "Quest not found" });
    }

    if (quest.creator.toString() !== userId) {
        return res.status(403).json({ success: false, error: "Not authorized to update this quest" });
    }

    quest = await Quest.findByIdAndUpdate(questId, {
        title,
        description,
        difficulty
    }, { new: true });

    res.status(200).json({ success: true, data: quest });
});

exports.applyForQuest = asyncHandler(async (req, res) => {
    const { questId } = req.params;
    const userId = req.user.id || req.user._id || req.user.userId;

    console.log(`[Quest Apply] User ${userId} applying for Quest ${questId}`);

    const quest = await Quest.findById(questId);
    if (!quest) return res.status(404).json({ success: false, error: "Quest not found" });

    // Robust String Comparison
    const creatorId = quest.creator.toString();
    const currentUserId = String(userId);

    if (creatorId === currentUserId) {
        console.warn(`[Quest Apply] Failed: User ${currentUserId} is creator of Quest ${questId}`);
        return res.status(400).json({ success: false, error: "Cannot apply to your own quest" });
    }

    const alreadyApplied = quest.applicants.some(applicant => String(applicant) === currentUserId);
    if (alreadyApplied) {
        console.warn(`[Quest Apply] Failed: User ${currentUserId} already applied to Quest ${questId}`);
        return res.status(400).json({ success: false, error: "Already applied" });
    }

    quest.applicants.push(userId);
    await quest.save();

    console.log(`[Quest Apply] Success: User ${currentUserId} applied to Quest ${questId}`);
    res.status(200).json({ success: true, message: "Application submitted" });
});

exports.acceptApplicant = asyncHandler(async (req, res) => {
    const { questId } = req.params;
    const { applicantId } = req.body;
    const userId = req.user.id || req.user._id || req.user.userId;

    const quest = await Quest.findById(questId);
    if (!quest) return res.status(404).json({ success: false, error: "Quest not found" });

    if (quest.creator.toString() !== userId) {
        return res.status(403).json({ success: false, error: "Not authorized" });
    }

    if (!quest.applicants.includes(applicantId)) {
        return res.status(400).json({ success: false, error: "User is not an applicant" });
    }

    quest.assignee = applicantId;
    quest.status = 'in_progress';
    quest.participants.push(applicantId); // Add to participants list too

    // Clear other applicants? Optional. For now, we keep them for record.

    await quest.save();

    // Populate assignee for frontend
    await quest.populate('assignee', 'username fullName avatar');

    res.status(200).json({ success: true, data: quest, message: "Applicant accepted!" });
});
