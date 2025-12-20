const bcrypt = require('bcryptjs');
const User = require('../users/user.model');
const { jwtService } = require('../../common/middleware/authMiddleware');
const logger = require('../../core/config/loggerConfig');
const { ValidationError, UnauthorizedError } = require('../../common/middleware/errorHandler');
const skillGraphService = require('../../common/utils/skillGraph');

class AuthService {
  async register(userData) {
    try {
      const { username, email, password, fullName } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        throw new ValidationError('Username or email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = new User({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
        fullName,
        isVerified: false
      });

      await user.save();

      // Create user node in Neo4j
      await skillGraphService.createUserNode(user._id, {
        username: user.username,
        email: user.email,
        xp: user.xp
      });

      // Generate JWT token
      const token = jwtService.generateToken({
        userId: user._id,
        username: user.username,
        email: user.email
      });

      logger.info(`New user registered: ${user.username}`);

      return {
        token,
        user: user.toJSON()
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  async login(credentials) {
    try {
      const { email, password } = credentials;

      // Find user and include password field
      const user = await User.findOne({ email: email.toLowerCase() })
        .select('+password');

      if (!user) {
        throw new UnauthorizedError('Invalid email or password');
      }

      if (!user.password) {
        throw new UnauthorizedError('Please login with GitHub or reset your password');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid email or password');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = jwtService.generateToken({
        userId: user._id,
        username: user.username,
        email: user.email
      });

      logger.info(`User logged in: ${user.username}`);

      // Remove password from response
      const userObject = user.toJSON();
      delete userObject.password;

      return {
        token,
        user: userObject
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  async loginWithGithub(githubUser) {
    try {
      // User is already created/updated by passport strategy
      const user = await User.findById(githubUser._id);

      if (!user) {
        throw new UnauthorizedError('GitHub authentication failed');
      }

      // Generate JWT token
      const token = jwtService.generateToken({
        userId: user._id,
        username: user.username,
        email: user.email
      });

      logger.info(`User logged in with GitHub: ${user.username}`);

      return {
        token,
        user: user.toJSON()
      };
    } catch (error) {
      logger.error('GitHub login error:', error);
      throw error;
    }
  }

  async refreshToken(oldToken) {
    try {
      const newToken = jwtService.refreshToken(oldToken);
      return { token: newToken };
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw new UnauthorizedError('Failed to refresh token');
    }
  }

  async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      if (!user.password) {
        throw new ValidationError('Account uses GitHub authentication');
      }

      // Verify old password
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedError('Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
      await user.save();

      logger.info(`Password changed for user: ${user.username}`);

      return { message: 'Password changed successfully' };
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }

  async resetPasswordRequest(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        // Don't reveal if email exists or not for security
        logger.info(`Password reset requested for non-existent email: ${email}`);
        return { message: 'If the email exists, a reset link will be sent' };
      }

      // In production, generate reset token and send email
      // For now, just log
      logger.info(`Password reset requested for user: ${user.username}`);

      return { message: 'If the email exists, a reset link will be sent' };
    } catch (error) {
      logger.error('Password reset request error:', error);
      throw error;
    }
  }

  async verifyToken(token) {
    try {
      const { valid, decoded, error } = jwtService.verifyToken(token);

      if (!valid) {
        throw new UnauthorizedError(error);
      }

      return { valid: true, user: decoded };
    } catch (error) {
      logger.error('Token verification error:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();