const { loadRoutes } = require('../core/loaders/routes');

function registerRESTEndpoints(app) {
  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'CodeMentor AI Backend',
      version: '1.0.0',
      endpoints: {
        graphql: '/graphql',
        auth: '/auth',
        users: '/users',
        github: '/github',
        match: '/match',
        ai: '/ai'
      }
    });
  });
  
  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // Load all routes
  loadRoutes(app);
}

module.exports = { registerRESTEndpoints };