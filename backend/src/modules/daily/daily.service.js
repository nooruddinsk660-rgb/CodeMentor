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
  generateSmartContent(user, trend) {
    const userSkills = user.skills || [];
    const mainSkill = userSkills[0]?.name || 'Code';
    
    // --- 1. IF WE HAVE A LIVE TREND ---
    if (trend) {
      const isRelevant = trend.tags.some(tag => 
        userSkills.some(s => s.name.toLowerCase().includes(tag.toLowerCase()))
      );

      const discussionLink = `https://dev.to/search?q=${encodeURIComponent(trend.title)}`;

      if (isRelevant) {
        return {
          quest: {
            type: 'learning',
            title: 'Trend Surfer',
            desc: `The tech world is talking about "${trend.title}". Since you know ${mainSkill}, read this article and write down one takeaway.`,
            link: trend.url,          
            discussion: discussionLink 
          },
          tip: `Industry Insight: Keeping up with trends like "${trend.tags[0]}" makes you 2x more valuable in interviews.`
        };
      } 
      
      return {
        quest: {
          type: 'social',
          title: 'News Breaker',
          desc: `Top story today: "${trend.title}". Share this in a developer discord or read the first 3 paragraphs.`,
          link: trend.url,
          discussion: discussionLink
        },
        tip: `Growth Hack: Even if you don't use ${trend.tags[0] || 'it'}, knowing what it solves is crucial.`
      };
    }

    // --- 2. FALLBACK ---
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