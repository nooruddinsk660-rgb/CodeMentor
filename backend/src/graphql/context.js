const { jwtService } = require('../common/middleware/authMiddleware');

async function context({ req }) {
  const authHeader = req.headers.authorization;
  const token = jwtService.extractTokenFromHeader(authHeader);

  if (token) {
    const { valid, decoded } = jwtService.verifyToken(token);
    if (valid) {
      return { user: decoded };
    }
  }

  return { user: null };
}

module.exports = context;