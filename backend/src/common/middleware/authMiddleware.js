const jwt = require('jsonwebtoken');
const config = require('../../core/config/env');
const logger = require('../../core/config/loggerConfig');

class JWTService {
  constructor() {
    this.secret = config.jwt.secret;
    this.expiresIn = config.jwt.expiresIn;
  }

  generateToken(payload, expiresIn = null) {
    try {
      const options = {
        expiresIn: expiresIn || this.expiresIn,
        issuer: 'orbitdev-ai',
        audience: 'orbitdev-users'
      };

      const token = jwt.sign(payload, this.secret, options);
      return token;
    } catch (error) {
      logger.error('Error generating JWT token:', error);
      throw new Error('Failed to generate authentication token');
    }
  }

  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.secret, {
        issuer: 'orbitdev-ai',
        audience: 'orbitdev-users'
      });
      return { valid: true, decoded };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        logger.warn('JWT token expired');
        return { valid: false, error: 'Token expired' };
      } else if (error.name === 'JsonWebTokenError') {
        logger.warn('Invalid JWT token');
        return { valid: false, error: 'Invalid token' };
      } else {
        logger.error('JWT verification error:', error);
        return { valid: false, error: 'Token verification failed' };
      }
    }
  }

  decodeToken(token) {
    try {
      return jwt.decode(token, { complete: true });
    } catch (error) {
      logger.error('Error decoding JWT token:', error);
      return null;
    }
  }

  refreshToken(token) {
    try {
      const { valid, decoded } = this.verifyToken(token);

      if (!valid) {
        throw new Error('Cannot refresh invalid token');
      }

      const { iat, exp, ...payload } = decoded;
      return this.generateToken(payload);
    } catch (error) {
      logger.error('Error refreshing JWT token:', error);
      throw new Error('Failed to refresh token');
    }
  }

  extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }
}

const jwtService = new JWTService();

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      });
    }

    const { valid, decoded, error } = jwtService.verifyToken(token);

    if (!valid) {
      return res.status(401).json({
        success: false,
        error: error || 'Invalid authentication token'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (token) {
      const { valid, decoded } = jwtService.verifyToken(token);
      if (valid) {
        req.user = decoded;
      }
    }

    next();
  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    next();
  }
};

module.exports = {
  jwtService,
  authMiddleware,
  optionalAuth
};