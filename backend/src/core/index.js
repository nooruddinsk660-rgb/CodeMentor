const { loadDatabase } = require('./loaders/database');
const { loadExpress } = require('./loaders/express');
const neo4jConnection = require('./core/config/neo4j');
const { registerRESTEndpoints } = require('../interfaces/rest');
const { registerGraphQLEndpoint } = require('../interfaces/graphql');
const config = require('./config/env');
const logger = require('./config/loggerConfig');

async function startServer() {
  try {
    logger.info('🚀 Starting CodeMentor AI Backend...');
    
    // Load database
    await loadDatabase();
    
    // Load Neo4j
    await neo4jConnection.connect();
    logger.info('✅ Neo4j connected');
    
    // Load Express
    const app = await loadExpress();
    
    // Register REST endpoints
    registerRESTEndpoints(app);
    
    // Register GraphQL endpoint
    await registerGraphQLEndpoint(app);
    
    // Start server
    const PORT = config.port;
    app.listen(PORT, () => {
      logger.info(`✅ Server running on port ${PORT}`);
      logger.info(`📊 GraphQL: http://localhost:${PORT}/graphql`);
    });
    
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();