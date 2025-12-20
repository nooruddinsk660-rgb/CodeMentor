const userService = require('../modules/users/user.service');
const matchService = require('../modules/matchmaking/match.service');
const githubService = require('../modules/github/github.service');
const skillGraphService = require('../common/utils/skillGraph');

const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return await userService.getUserById(user.userId);
    },

    user: async (_, { id }) => {
      return await userService.getUserById(id);
    },

    users: async (_, { limit = 20, page = 1 }) => {
      const result = await userService.searchUsers('', {}, page, limit);
      return {
        users: result.users,
        totalCount: result.pagination.total,
        pageInfo: {
          hasNextPage: result.pagination.page < result.pagination.pages,
          hasPreviousPage: result.pagination.page > 1,
          currentPage: result.pagination.page,
          totalPages: result.pagination.pages
        }
      };
    },

    searchUsers: async (_, { query, limit = 20 }) => {
      const result = await userService.searchUsers(query, {}, 1, limit);
      return result.users;
    },

    topUsers: async (_, { limit = 10 }) => {
      return await userService.getTopUsers(limit);
    },

    recommendations: async (_, { limit = 10, minScore = 0.3 }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return await matchService.findMatches(user.userId, { limit, minScore });
    },

    skillGraph: async (_, { userId }, { user }) => {
      const targetUserId = userId || user?.userId;
      if (!targetUserId) throw new Error('User ID required');
      return await skillGraphService.getUserSkillGraph(targetUserId);
    }
  },

  Mutation: {
    updateProfile: async (_, { input }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return await userService.updateUser(user.userId, input);
    },

    updateSkills: async (_, { skills }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return await userService.updateUserSkills(user.userId, skills);
    },

    analyzeGitHub: async (_, { username }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const currentUser = await userService.getUserById(user.userId);
      await githubService.analyzeUserSkills(username, currentUser.githubAccessToken);
      return await userService.getUserById(user.userId);
    }
  }
};

module.exports = resolvers;

