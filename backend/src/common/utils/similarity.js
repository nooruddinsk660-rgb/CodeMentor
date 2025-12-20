const logger = require('../../core/config/loggerConfig');

/**
 * Calculate cosine similarity between two vectors
 * @param {Array<number>} vecA - First vector
 * @param {Array<number>} vecB - Second vector
 * @returns {number} - Similarity score between 0 and 1
 */
function cosineSimilarity(vecA, vecB) {
  try {
    if (!Array.isArray(vecA) || !Array.isArray(vecB)) {
      throw new Error('Vectors must be arrays');
    }

    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length');
    }

    if (vecA.length === 0) {
      return 0;
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      magnitudeA += vecA[i] * vecA[i];
      magnitudeB += vecB[i] * vecB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    const similarity = dotProduct / (magnitudeA * magnitudeB);
    return Math.max(0, Math.min(1, similarity)); // Clamp between 0 and 1
  } catch (error) {
    logger.error('Error calculating cosine similarity:', error);
    return 0;
  }
}

/**
 * Calculate Jaccard similarity between two sets
 * @param {Set|Array} setA - First set
 * @param {Set|Array} setB - Second set
 * @returns {number} - Similarity score between 0 and 1
 */
function jaccardSimilarity(setA, setB) {
  try {
    const a = new Set(setA);
    const b = new Set(setB);

    const intersection = new Set([...a].filter(x => b.has(x)));
    const union = new Set([...a, ...b]);

    if (union.size === 0) {
      return 0;
    }

    return intersection.size / union.size;
  } catch (error) {
    logger.error('Error calculating Jaccard similarity:', error);
    return 0;
  }
}

/**
 * Calculate skill complementarity score
 * Higher score means better complementary skills (one has what the other needs)
 * @param {Object} userA - User A with skills array
 * @param {Object} userB - User B with skills array
 * @returns {number} - Complementarity score
 */
function skillComplementarity(userA, userB) {
  try {
    const skillsA = new Set(userA.skills || []);
    const skillsB = new Set(userB.skills || []);

    if (skillsA.size === 0 || skillsB.size === 0) {
      return 0;
    }

    // Skills A has that B doesn't
    const aHasBNeeds = [...skillsA].filter(skill => !skillsB.has(skill)).length;
    
    // Skills B has that A doesn't
    const bHasANeeds = [...skillsB].filter(skill => !skillsA.has(skill)).length;

    // Average complementarity
    const complementarity = (aHasBNeeds + bHasANeeds) / (skillsA.size + skillsB.size);

    return complementarity;
  } catch (error) {
    logger.error('Error calculating skill complementarity:', error);
    return 0;
  }
}

/**
 * Calculate weighted match score combining multiple factors
 * @param {Object} userA - User A data
 * @param {Object} userB - User B data
 * @param {Object} weights - Weight configuration
 * @returns {number} - Overall match score
 */
function calculateMatchScore(userA, userB, weights = {}) {
  try {
    const defaultWeights = {
      embeddings: 0.4,
      complementarity: 0.35,
      overlap: 0.15,
      experience: 0.1
    };

    const w = { ...defaultWeights, ...weights };

    let scores = {
      embeddings: 0,
      complementarity: 0,
      overlap: 0,
      experience: 0
    };

    // Embedding similarity (if available)
    if (userA.skillEmbedding && userB.skillEmbedding) {
      scores.embeddings = cosineSimilarity(userA.skillEmbedding, userB.skillEmbedding);
    }

    // Skill complementarity
    scores.complementarity = skillComplementarity(userA, userB);

    // Skill overlap (some common ground is good)
    if (userA.skills && userB.skills) {
      scores.overlap = jaccardSimilarity(userA.skills, userB.skills);
    }

    // Experience level compatibility (similar levels work better together)
    if (userA.xp !== undefined && userB.xp !== undefined) {
      const xpDiff = Math.abs(userA.xp - userB.xp);
      const maxXp = Math.max(userA.xp, userB.xp) || 1;
      scores.experience = 1 - (xpDiff / maxXp);
    }

    // Calculate weighted score
    const finalScore = 
      scores.embeddings * w.embeddings +
      scores.complementarity * w.complementarity +
      scores.overlap * w.overlap +
      scores.experience * w.experience;

    return {
      score: Math.max(0, Math.min(1, finalScore)),
      breakdown: scores
    };
  } catch (error) {
    logger.error('Error calculating match score:', error);
    return { score: 0, breakdown: {} };
  }
}

/**
 * Normalize a vector to unit length
 * @param {Array<number>} vector - Input vector
 * @returns {Array<number>} - Normalized vector
 */
function normalizeVector(vector) {
  try {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    
    if (magnitude === 0) {
      return vector.map(() => 0);
    }

    return vector.map(val => val / magnitude);
  } catch (error) {
    logger.error('Error normalizing vector:', error);
    return vector;
  }
}

/**
 * Calculate euclidean distance between two vectors
 * @param {Array<number>} vecA - First vector
 * @param {Array<number>} vecB - Second vector
 * @returns {number} - Distance
 */
function euclideanDistance(vecA, vecB) {
  try {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length');
    }

    const sumSquares = vecA.reduce((sum, val, i) => {
      const diff = val - vecB[i];
      return sum + diff * diff;
    }, 0);

    return Math.sqrt(sumSquares);
  } catch (error) {
    logger.error('Error calculating euclidean distance:', error);
    return Infinity;
  }
}

module.exports = {
  cosineSimilarity,
  jaccardSimilarity,
  skillComplementarity,
  calculateMatchScore,
  normalizeVector,
  euclideanDistance
};