const axios = require('axios');
const User = require('../users/user.model'); // Adjust path if your user model is elsewhere
// If you don't have a dedicated logger, use console
const logger = require('../../core/config/loggerConfig') || console; 

class DailyService {

  async getDailyBriefing(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // 1. DATE CHECK (Persistence)
      const today = new Date().toDateString();
      const lastDate = user.dailyLog?.lastQuestDate ? new Date(user.dailyLog.lastQuestDate).toDateString() : null;
      const isCompleted = today === lastDate;

      // 2. FETCH FREE REAL-WORLD DATA
      const trend = await this.getDevToTrend();

      // 3. GENERATE SMART CONTENT
      const dynamicContent = this.generateSmartContent(user, trend);

      return {
        date: new Date().toISOString(),
        streak: user.dailyLog?.currentStreak || 0,
        quest: {
          ...dynamicContent.quest,
          status: isCompleted ? 'completed' : 'pending'
        },
        tip: dynamicContent.tip,
        trendingTopic: trend ? trend.title : "Evergreen Engineering",
        xpPotential: 100 + ((user.dailyLog?.currentStreak || 0) * 10)
      };
    } catch (error) {
      logger.error('Error getting daily briefing:', error);
      throw error;
    }
  }

  // --- 🌐 FREE LIVE DATA SOURCE ---
  async getDevToTrend() {
    try {
      // Dev.to API is 100% Free. We get the #1 top article of the week.
      const response = await axios.get('https://dev.to/api/articles?top=1&per_page=1');
      if (response.data && response.data.length > 0) {
        return {
          title: response.data[0].title,
          tags: response.data[0].tag_list,
          url: response.data[0].url
        };
      }
      return null;
    } catch (e) {
      return null; // Fallback gracefully
    }
  }

  // --- 🧠 THE "PROCEDURAL BRAIN" ---
  // --- 🧠 THE "GOD MODE" BRAIN (REPLACEMENT) ---
  generateSmartContent(user, trend) {
    const userSkills = user.skills || [];

    // 1. CRITICAL: GRAVITY CHECK (Skill Decay)
    // We look for 'expert' or 'advanced' skills with low gravity (< 0.6)
    // This forces the user to maintain what they have learned.
    const decayingSkill = userSkills.find(s => 
        (s.proficiency === 'expert' || s.proficiency === 'advanced') && 
        (s.gravityScore || 1) < 0.6 // Default to 1 if no score yet
    );

    if (decayingSkill) {
        return {
            isDirective: true, // Frontend uses this to trigger "Red Alert" UI
            quest: {
                type: 'urgent',
                title: `Emergency: Save your ${decayingSkill.name} Rating`,
                desc: `System detected 40% gravity loss in ${decayingSkill.name}. Your expert status is at risk. Solve 1 complex problem to restore orbit.`,
                link: `/practice/${decayingSkill.name.toLowerCase()}`, 
                discussion: `https://stackoverflow.com/questions/tagged/${decayingSkill.name.toLowerCase()}?sort=Votes`,
                priority: 'critical', // Signals red UI
                xpReward: 500 // High reward
            },
            tip: "Maintenance is harder than growth. Don't let your hard work rust."
        };
    }

    // 2. GROWTH: PUSH TO NEXT LEVEL
    // Look for skills close to leveling up (gravity > 0.8)
    const nextLevelSkill = userSkills.find(s => 
        (s.gravityScore || 0) > 0.8 && s.proficiency !== 'expert'
    );
    
    if (nextLevelSkill) {
        return {
            isDirective: true,
            quest: {
                type: 'growth',
                title: `Push ${nextLevelSkill.name} to Expert`,
                desc: `You are at 80% gravity. One solid coding session today will trigger a level-up event.`,
                link: `/practice/${nextLevelSkill.name.toLowerCase()}`,
                discussion: `https://github.com/topics/${nextLevelSkill.name.toLowerCase()}`,
                priority: 'high', // Signals Blue/Gold UI
                xpReward: 300
            },
            tip: "Consistency is the only algorithm that matters."
        };
    }

    // 3. FALLBACK: USE THE TREND ENGINE (Existing Logic)
    // If user is balanced, we fall back to the generic trend logic you already had.
    if (trend) {
      const isRelevant = trend.tags.some(tag => 
        userSkills.some(s => s.name.toLowerCase().includes(tag.toLowerCase()))
      );
      const discussionLink = `https://dev.to/search?q=${encodeURIComponent(trend.title)}`;

      return {
        isDirective: false, // Standard UI
        quest: {
          type: 'learning',
          title: isRelevant ? 'Trend Surfer' : 'News Breaker',
          desc: isRelevant 
            ? `The industry is focused on "${trend.title}". Since you know ${userSkills[0]?.name}, read this.`
            : `Top story: "${trend.title}". Read the first 3 paragraphs to stay current.`,
          link: trend.url,          
          discussion: discussionLink,
          priority: 'normal',
          xpReward: 100
        },
        tip: `Industry Insight: Knowing about "${trend.tags[0]}" makes you job-ready.`
      };
    }

    // 4. FINAL RESORT: STATIC CONTENT
    return this.getStaticFallback(user);
  }

  getStaticFallback(user) {
    const seed = new Date().getDate();
    const quests = [
      { 
        quest: { 
            type: 'coding', 
            title: 'Refactor Spree', 
            desc: 'Find a function > 20 lines and break it down.',
            discussion: 'https://twitter.com/search?q=clean+code+refactoring&f=live' 
        }, 
        tip: "Clean Code: Functions should do one thing and do it well." 
      },
      { 
        quest: { 
            type: 'wellness', 
            title: 'Touch Grass', 
            desc: 'Step away from the screen for 15m. No phone.',
            discussion: 'https://www.reddit.com/r/ProgrammerHumor/search/?q=touch+grass' 
        }, 
        tip: "Burnout is the enemy of consistency. Rest is a productivity tool." 
      },
      { 
        quest: { 
            type: 'learning', 
            title: 'Doc Diver', 
            desc: `Read the docs for a ${user.skills?.[0]?.name || 'JS'} hook you never use.`,
            discussion: `https://stackoverflow.com/questions/tagged/${(user.skills?.[0]?.name || 'javascript').toLowerCase()}?sort=Votes` 
        }, 
        tip: "RTFM: Reading The Manual saves hours of StackOverflow searching." 
      }
    ];
    return quests[seed % quests.length];
  }

  // Updated completeQuest to accept 'amount'
  async completeQuest(userId, amount = 100) {
    const user = await User.findById(userId);
    const today = new Date().toDateString();
    
    // 1. Check if already done today
    if (user.dailyLog?.lastQuestDate && new Date(user.dailyLog.lastQuestDate).toDateString() === today) {
       // Return success: true so the UI knows it's "Done", but don't add XP again.
       return { 
           success: true, 
           message: 'Already completed today', 
           newXP: user.xp,
           newStreak: user.dailyLog.currentStreak 
       };
    }

    // 2. Initialize Log if empty
    if (!user.dailyLog) user.dailyLog = { currentStreak: 0, lastQuestDate: null };

    // 3. Update Streak
    const lastDate = user.dailyLog.lastQuestDate ? new Date(user.dailyLog.lastQuestDate) : new Date(0);
    const diffTime = Math.abs(new Date() - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays <= 2) {
        user.dailyLog.currentStreak += 1; 
    } else {
        user.dailyLog.currentStreak = 1; 
    }

    user.dailyLog.lastQuestDate = new Date();
    
    // 4. USE DYNAMIC XP (passed from frontend) instead of hardcoded 100
    user.xp = (user.xp || 0) + amount;
    
    // 5. Log activity
    user.activityLog.push({ date: new Date() });
    
    // 6. SAVE TO DB (This connects to Mongo)
    await user.save();

    return { 
      success: true, 
      newXP: user.xp, 
      newStreak: user.dailyLog.currentStreak 
    };
  }

  async getActivityHeatmap(userId) {
    const user = await User.findById(userId).select('activityLog');
    if (!user || !user.activityLog) return [];
    
    const activityMap = {};
    user.activityLog.forEach(log => {
      const rawDate = log.date || log; 
      const date = new Date(rawDate).toISOString().split('T')[0];
      activityMap[date] = (activityMap[date] || 0) + 1;
    });
    
    return Object.keys(activityMap).map(date => ({
      date,
      count: activityMap[date],
      intensity: activityMap[date] > 5 ? 4 : activityMap[date] > 2 ? 3 : activityMap[date] > 0 ? 2 : 0
    }));
  }
}

module.exports = new DailyService();