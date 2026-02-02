const config = require('./core/config/env');
const database = require('./core/config/db');
const neo4jConnection = require('./core/config/neo4j');
const createServer = require('./server');
const logger = require('./core/config/loggerConfig');

async function startServer() {
  try {
    logger.info('Starting OrbitDev AI Backend...');

    // Connect to MongoDB
    await database.connect();
    logger.info('✅ MongoDB connected');

    // Connect to Neo4j
    await neo4jConnection.connect();
    logger.info('✅ Neo4j connected');

    // Create Express app with Apollo Server (async function now)
    const app = await createServer();
    const PORT = config.port;

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${config.env} mode`);
      logger.info(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
      logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
      logger.info(`📡 API base: http://localhost:${PORT}`);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received, shutting down gracefully...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await database.disconnect();
          logger.info('MongoDB disconnected');

          await neo4jConnection.close();
          logger.info('Neo4j disconnected');

          logger.info('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      console.error("RAW UNCAUGHT EXCEPTION:", error);
      console.error("MSG:", error.message);
      console.error("STACK:", error.stack);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error("RAW UNHANDLED REJECTION:", reason);
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      if (!config.isProduction()) {
        gracefulShutdown('UNHANDLED_REJECTION');
      }
    });

  } catch (error) {
    console.error("FATAL STARTUP ERROR:", error);
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();