const mongoose = require('mongoose');
const logger = require('./loggerConfig');

class Database {
  constructor() {
    this.connection = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async connect() {
    try {
      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
        retryWrites: true,
        retryReads: true,
      };

      mongoose.connection.on('connected', () => {
        logger.info('MongoDB connected successfully');
        this.reconnectAttempts = 0;
      });

      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
        this.handleReconnect();
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected. Attempting to reconnect...');
        this.handleReconnect();
      });

      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

      this.connection = await mongoose.connect(process.env.MONGO_URI, options);
      logger.info('Database connection established');
      
      return this.connection;
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnection attempts reached. Exiting...');
      process.exit(1);
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    logger.info(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      mongoose.connect(process.env.MONGO_URI).catch((err) => {
        logger.error('Reconnection failed:', err);
      });
    }, delay);
  }

  async disconnect() {
    try {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed gracefully');
    } catch (error) {
      logger.error('Error closing MongoDB connection:', error);
      throw error;
    }
  }

  getConnection() {
    return this.connection;
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

module.exports = new Database();