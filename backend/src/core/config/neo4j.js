const neo4j = require('neo4j-driver');
const logger = require('./loggerConfig');

class Neo4jConnection {
  constructor() {
    this.driver = null;
    this.isInitialized = false;
  }

  async connect() {
    try {
      const uri = process.env.NEO4J_URI;
      const user = process.env.NEO4J_USER;
      const password = process.env.NEO4J_PASS;

      if (!uri || !user || !password) {
        throw new Error('Neo4j credentials not provided in environment variables');
      }

      this.driver = neo4j.driver(
        uri,
        neo4j.auth.basic(user, password),
        {
          maxConnectionPoolSize: 50,
          connectionAcquisitionTimeout: 60000,
          maxTransactionRetryTime: 30000,
          logging: {
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
            logger: (level, message) => logger.log(level, `Neo4j: ${message}`)
          }
        }
      );

      // Verify connectivity
      await this.verifyConnectivity();
      
      this.isInitialized = true;
      logger.info('Neo4j connection established successfully');

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.close();
      });

      process.on('SIGTERM', async () => {
        await this.close();
      });

      return this.driver;
    } catch (error) {
      logger.error('Failed to connect to Neo4j:', error);
      throw error;
    }
  }

  async verifyConnectivity() {
    const session = this.driver.session();
    try {
      const result = await session.run('RETURN 1 as test');
      if (result.records.length === 0) {
        throw new Error('Neo4j connectivity test failed');
      }
      logger.info('Neo4j connectivity verified');
    } catch (error) {
      logger.error('Neo4j connectivity verification failed:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  getSession(database = null) {
    if (!this.driver) {
      throw new Error('Neo4j driver not initialized. Call connect() first.');
    }
    return this.driver.session(database ? { database } : {});
  }

  getDriver() {
    return this.driver;
  }

  async executeQuery(cypher, params = {}, database = null) {
    const session = this.getSession(database);
    try {
      const result = await session.run(cypher, params);
      return result.records.map(record => record.toObject());
    } catch (error) {
      logger.error('Neo4j query execution failed:', { cypher, error: error.message });
      throw error;
    } finally {
      await session.close();
    }
  }

  async executeWrite(cypher, params = {}, database = null) {
    const session = this.getSession(database);
    try {
      const result = await session.writeTransaction(tx => 
        tx.run(cypher, params)
      );
      return result.records.map(record => record.toObject());
    } catch (error) {
      logger.error('Neo4j write transaction failed:', { cypher, error: error.message });
      throw error;
    } finally {
      await session.close();
    }
  }

  async executeRead(cypher, params = {}, database = null) {
    const session = this.getSession(database);
    try {
      const result = await session.readTransaction(tx => 
        tx.run(cypher, params)
      );
      return result.records.map(record => record.toObject());
    } catch (error) {
      logger.error('Neo4j read transaction failed:', { cypher, error: error.message });
      throw error;
    } finally {
      await session.close();
    }
  }

  async close() {
    if (this.driver) {
      try {
        await this.driver.close();
        logger.info('Neo4j driver closed successfully');
      } catch (error) {
        logger.error('Error closing Neo4j driver:', error);
        throw error;
      }
    }
  }

  isConnected() {
    return this.isInitialized && this.driver !== null;
  }
}

module.exports = new Neo4jConnection();