const axios = require('axios');
const logger = require('../../core/config/loggerConfig');
const { ValidationError } = require('../../common/middleware/errorHandler');

class GitHubService {
  constructor() {
    this.baseURL = 'https://api.github.com';
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  async makeRequest(url, token = null, attempt = 1) {
    try {
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CodeMentor-AI'
      };

      if (token) {
        headers['Authorization'] = `token ${token}`;
      }

      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      if (error.response?.status === 403 && error.response?.headers['x-ratelimit-remaining'] === '0') {
        const resetTime = error.response.headers['x-ratelimit-reset'];
        logger.warn(`GitHub API rate limit exceeded. Resets at: ${new Date(resetTime * 1000)}`);
        throw new ValidationError('GitHub API rate limit exceeded. Please try again later.');
      }

      if (attempt < this.retryAttempts && error.response?.status >= 500) {
        logger.warn(`GitHub API request failed. Retry attempt ${attempt}/${this.retryAttempts}`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        return this.makeRequest(url, token, attempt + 1);
      }

      logger.error('GitHub API request failed:', error.message);
      throw error;
    }
  }

  async getUserProfile(username, accessToken = null) {
    try {
      const url = `${this.baseURL}/users/${username}`;
      const profile = await this.makeRequest(url, accessToken);

      return {
        username: profile.login,
        name: profile.name,
        bio: profile.bio,
        company: profile.company,
        location: profile.location,
        email: profile.email,
        profileUrl: profile.html_url,
        avatarUrl: profile.avatar_url,
        publicRepos: profile.public_repos,
        followers: profile.followers,
        following: profile.following,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      };
    } catch (error) {
      logger.error('Error fetching GitHub user profile:', error);
      throw error;
    }
  }

  async getUserRepositories(username, accessToken = null) {
    try {
      const url = `${this.baseURL}/users/${username}/repos?sort=updated&per_page=100`;
      const repos = await this.makeRequest(url, accessToken);

      return repos.map(repo => ({
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        size: repo.size,
        topics: repo.topics || [],
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
        pushedAt: repo.pushed_at,
        isPrivate: repo.private,
        isFork: repo.fork
      }));
    } catch (error) {
      logger.error('Error fetching GitHub repositories:', error);
      throw error;
    }
  }

  async getRepositoryLanguages(fullRepoName, accessToken = null) {
    try {
      const url = `${this.baseURL}/repos/${fullRepoName}/languages`;
      return await this.makeRequest(url, accessToken);
    } catch (error) {
      logger.error('Error fetching repository languages:', error);
      return {};
    }
  }

  async getUserActivity(username, accessToken = null) {
    try {
      const url = `${this.baseURL}/users/${username}/events/public?per_page=100`;
      const events = await this.makeRequest(url, accessToken);

      const activity = {
        commits: 0,
        pullRequests: 0,
        issues: 0,
        reviews: 0,
        recentActivity: []
      };

      events.forEach(event => {
        switch (event.type) {
          case 'PushEvent':
            activity.commits += event.payload.commits?.length || 0;
            break;
          case 'PullRequestEvent':
            activity.pullRequests++;
            break;
          case 'IssuesEvent':
            activity.issues++;
            break;
          case 'PullRequestReviewEvent':
            activity.reviews++;
            break;
        }
      });

      // Get recent distinct activities
      activity.recentActivity = events.slice(0, 10).map(event => ({
        type: event.type,
        repo: event.repo.name,
        createdAt: event.created_at
      }));

      return activity;
    } catch (error) {
      logger.error('Error fetching GitHub user activity:', error);
      return { commits: 0, pullRequests: 0, issues: 0, reviews: 0, recentActivity: [] };
    }
  }

  async analyzeUserSkills(username, accessToken = null) {
    try {
      logger.info(`Analyzing GitHub profile for user: ${username}`);

      // Fetch user data
      const [profile, repos, activity] = await Promise.all([
        this.getUserProfile(username, accessToken),
        this.getUserRepositories(username, accessToken),
        this.getUserActivity(username, accessToken)
      ]);

      // Calculate language statistics
      const languageStats = {};
      const topicStats = {};
      let totalStars = 0;
      let totalForks = 0;

      // Filter out forks and analyze original repos
      const originalRepos = repos.filter(repo => !repo.isFork);

      for (const repo of originalRepos) {
        totalStars += repo.stars;
        totalForks += repo.forks;

        if (repo.language) {
          languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
        }

        // Collect topics
        repo.topics.forEach(topic => {
          topicStats[topic] = (topicStats[topic] || 0) + 1;
        });

        // Fetch detailed language stats for top repos
        if (repo.stars > 0 || originalRepos.indexOf(repo) < 10) {
          try {
            const languages = await this.getRepositoryLanguages(repo.fullName, accessToken);
            Object.entries(languages).forEach(([lang, bytes]) => {
              if (!languageStats[lang]) {
                languageStats[lang] = 0;
              }
              languageStats[lang] += bytes;
            });
          } catch (error) {
            // Continue if language fetch fails for a repo
            logger.warn(`Failed to fetch languages for ${repo.fullName}`);
          }
        }
      }

      // Calculate top languages
      const totalBytes = Object.values(languageStats).reduce((sum, bytes) => sum + bytes, 0);
      const topLanguages = Object.entries(languageStats)
        .map(([language, bytes]) => ({
          language,
          percentage: totalBytes > 0 ? (bytes / totalBytes * 100).toFixed(2) : 0,
          linesOfCode: Math.round(bytes / 50) // Rough estimate: 50 bytes per line
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 10);

      // Extract skills from languages and topics
      const skills = [];
      
      // Add programming languages as skills
      topLanguages.forEach(lang => {
        if (lang.percentage > 5) { // Only include if >5% of codebase
          let proficiency = 'intermediate';
          if (lang.percentage > 40) proficiency = 'expert';
          else if (lang.percentage > 25) proficiency = 'advanced';
          else if (lang.percentage < 10) proficiency = 'beginner';

          skills.push({
            name: lang.language,
            proficiency,
            category: 'programming-language',
            source: 'github'
          });
        }
      });

      // Add topics as skills
      const topTopics = Object.entries(topicStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);

      topTopics.forEach(([topic, count]) => {
        skills.push({
          name: topic,
          proficiency: count > 5 ? 'advanced' : 'intermediate',
          category: 'framework-tool',
          source: 'github'
        });
      });

      // Infer soft skills based on activity
      if (activity.pullRequests > 10) {
        skills.push({
          name: 'collaboration',
          proficiency: 'advanced',
          category: 'soft-skill',
          source: 'inferred'
        });
      }

      if (activity.reviews > 5) {
        skills.push({
          name: 'code-review',
          proficiency: 'intermediate',
          category: 'soft-skill',
          source: 'inferred'
        });
      }

      const analysisResult = {
        profile,
        repositoryCount: originalRepos.length,
        totalStars,
        totalForks,
        topLanguages,
        skills,
        activity,
        analyzedAt: new Date()
      };

      logger.info(`GitHub analysis complete for ${username}: ${skills.length} skills identified`);
      return analysisResult;
    } catch (error) {
      logger.error('Error analyzing user skills:', error);
      throw error;
    }
  }

  async getRepositoryReadme(fullRepoName, accessToken = null) {
    try {
      const url = `${this.baseURL}/repos/${fullRepoName}/readme`;
      const readme = await this.makeRequest(url, accessToken);
      
      // Decode base64 content
      const content = Buffer.from(readme.content, 'base64').toString('utf-8');
      return content;
    } catch (error) {
      logger.error('Error fetching repository README:', error);
      return null;
    }
  }

  async searchRepositories(query, accessToken = null) {
    try {
      const url = `${this.baseURL}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=10`;
      const result = await this.makeRequest(url, accessToken);
      return result.items;
    } catch (error) {
      logger.error('Error searching repositories:', error);
      throw error;
    }
  }
}

module.exports = new GitHubService();