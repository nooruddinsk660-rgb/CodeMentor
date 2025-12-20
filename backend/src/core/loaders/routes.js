const authRoutes = require('../../modules/auth/auth.routes');
const userRoutes = require('../../modules/users/user.routes');
const githubRoutes = require('../../modules/github/github.routes');
const matchRoutes = require('../../modules/matchmaking/match.routes');
const aiRoutes = require('../../modules/ai/ai.routes');

function loadRoutes(app) {
  app.use('/auth', authRoutes);
  app.use('/users', userRoutes);
  app.use('/github', githubRoutes);
  app.use('/match', matchRoutes);
  app.use('/ai', aiRoutes);
}

module.exports = { loadRoutes };