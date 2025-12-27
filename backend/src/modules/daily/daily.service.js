const axios = require('axios');
const User = require('../users/user.model');
const logger = require('../../core/config/loggerConfig');

class DailyService {

  async getDailyBriefing(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // 1. DATE CHECK (Persistence)
      const today = new Date().toDateString();
      const lastDate = user.dailyLog?.lastQuestDate?.toDateString();
      const isCompleted = today === lastDate;

      // 2. FETCH FREE REAL-WORLD DATA
      // We fetch the top rising tech discussion of the day
      const trend = await this.getDevToTrend();

      // 3. GENERATE SMART CONTENT (No API Keys needed)
      // We use a "Templating Engine" to mix user skills with the live trend
      const dynamicContent = this.generateSmartContent(user, trend);

      return {
        date: new Date().toISOString(),
        streak: user.dailyLog?.currentStreak || 0,
        quest: {
          ...dynamicContent.quest,
          status: isCompleted ? 'completed' : 'pending'
        },
        tip: dynamicContent.tip,
        // Shows the user this is REAL live data
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
          tags: response.data[0].tag_list, // e.g., ["javascript", "react", "css"]
          url: response.data[0].url
        };
      }
      return null;
    } catch (e) {
      return null; // Fallback gracefully if internet is down
    }
  }

  // --- 🧠 THE "PROCEDURAL BRAIN" (Replaces Paid AI) ---
  // --- 🧠 THE "PROCEDURAL BRAIN" ---
  generateSmartContent(user, trend) {
    const userSkill = user.skills[0]?.name || 'Code';
    
    // --- 1. IF WE HAVE A LIVE TREND (From Internet) ---
    if (trend) {
      const isRelevant = trend.tags.some(tag => 
        user.skills.some(s => s.name.toLowerCase().includes(tag.toLowerCase()))
      );

      // Create a search link to see others discussing this topic
      // We use the trend title + "discussion" on Dev.to or Google
      const discussionLink = `https://dev.to/search?q=${encodeURIComponent(trend.title)}`;

      if (isRelevant) {
        return {
          quest: {
            type: 'learning',
            title: 'Trend Surfer',
            desc: `The tech world is talking about "${trend.title}". Since you know ${userSkill}, read this article and write down one takeaway.`,
            link: trend.url,          // Link to the article itself
            discussion: discussionLink // Link to see others talking about it
          },
          tip: `Industry Insight: Keeping up with trends like "${trend.tags[0]}" makes you 2x more valuable in interviews.`
        };
      } 
      
      // If trend isn't relevant to their stack
      return {
        quest: {
          type: 'social',
          title: 'News Breaker',
          desc: `Top story today: "${trend.title}". Share this in a developer discord or read the first 3 paragraphs.`,
          link: trend.url,
          discussion: discussionLink
        },
        tip: `Growth Hack: Even if you don't use ${trend.tags[0] || 'it'}, knowing what it solves is crucial for architecture decisions.`
      };
    }

    // --- 2. FALLBACK (If Internet is Down) ---
    return this.getStaticFallback(user);
  }

  getStaticFallback(user) {
    const seed = new Date().getDate();
    // Static quests now include generic search links for community verification
    const quests = [
      { 
        quest: { 
            type: 'coding', 
            title: 'Refactor Spree', 
            desc: 'Find a function > 20 lines and break it down.',
            discussion: 'https://twitter.com/search?q=clean+code+refactoring&f=live' // See others refactoring
        }, 
        tip: "Clean Code: Functions should do one thing and do it well." 
      },
      { 
        quest: { 
            type: 'wellness', 
            title: 'Touch Grass', 
            desc: 'Step away from the screen for 15m. No phone.',
            discussion: 'https://www.reddit.com/r/ProgrammerHumor/search/?q=touch+grass' // Humor/Community
        }, 
        tip: "Burnout is the enemy of consistency. Rest is a productivity tool." 
      },
      { 
        quest: { 
            type: 'learning', 
            title: 'Doc Diver', 
            desc: `Read the docs for a ${user.skills[0]?.name || 'JS'} hook you never use.`,
            discussion: `https://stackoverflow.com/questions/tagged/${(user.skills[0]?.name || 'javascript').toLowerCase()}?sort=Votes` // See active discussions
        }, 
        tip: "RTFM: Reading The Manual saves hours of StackOverflow searching." 
      }
    ];
    return quests[seed % quests.length];
  }

  // --- DATABASE LOGIC (unchanged) ---
  async completeQuest(userId) {
    const user = await User.findById(userId);
    const today = new Date().toDateString();
    
    if (user.dailyLog?.lastQuestDate?.toDateString() === today) {
      return { success: false, message: 'Already done', newXP: user.xp };
    }

    user.dailyLog.lastQuestDate = new Date();
    user.dailyLog.currentStreak = (user.dailyLog.currentStreak || 0) + 1;
    user.xp = (user.xp || 0) + 100;
    
    // Log for heatmap
    user.activityLog.push({ date: new Date() });
    
    await user.save();

    return { 
      success: true, 
      newXP: user.xp, 
      newStreak: user.dailyLog.currentStreak 
    };
  }

  // ... (keep getActivityHeatmap exactly as before) ...
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
      intensity: count => count > 5 ? 4 : count > 2 ? 3 : count > 0 ? 2 : 0
    }));
  }
}

module.exports = new DailyService();