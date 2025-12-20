const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const config = require('../config/env');
const { configureMiddleware } = require('../app');

async function loadExpress() {
  const app = express();
  
  // Session
  app.use(session({
    ...config.session,
    store: MongoStore.create({
      mongoUrl: config.mongo.uri
    })
  }));
  
  // Passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Apply middleware
  configureMiddleware(app);
  
  return app;
}

module.exports = { loadExpress };