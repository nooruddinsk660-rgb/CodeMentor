const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const config = require('../core/config/env');
const { requestLogger } = require('../common/middleware/requestLogger');

function configureMiddleware(app) {
  // Security
  app.use(helmet());

  // ✅ CORS must be early
  app.use(cors(config.cors));

  // Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Sanitization
  app.use(mongoSanitize());

  // Compression
  app.use(compression());

  // Logging
  app.use(requestLogger);

  return app;
}

module.exports = { configureMiddleware };
