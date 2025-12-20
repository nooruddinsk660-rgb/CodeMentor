const express = require('express');
const { configureMiddleware } = require('./startup/configureMiddleware');

const authRoutes = require('./modules/auth/auth.routes');
const {
  notFoundHandler,
  errorHandler,
} = require('./common/middleware/errorHandler');

const app = express();

// ✅ Apply global middleware (CORS, body, security)
configureMiddleware(app);

// ✅ Routes
app.use('/auth', authRoutes);

// ✅ Error handlers MUST be last
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
