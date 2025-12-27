const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { ApolloServer } = require('apollo-server-express');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const config = require('./core/config/env');
const logger = require('./core/config/loggerConfig');
const { errorHandler, notFoundHandler } = require('./common/middleware/errorHandler');

const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const githubRoutes = require('./modules/github/github.routes');
const matchRoutes = require('./modules/matchmaking/match.routes');
const aiRoutes = require('./modules/ai/ai.routes');
const skillsRoutes = require("./modules/skills/skills.routes");
const dailyRoutes = require("./modules/daily/daily.routes")

const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const graphqlContext = require('./graphql/context');

const passport = require('./modules/auth/passport-setup');

async function createServer() {
  const app = express();


  // Trust proxy for production (required for rate limiting behind reverse proxy)
  if (config.isProduction()) {
    app.set('trust proxy', 1);
  }

  // ===== SECURITY MIDDLEWARE =====

  // Helmet - Secure HTTP headers
  app.use(helmet({
    contentSecurityPolicy: config.isProduction() ? {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      }
    } : false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  }));

  // CORS with strict configuration
  const corsOptions = {
    origin: (origin, callback) => {
      const allowedOrigins = Array.isArray(config.cors.origin) 
        ? config.cors.origin 
        : [config.cors.origin];
      
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400 // 24 hours
  };
  
  app.use(cors(corsOptions));

  // Response compression
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6
  }));

  // Body parsing with size limits
  app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
      try {
        JSON.parse(buf);
      } catch (e) {
        logger.error('Invalid JSON in request body');
        throw new Error('Invalid JSON');
      }
    }
  }));
  
  app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb',
    parameterLimit: 1000
  }));

  // NoSQL injection protection
  app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      logger.warn(`Potential NoSQL injection attempt detected in ${key}`);
    }
  }));

  // Session configuration with MongoDB store
  const sessionConfig = {
    ...config.session,
    store: MongoStore.create({
      mongoUrl: config.mongo.uri,
      touchAfter: 24 * 3600, // Lazy session update
      crypto: {
        secret: config.session.secret
      }
    }),
    name: 'sessionId', // Don't use default 'connect.sid'
    proxy: config.isProduction()
  };

  app.use(session(sessionConfig));
  app.use(passport.initialize());
  app.use(passport.session());

  // ===== RATE LIMITING =====

  // General API rate limiter
  const generalLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: { 
      success: false, 
      error: 'Too many requests, please try again later.' 
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later.'
      });
    }
  });

  // Strict rate limiter for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    skipSuccessfulRequests: false,
    message: { 
      success: false, 
      error: 'Too many authentication attempts, please try again later.' 
    }
  });

  // GitHub analysis rate limiter (resource intensive)
  const analysisLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 analyses per hour
    message: { 
      success: false, 
      error: 'Analysis limit reached, please try again later.' 
    }
  });

  // ===== REQUEST LOGGING =====
  
  app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.http(`${req.method} ${req.path}`, {
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
    });
    
    next();
  });

  // ===== ROOT & HEALTH ENDPOINTS =====

  // Root endpoint
  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'CodeMentor AI Backend API',
      version: '1.0.0',
      environment: config.env,
      endpoints: {
        health: '/health',
        status: '/api/status',
        graphql: '/graphql',
        auth: '/auth',
        users: '/users',
        github: '/github',
        match: '/match',
        ai: '/ai'
      },
      documentation: config.isDevelopment() ? '/graphql' : null,
      timestamp: new Date().toISOString()
    });
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.env,
      version: process.env.npm_package_version || '1.0.0'
    });
  });

  // API status endpoint
  app.get('/api/status', (req, res) => {
    res.status(200).json({
      success: true,
      service: 'CodeMentor AI Backend',
      version: '1.0.0',
      environment: config.env,
      timestamp: new Date().toISOString()
    });
  });

  // ===== GRAPHQL SETUP (MUST BE BEFORE API ROUTES) =====

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: graphqlContext,
    playground: config.isDevelopment(),
    introspection: config.isDevelopment(),
    formatError: (error) => {
      // Log GraphQL errors
      logger.error('GraphQL Error:', {
        message: error.message,
        path: error.path,
        extensions: error.extensions
      });

      // Don't expose internal errors in production
      if (config.isProduction() && !error.message.startsWith('Not authenticated')) {
        return new Error('An error occurred while processing your request');
      }

      return error;
    },
    debug: config.isDevelopment(),
    persistedQueries: false, // Disable for security unless needed
  });

  // Start Apollo Server and apply middleware
  await apolloServer.start();
  apolloServer.applyMiddleware({ 
    app, 
    path: '/graphql',
    cors: false, // We already configured CORS
    bodyParserConfig: {
      limit: '5mb'
    }
  });
  
  logger.info('GraphQL endpoint ready at /graphql');

  // ===== API ROUTES (AFTER GRAPHQL) =====

  // Apply strict rate limiting to auth routes
  app.use('/auth', authLimiter, authRoutes);
  
  // Apply general rate limiting to other routes
  app.use('/users', generalLimiter, userRoutes);
  app.use('/github', generalLimiter, githubRoutes);
  app.use('/matches', generalLimiter, matchRoutes);
  app.use('/ai', generalLimiter, aiRoutes);
  app.use("/skills", skillsRoutes);
  app.use('/daily', dailyRoutes);

  // Apply analysis-specific rate limiting to specific endpoint
  app.post('/github/analyze/:username', analysisLimiter);

  // ===== ERROR HANDLING =====

  // 404 handler (must be after all routes)
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  // ===== GRACEFUL SHUTDOWN =====

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't crash in production, but log the error
    if (!config.isProduction()) {
      process.exit(1);
    }
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    // Exit process on uncaught exception
    process.exit(1);
  });

  return app;
}

module.exports = createServer;