const neo4jConnection = require('../../core/config/neo4j');
const logger = require('../../core/config/loggerConfig');

class SkillGraphService {
  /**
   * Create or update a user node in Neo4j
   */
  async createUserNode(userId, userData) {
    try {
      const cypher = `
        MERGE (u:User {userId: $userId})
        SET u.username = $username,
            u.email = $email,
            u.xp = $xp,
            u.updatedAt = timestamp()
        RETURN u
      `;

      const params = {
        userId: userId.toString(),
        username: userData.username || '',
        email: userData.email || '',
        xp: userData.xp || 0
      };

      const result = await neo4jConnection.executeWrite(cypher, params);
      logger.info(`User node created/updated for userId: ${userId}`);
      return result;
    } catch (error) {
      logger.error('Error creating user node:', error);
      throw error;
    }
  }

  /**
   * Create skill nodes and relationships for a user
   */
  async updateUserSkills(userId, skills) {
    try {
      if (!skills || skills.length === 0) {
        return { success: true, message: 'No skills to update' };
      }

      // First, delete existing skill relationships
      await this.deleteUserSkills(userId);

      // Create new skills and relationships
      const cypher = `
        MATCH (u:User {userId: $userId})
        UNWIND $skills as skill
        MERGE (s:Skill {name: skill.name})
        MERGE (u)-[r:HAS_SKILL {
          proficiency: skill.proficiency,
          category: skill.category,
          source: skill.source,
          createdAt: timestamp()
        }]->(s)
        RETURN u, collect(s) as skills
      `;

      const skillsData = skills.map(skill => ({
        name: typeof skill === 'string' ? skill : skill.name,
        proficiency: skill.proficiency || 'intermediate',
        category: skill.category || 'general',
        source: skill.source || 'github'
      }));

      const params = {
        userId: userId.toString(),
        skills: skillsData
      };

      const result = await neo4jConnection.executeWrite(cypher, params);
      logger.info(`Skills updated for userId: ${userId}, count: ${skills.length}`);
      return result;
    } catch (error) {
      logger.error('Error updating user skills:', error);
      throw error;
    }
  }

  /**
   * Delete all skill relationships for a user
   */
  async deleteUserSkills(userId) {
    try {
      const cypher = `
        MATCH (u:User {userId: $userId})-[r:HAS_SKILL]->()
        DELETE r
      `;

      await neo4jConnection.executeWrite(cypher, { userId: userId.toString() });
      return { success: true };
    } catch (error) {
      logger.error('Error deleting user skills:', error);
      throw error;
    }
  }

  /**
   * Get user's skill graph
   */
  async getUserSkillGraph(userId) {
    try {
      const cypher = `
        MATCH (u:User {userId: $userId})-[r:HAS_SKILL]->(s:Skill)
        RETURN u, collect({
          skill: s.name,
          proficiency: r.proficiency,
          category: r.category,
          source: r.source
        }) as skills
      `;

      const result = await neo4jConnection.executeRead(cypher, {
        userId: userId.toString()
      });

      if (result.length === 0) {
        return null;
      }

      return result[0];
    } catch (error) {
      logger.error('Error getting user skill graph:', error);
      throw error;
    }
  }

  /**
   * Find users with complementary skills
   * FIX: Added toInteger() to LIMIT clause
   */
  async findComplementaryUsers(userId, limit = 10) {
    try {
      const cypher = `
        MATCH (u1:User {userId: $userId})-[:HAS_SKILL]->(s1:Skill)
        MATCH (u2:User)-[:HAS_SKILL]->(s2:Skill)
        WHERE u1 <> u2
        WITH u1, u2, 
             collect(DISTINCT s1.name) as user1Skills,
             collect(DISTINCT s2.name) as user2Skills
        WITH u2,
             [skill IN user2Skills WHERE NOT skill IN user1Skills] as complementarySkills,
             [skill IN user1Skills WHERE skill IN user2Skills] as commonSkills
        WHERE size(complementarySkills) > 0
        RETURN u2.userId as userId,
               u2.username as username,
               complementarySkills,
               commonSkills,
               size(complementarySkills) as complementaryCount,
               size(commonSkills) as commonCount
        ORDER BY complementaryCount DESC, commonCount DESC
        LIMIT toInteger($limit)
      `;

      const params = {
        userId: userId.toString(),
        limit: parseInt(limit, 10)
      };

      const result = await neo4jConnection.executeRead(cypher, params);
      return result;
    } catch (error) {
      logger.error('Error finding complementary users:', error);
      throw error;
    }
  }

  /**
   * Find users with similar skills (for mentorship matching)
   * FIX: Added toInteger() to LIMIT clause
   */
  async findSimilarUsers(userId, limit = 10) {
    try {
      const cypher = `
        MATCH (u1:User {userId: $userId})-[:HAS_SKILL]->(s:Skill)<-[:HAS_SKILL]-(u2:User)
        WHERE u1 <> u2
        WITH u2, count(DISTINCT s) as commonSkills
        ORDER BY commonSkills DESC
        LIMIT toInteger($limit)
        MATCH (u2)-[r:HAS_SKILL]->(skill:Skill)
        RETURN u2.userId as userId,
               u2.username as username,
               u2.xp as xp,
               commonSkills,
               collect({name: skill.name, proficiency: r.proficiency}) as skills
      `;

      const params = {
        userId: userId.toString(),
        limit: parseInt(limit, 10)
      };

      const result = await neo4jConnection.executeRead(cypher, params);
      return result;
    } catch (error) {
      logger.error('Error finding similar users:', error);
      throw error;
    }
  }

  /**
   * Find mentors (Expert/Advanced users in shared skills)
   * High Gravity Matching
   */
  async findMentors(userId, limit = 10) {
    try {
      const cypher = `
        MATCH (mentee:User {userId: $userId})-[r1:HAS_SKILL]->(s:Skill)<-[r2:HAS_SKILL]-(mentor:User)
        WHERE mentee <> mentor
        AND (r1.proficiency = 'beginner' OR r1.proficiency = 'intermediate')
        AND (r2.proficiency = 'advanced' OR r2.proficiency = 'expert')
        WITH mentor, count(DISTINCT s) as expertiseOverlap
        ORDER BY expertiseOverlap DESC
        LIMIT toInteger($limit)
        RETURN mentor.userId as userId,
               mentor.username as username,
               mentor.xp as xp,
               expertiseOverlap
      `;

      const params = {
        userId: userId.toString(),
        limit: parseInt(limit, 10)
      };

      const result = await neo4jConnection.executeRead(cypher, params);
      return result;
    } catch (error) {
      logger.error('Error finding mentors:', error);
      throw error;
    }
  }

  /**
   * Get skill recommendations based on user's current skills
   * FIX: Added toInteger() to LIMIT clause
   */
  async getSkillRecommendations(userId, limit = 5) {
    try {
      const cypher = `
        MATCH (u:User {userId: $userId})-[:HAS_SKILL]->(s1:Skill)
        MATCH (u2:User)-[:HAS_SKILL]->(s1)
        MATCH (u2)-[:HAS_SKILL]->(s2:Skill)
        WHERE NOT (u)-[:HAS_SKILL]->(s2)
        WITH s2, count(DISTINCT u2) as frequency
        RETURN s2.name as skill, frequency
        ORDER BY frequency DESC
        LIMIT toInteger($limit)
      `;

      const params = {
        userId: userId.toString(),
        limit: parseInt(limit, 10)
      };

      const result = await neo4jConnection.executeRead(cypher, params);
      return result;
    } catch (error) {
      logger.error('Error getting skill recommendations:', error);
      throw error;
    }
  }

  /**
   * Create learning path relationships
   */
  async createLearningPath(userId, targetSkill, prerequisites) {
    try {
      const cypher = `
        MATCH (u:User {userId: $userId})
        MERGE (target:Skill {name: $targetSkill})
        MERGE (u)-[:LEARNING {startedAt: timestamp()}]->(target)
        WITH u, target
        UNWIND $prerequisites as prereq
        MERGE (p:Skill {name: prereq})
        MERGE (p)-[:PREREQUISITE_FOR]->(target)
        RETURN target, collect(p) as prerequisites
      `;

      const params = {
        userId: userId.toString(),
        targetSkill,
        prerequisites: prerequisites || []
      };

      const result = await neo4jConnection.executeWrite(cypher, params);
      return result;
    } catch (error) {
      logger.error('Error creating learning path:', error);
      throw error;
    }
  }

  /**
   * Get graph statistics
   */
  async getGraphStatistics() {
    try {
      const cypher = `
        MATCH (u:User)
        OPTIONAL MATCH (s:Skill)
        OPTIONAL MATCH ()-[r:HAS_SKILL]->()
        RETURN count(DISTINCT u) as userCount,
               count(DISTINCT s) as skillCount,
               count(r) as relationshipCount
      `;

      const result = await neo4jConnection.executeRead(cypher);
      return result[0] || { userCount: 0, skillCount: 0, relationshipCount: 0 };
    } catch (error) {
      logger.error('Error getting graph statistics:', error);
      throw error;
    }
  }

  /**
   * Delete user and all relationships
   */
  async deleteUser(userId) {
    try {
      const cypher = `
        MATCH (u:User {userId: $userId})
        OPTIONAL MATCH (u)-[r]-()
        DELETE r, u
      `;

      await neo4jConnection.executeWrite(cypher, { userId: userId.toString() });
      logger.info(`User node deleted for userId: ${userId}`);
      return { success: true };
    } catch (error) {
      logger.error('Error deleting user node:', error);
      throw error;
    }
  }
}

module.exports = new SkillGraphService();