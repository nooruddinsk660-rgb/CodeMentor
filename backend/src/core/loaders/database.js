const database = require('../config/db');
const logger = require('../config/loggerConfig');

async function loadDatabase() {
  try {
    await database.connect();
    logger.info('✅ MongoDB connected');
    return database;
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

module.exports = { loadDatabase };