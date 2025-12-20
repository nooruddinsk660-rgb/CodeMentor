const logger = require('../../core/config/loggerConfig');

function requestLogger(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(`${req.method} ${req.path}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    });
  });
  
  next();
}

module.exports = { requestLogger };