const axios = require('axios');
const config = require('../../core/config/env');
const logger = require('../../core/config/loggerConfig');

class AIService {
  constructor() {
    this.baseURL = config.aiService.url;
    this.retryAttempts = 3;
    this.timeout = 30000;
    this.circuitBreakerThreshold = 5;
    this.circuitBreakerResetTime = 60000; // 1 minute
    this.failureCount = 0;
    this.circuitOpen = false;
    this.lastFailureTime = null;
    
    // Create axios instance with default config
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CodeMentor-Backend/1.0'
      }
    });

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      config => {
        logger.debug(`AI Service Request: ${config.method.toUpperCase()} ${config.url}`);
        return config;
      },
      error => {
        logger.error('AI Service Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.axiosInstance.interceptors.response.use(
      response => {
        logger.debug(`AI Service Response: ${response.status} ${response.config.url}`);
        return response;
      },
      error => {
        logger.error('AI Service Response Error:', error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Check and reset circuit breaker if needed
   * @private
   */
  checkCircuitBreaker() {
    if (this.circuitOpen) {
      const timeSinceFailure = Date.now() - this.lastFailureTime;
      if (timeSinceFailure > this.circuitBreakerResetTime) {
        logger.info('Circuit breaker reset - attempting reconnection');
        this.circuitOpen = false;
        this.failureCount = 0;
      } else {
        throw new Error('AI service circuit breaker is open - service temporarily unavailable');
      }
    }
  }

  /**
   * Record failure and potentially open circuit breaker
   * @private
   */
  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.circuitBreakerThreshold) {
      this.circuitOpen = true;
      logger.error(`Circuit breaker opened after ${this.failureCount} failures`);
    }
  }

  /**
   * Reset circuit breaker on successful request
   * @private
   */
  recordSuccess() {
    if (this.failureCount > 0) {
      logger.info('AI service recovered - resetting failure count');
    }
    this.failureCount = 0;
    this.circuitOpen = false;
  }

  /**
   * Make HTTP request to AI service with retry logic
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request payload
   * @param {number} attempt - Current retry attempt
   * @returns {Promise<Object>} Response data
   * @private
   */
  async makeRequest(endpoint, data, attempt = 1) {
    try {
      // Check circuit breaker
      this.checkCircuitBreaker();

      // Validate endpoint
      if (!endpoint || typeof endpoint !== 'string') {
        throw new Error('Invalid endpoint provided');
      }

      // Validate data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid request data');
      }

      const response = await this.axiosInstance.post(endpoint, data);
      
      // Record success
      this.recordSuccess();
      
      return response.data;
    } catch (error) {
      const isLastAttempt = attempt >= this.retryAttempts;
      const shouldRetry = this.shouldRetry(error, attempt);

      if (!isLastAttempt && shouldRetry) {
        const delay = this.calculateBackoff(attempt);
        logger.warn(
          `AI service request failed. Retry ${attempt}/${this.retryAttempts} in ${delay}ms`,
          { error: error.message }
        );
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest(endpoint, data, attempt + 1);
      }

      // Record failure
      this.recordFailure();
      
      logger.error('AI service request failed after all retries:', {
        endpoint,
        attempt,
        error: error.message,
        stack: error.stack
      });

      throw new Error(`AI service temporarily unavailable: ${error.message}`);
    }
  }

  /**
   * Determine if request should be retried
   * @param {Error} error - Error object
   * @param {number} attempt - Current attempt number
   * @returns {boolean} Whether to retry
   * @private
   */
  shouldRetry(error, attempt) {
    // Don't retry if circuit is open
    if (this.circuitOpen) return false;
    
    // Don't retry client errors (4xx) except 429 (rate limit)
    if (error.response) {
      const status = error.response.status;
      if (status >= 400 && status < 500 && status !== 429) {
        return false;
      }
    }
    
    // Retry on network errors and 5xx errors
    return attempt < this.retryAttempts;
  }

  /**
   * Calculate exponential backoff delay
   * @param {number} attempt - Current attempt number
   * @returns {number} Delay in milliseconds
   * @private
   */
  calculateBackoff(attempt) {
    const baseDelay = 1000;
    const maxDelay = 10000;
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
  }

  /**
   * Generate embedding vector for skills
   * @param {Array<string>} skills - Array of skill names
   * @returns {Promise<Array<number>>} Embedding vector
   * @security Input validation
   * @performance Caching could be added here
   */
  async generateEmbedding(skills) {
    try {
      // Input validation
      if (!Array.isArray(skills)) {
        throw new Error('Skills must be an array');
      }

      if (skills.length === 0) {
        logger.warn('Empty skills array provided to generateEmbedding');
        return [];
      }

      // Limit skills array size to prevent abuse
      const MAX_SKILLS = 100;
      if (skills.length > MAX_SKILLS) {
        logger.warn(`Skills array truncated from ${skills.length} to ${MAX_SKILLS}`);
        skills = skills.slice(0, MAX_SKILLS);
      }

      // Sanitize skill names
      const sanitizedSkills = skills
        .filter(skill => typeof skill === 'string' && skill.trim().length > 0)
        .map(skill => skill.trim().substring(0, 100)); // Limit skill name length

      if (sanitizedSkills.length === 0) {
        logger.warn('No valid skills after sanitization');
        return [];
      }

      logger.debug(`Generating embedding for ${sanitizedSkills.length} skills`);

      const response = await this.makeRequest('/embed', { 
        skills: sanitizedSkills 
      });

      // Validate response
      if (!response || !Array.isArray(response.embedding)) {
        throw new Error('Invalid embedding response from AI service');
      }

      return response.embedding;
    } catch (error) {
      logger.error('Error generating embedding:', {
        error: error.message,
        skillCount: skills?.length
      });
      // Return empty array instead of throwing to prevent cascade failures
      return [];
    }
  }

  /**
   * Calculate similarity between two skill sets
   * @param {Array<string>} skills1 - First skill set
   * @param {Array<string>} skills2 - Second skill set
   * @returns {Promise<number>} Similarity score (0-1)
   * @security Input validation
   */
  async analyzeSkillSimilarity(skills1, skills2) {
    try {
      // Input validation
      if (!Array.isArray(skills1) || !Array.isArray(skills2)) {
        throw new Error('Both skill sets must be arrays');
      }

      if (skills1.length === 0 || skills2.length === 0) {
        logger.warn('Empty skill set provided to analyzeSkillSimilarity');
        return 0;
      }

      // Sanitize inputs
      const sanitize = (skills) => skills
        .filter(skill => typeof skill === 'string' && skill.trim().length > 0)
        .map(skill => skill.trim().substring(0, 100))
        .slice(0, 100);

      const sanitizedSkills1 = sanitize(skills1);
      const sanitizedSkills2 = sanitize(skills2);

      if (sanitizedSkills1.length === 0 || sanitizedSkills2.length === 0) {
        return 0;
      }

      logger.debug('Analyzing skill similarity');

      const response = await this.makeRequest('/similarity', {
        skills1: sanitizedSkills1,
        skills2: sanitizedSkills2
      });

      // Validate and clamp response
      const similarity = parseFloat(response.similarity) || 0;
      return Math.max(0, Math.min(1, similarity));
    } catch (error) {
      logger.error('Error analyzing skill similarity:', error);
      return 0;
    }
  }

  /**
   * Generate skill recommendations based on current skills
   * @param {Array<string>} currentSkills - User's current skills
   * @returns {Promise<Array<string>>} Recommended skills
   * @security Input validation
   */
  async generateSkillRecommendations(currentSkills) {
    try {
      // Input validation
      if (!Array.isArray(currentSkills)) {
        throw new Error('Current skills must be an array');
      }

      if (currentSkills.length === 0) {
        logger.warn('Empty skills array for recommendations');
        return [];
      }

      // Sanitize inputs
      const sanitizedSkills = currentSkills
        .filter(skill => typeof skill === 'string' && skill.trim().length > 0)
        .map(skill => skill.trim().substring(0, 100))
        .slice(0, 50); // Limit for recommendations

      if (sanitizedSkills.length === 0) {
        return [];
      }

      logger.debug(`Generating recommendations for ${sanitizedSkills.length} skills`);

      const response = await this.makeRequest('/recommend', {
        skills: sanitizedSkills
      });

      // Validate response
      if (!response || !Array.isArray(response.recommendations)) {
        throw new Error('Invalid recommendations response');
      }

      return response.recommendations.slice(0, 10); // Limit recommendations
    } catch (error) {
      logger.error('Error generating recommendations:', error);
      return [];
    }
  }

  /**
   * Analyze skill trajectory and gravity
   * @param {Array<Object>} skills - Array of skill objects {name, level, gravityScore}
   * @param {string} targetRole - Optional target role
   * @returns {Promise<Object>} Trajectory analysis
   */
  async analyzeSkillTrajectory(skills, targetRole = 'Senior Developer') {
    try {
      // Input validation
      if (!Array.isArray(skills)) {
        throw new Error('Skills must be an array of objects');
      }

      if (skills.length === 0) {
        return {
          trajectory: 'unknown',
          drift_warnings: [],
          ai_analysis: 'No skills data available to analyze.',
          gravity_index: 0
        };
      }

      // Sanitize inputs to match Python Pydantic model
      const sanitizedSkills = skills.map(s => ({
        name: String(s.name || '').substring(0, 100),
        level: String(s.level || 'intermediate'),
        gravityScore: Number(s.gravityScore) || 0
      }));

      logger.debug(`Analyzing trajectory for ${sanitizedSkills.length} skills`);

      const response = await this.makeRequest('/analyze-trajectory', {
        skills: sanitizedSkills,
        target_role: targetRole
      });

      return response;

    } catch (error) {
      logger.error('Error analyzing trajectory:', error);
      // Return safe fallback instead of crashing dashboard
      return {
        trajectory: 'unavailable',
        drift_warnings: [],
        ai_analysis: 'AI Trajectory Engine is temporarily offline.',
        gravity_index: 0
      };
    }
  }

  /**
   * Check if AI service is healthy
   * @returns {Promise<boolean>} Service health status
   */
  async healthCheck() {
    try {
      // Don't check if circuit is open
      if (this.circuitOpen) {
        return false;
      }

      const response = await this.axiosInstance.get('/health', {
        timeout: 5000
      });

      const isHealthy = response.status === 200;
      
      if (isHealthy) {
        this.recordSuccess();
      }
      
      return isHealthy;
    } catch (error) {
      logger.warn('AI service health check failed:', error.message);
      return false;
    }
  }

  /**
   * Get service statistics
   * @returns {Object} Service stats
   */
  getStats() {
    return {
      circuitOpen: this.circuitOpen,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      baseURL: this.baseURL
    };
  }
}

module.exports = new AIService();