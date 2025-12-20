const githubService = require('./github.service');
const userService = require('../users/user.service');
const aiService = require('../ai/ai.service');
const { asyncHandler } = require('../../common/middleware/errorHandler');
const { ValidationError } = require('../../common/middleware/errorHandler');
const logger = require('../../core/config/loggerConfig');
const Joi = require('joi');

// Input validation schemas
const usernameSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(1)
    .max(39) // GitHub username max length
    .required()
    .messages({
      'string.alphanum': 'Username must only contain alphanumeric characters',
      'string.max': 'Username cannot exceed 39 characters'
    })
});

const searchSchema = Joi.object({
  q: Joi.string()
    .min(1)
    .max(256)
    .required()
    .trim()
    .messages({
      'string.empty': 'Search query cannot be empty',
      'string.max': 'Search query too long'
    })
});

class GitHubController {
  /**
   * Analyze GitHub user profile and extract skills
   * @security Rate limited by express-rate-limit
   * @security Validates username input
   */
  analyzeUser = asyncHandler(async (req, res) => {
    // Input validation
    const { error, value } = usernameSchema.validate({ username: req.params.username });
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { username } = value;
    const accessToken = req.user?.githubAccessToken || null;

    logger.info(`GitHub analysis requested for: ${username} by user: ${req.user?.userId || 'anonymous'}`);

    // Perform GitHub analysis with timeout protection
    const analysisPromise = githubService.analyzeUserSkills(username, accessToken);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('GitHub analysis timeout')), 60000)
    );

    const analysis = await Promise.race([analysisPromise, timeoutPromise]);

    // Only update user data if authenticated
    if (req.user) {
      try {
        // Update GitHub data
        await userService.updateGithubData(req.user.userId, {
          username: analysis.profile.username,
          profileUrl: analysis.profile.profileUrl,
          avatarUrl: analysis.profile.avatarUrl,
          bio: analysis.profile.bio || '',
          company: analysis.profile.company || '',
          location: analysis.profile.location || '',
          publicRepos: analysis.repositoryCount || 0,
          followers: analysis.profile.followers || 0,
          following: analysis.profile.following || 0,
          totalStars: analysis.totalStars || 0,
          totalForks: analysis.totalForks || 0,
          topLanguages: analysis.topLanguages || [],
          recentActivity: analysis.activity || {}
        });

        // Update user skills
        if (analysis.skills && analysis.skills.length > 0) {
          await userService.updateUserSkills(req.user.userId, analysis.skills);

          // Generate AI embeddings (non-blocking)
          const skillNames = analysis.skills.map(s => s.name);
          try {
            const embedding = await aiService.generateEmbedding(skillNames);
            if (embedding && embedding.length > 0) {
              await userService.updateUserEmbedding(req.user.userId, embedding);
            }
          } catch (embeddingError) {
            // Log but don't fail the request if embedding fails
            logger.warn('Failed to generate embeddings:', embeddingError);
          }
        }

        // Award XP for completing analysis
        await userService.addUserXP(req.user.userId, 50);
        
        logger.info(`GitHub analysis completed successfully for user: ${req.user.userId}`);
      } catch (updateError) {
        logger.error('Failed to update user data after GitHub analysis:', updateError);
        // Don't throw - return analysis results anyway
      }
    }

    res.status(200).json({
      success: true,
      message: 'GitHub profile analyzed successfully',
      data: {
        ...analysis,
        analyzedAt: new Date().toISOString()
      }
    });
  });

  /**
   * Get repositories for a GitHub user
   * @security Input validation for username
   */
  getRepositories = asyncHandler(async (req, res) => {
    const { error, value } = usernameSchema.validate({ username: req.params.username });
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { username } = value;
    const accessToken = req.user?.githubAccessToken || null;

    logger.debug(`Fetching repositories for: ${username}`);
    
    const repos = await githubService.getUserRepositories(username, accessToken);

    res.status(200).json({
      success: true,
      data: repos,
      count: repos.length,
      retrievedAt: new Date().toISOString()
    });
  });

  /**
   * Get GitHub profile information
   * @security Input validation for username
   */
  getProfile = asyncHandler(async (req, res) => {
    const { error, value } = usernameSchema.validate({ username: req.params.username });
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { username } = value;
    const accessToken = req.user?.githubAccessToken || null;

    logger.debug(`Fetching profile for: ${username}`);
    
    const profile = await githubService.getUserProfile(username, accessToken);

    // Sanitize profile data before sending
    const sanitizedProfile = {
      username: profile.username,
      name: profile.name || null,
      bio: profile.bio || null,
      company: profile.company || null,
      location: profile.location || null,
      profileUrl: profile.profileUrl,
      avatarUrl: profile.avatarUrl,
      publicRepos: profile.publicRepos || 0,
      followers: profile.followers || 0,
      following: profile.following || 0,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    };

    res.status(200).json({
      success: true,
      data: sanitizedProfile
    });
  });

  /**
   * Search GitHub repositories
   * @security Input sanitization and validation
   * @security Rate limited to prevent abuse
   */
  searchRepositories = asyncHandler(async (req, res) => {
    const { error, value } = searchSchema.validate({ q: req.query.q });
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { q } = value;
    const accessToken = req.user?.githubAccessToken || null;

    logger.debug(`Searching repositories with query: ${q}`);
    
    const results = await githubService.searchRepositories(q, accessToken);

    res.status(200).json({
      success: true,
      data: results,
      count: results.length,
      query: q,
      searchedAt: new Date().toISOString()
    });
  });
}

module.exports = new GitHubController();