require('dotenv').config();

const requiredEnvVars = [
  'MONGO_URI',
  'NEO4J_URI',
  'NEO4J_USER',
  'NEO4J_PASS',
  'JWT_SECRET',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'SESSION_SECRET'
];

function validateEnv() {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,

  mongo: {
    uri: process.env.MONGO_URI
  },

  neo4j: {
    uri: process.env.NEO4J_URI,
    user: process.env.NEO4J_USER,
    password: process.env.NEO4J_PASS
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRE || '7d'
  },

  github: {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/auth/github/callback'
  },

  session: {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  },

  aiService: {
    url: process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000'
  },

  cors: {
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
  },

  isDevelopment: () => config.env === 'development',
  isProduction: () => config.env === 'production',
  isTest: () => config.env === 'test'
};

if (config.env !== 'test') {
  validateEnv();
}

module.exports = config;