const User = require('../users/user.model');
const skillGraphService = require('../../common/utils/skillGraph');
const similarityUtils = require('../../common/utils/similarity');
const logger = require('../../core/config/loggerConfig');
const { NotFoundError, ValidationError } = require('../../common/middleware/errorHandler');

class MatchService {
  /**
   * ----------------------------------------------------------------
   * 1. CORE MATCHING ALGORITHM (Hybrid: Graph Filter + Math Rank)
   * ----------------------------------------------------------------
   */
  async findMatches(userId, options = {}) {
    try {
      const { limit = 10, minScore = 0.4, mode = 'project' } = options;

      // 1. Get Current User
      const currentUser = await User.findById(userId).lean();
      if (!currentUser) throw new NotFoundError('User');

      if (!currentUser.skills || currentUser.skills.length === 0) {
        return [];
      }

      // 2. STAGE 1: Graph Filtering (Neo4j)
      let graphCandidates = [];
      const searchLimit = limit * 3;

      switch (mode) {
        case 'mentorship':
          // Find experts in my field
          graphCandidates = await skillGraphService.findMentors(userId, searchLimit);
          break;
        case 'peer':
          // Find similar skillsets
          graphCandidates = await skillGraphService.findSimilarUsers(userId, searchLimit);
          break;
        case 'project':
        default:
          // Find complementary skills (Frontend <-> Backend)
          graphCandidates = await skillGraphService.findComplementaryUsers(userId, searchLimit);
          break;
      }

      // Fallback: If no graph matches, try standard complementary search if not already tried
      if ((!graphCandidates || !graphCandidates.length) && mode !== 'project') {
        graphCandidates = await skillGraphService.findComplementaryUsers(userId, searchLimit);
      }

      // 3. Fallback: If graph candidates are insufficient, query MongoDB directly
      if (graphCandidates.length < limit) {
        logger.info(`Graph candidates insufficient (${graphCandidates.length}/${limit}). engaging MongoDB fallback for mode: ${mode}`);

        const existingIds = graphCandidates.map(c => c.userId);
        existingIds.push(userId); // Exclude self

        let fallbackUsers = [];

        if (mode === 'project') {
          // Find users with ANY skills (simple fallback for complementary)
          fallbackUsers = await User.find({
            _id: { $nin: existingIds },
            isActive: true,
            skills: { $exists: true, $not: { $size: 0 } }
          })
            .limit(limit * 2)
            .lean();
        } else {
          // Find users with overlapping skills
          const mySkills = currentUser.skills.map(s => typeof s === 'string' ? s : s.name);
          fallbackUsers = await User.find({
            _id: { $nin: existingIds },
            isActive: true,
            'skills.name': { $in: mySkills }
          })
            .limit(limit * 2)
            .lean();
        }

        // Map fallback users to "graph candidate" format
        const fallbackCandidates = fallbackUsers.map(u => ({
          userId: u._id.toString(),
          complementarySkills: [], // We don't calculate this in simple fallback
          commonSkills: []
        }));

        graphCandidates = [...graphCandidates, ...fallbackCandidates];
      }

      if (!graphCandidates || !graphCandidates.length) {
        logger.info(`No matches found even after fallback for ${userId}`);
        return [];
      }

      // 3. Hydrate Candidates (MongoDB)
      const candidateIds = graphCandidates.map(c => c.userId);
      const candidatesData = await User.find({
        _id: { $in: candidateIds },
        isActive: true
      }).lean();

      const candidateMap = new Map(candidatesData.map(u => [u._id.toString(), u]));

      // 4. STAGE 2: Math Scoring
      const scoredMatches = graphCandidates.map(graphMatch => {
        const fullCandidate = candidateMap.get(graphMatch.userId);

        if (!fullCandidate) return null;

        // Skip already matched
        const alreadyInteracted = currentUser.matchHistory?.some(
          h => h.matchedUserId.toString() === fullCandidate._id.toString()
        );
        if (alreadyInteracted) return null;

        // Calculate Weighted Score
        const matchResult = similarityUtils.calculateMatchScore(currentUser, fullCandidate);

        return {
          user: {
            _id: fullCandidate._id,
            username: fullCandidate.username,
            fullName: fullCandidate.fullName,
            avatar: fullCandidate.avatar,
            bio: fullCandidate.bio,
            level: fullCandidate.level,
            skills: fullCandidate.skills,
            xp: fullCandidate.xp
          },
          score: matchResult.score,
          breakdown: matchResult.breakdown,
          complementarySkills: graphMatch.complementarySkills || [],
          commonSkills: graphMatch.commonSkills || [],
          matchLabel: this.getMatchLabel(matchResult.score),
          matchScore: Math.round(matchResult.score * 100) // Frontend expects 0-100
        };
      });

      // 5. Final Sort
      return scoredMatches
        .filter(m => m !== null && m.score >= minScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    } catch (error) {
      logger.error('Match Service Error:', error);
      throw error;
    }
  }

  /**
   * ----------------------------------------------------------------
   * 2. MATCH ACTIONS (Request, Update, Stats)
   * ----------------------------------------------------------------
   */

  async requestMatch(fromUserId, toUserId, message = '') {
    try {
      if (fromUserId.toString() === toUserId.toString()) {
        throw new ValidationError('Cannot match with yourself');
      }

      const [fromUser, toUser] = await Promise.all([
        User.findById(fromUserId),
        User.findById(toUserId)
      ]);

      if (!fromUser || !toUser) throw new NotFoundError('User not found');

      // Check existing
      const existing = fromUser.matchHistory.find(
        h => h.matchedUserId.toString() === toUserId.toString()
      );
      if (existing && existing.status === 'pending') {
        throw new ValidationError('Match request already pending');
      }

      // Calculate score for the record
      const matchResult = similarityUtils.calculateMatchScore(fromUser, toUser);

      // Create Match Record
      const matchData = {
        matchedUserId: toUserId,
        matchScore: matchResult.score,
        status: 'pending',
        message: message.substring(0, 500),
        matchedAt: new Date()
      };

      // Update Sender
      await User.findByIdAndUpdate(fromUserId, {
        $push: { matchHistory: matchData },
        $inc: { 'statistics.totalMatches': 1 }
      });

      // NOTE: In a real app, you would also push a notification or 
      // a "pending received" record to the `toUser`. 

      return { success: true, matchData };

    } catch (error) {
      logger.error('Request Match Error:', error);
      throw error;
    }
  }

  async updateMatchStatus(userId, matchId, newStatus) {
    try {
      const validStatuses = ['accepted', 'rejected', 'completed'];
      if (!validStatuses.includes(newStatus)) throw new ValidationError('Invalid status');

      const user = await User.findOne({ _id: userId, 'matchHistory._id': matchId });
      if (!user) throw new NotFoundError('Match not found');

      const match = user.matchHistory.id(matchId);
      match.status = newStatus;

      // Update Stats if completed
      if (newStatus === 'completed') {
        user.statistics.successfulMatches += 1;
      }

      await user.save();
      return { success: true, match };

    } catch (error) {
      logger.error('Update Match Error:', error);
      throw error;
    }
  }

  async getMatchStatistics(userId) {
    try {
      const user = await User.findById(userId).select('statistics matchHistory');
      if (!user) throw new NotFoundError('User');

      const history = user.matchHistory || [];

      return {
        total: history.length,
        pending: history.filter(m => m.status === 'pending').length,
        accepted: history.filter(m => m.status === 'accepted').length,
        completed: history.filter(m => m.status === 'completed').length,
        // Calculate average score of all interactions
        averageScore: history.length > 0
          ? (history.reduce((acc, m) => acc + (m.matchScore || 0), 0) / history.length).toFixed(2)
          : 0
      };
    } catch (error) {
      logger.error('Stats Error:', error);
      throw error;
    }
  }

  // --- Helpers ---

  getMatchLabel(score) {
    if (score >= 0.85) return "Perfect Synergy";
    if (score >= 0.70) return "High Compatibility";
    if (score >= 0.50) return "Good Match";
    return "Potential Connect";
  }
}

module.exports = new MatchService();