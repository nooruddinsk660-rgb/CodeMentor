const authService = require('./auth.service');
const { asyncHandler } = require('../../common/middleware/errorHandler');
const Joi = require('joi');
const config = require('../../core/config/env');

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  fullName: Joi.string().min(2).max(100)
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required()
});

class AuthController {
  register = asyncHandler(async (req, res) => {
    const { error, value } = registerSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const result = await authService.register(value);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });
  });

  login = asyncHandler(async (req, res) => {
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const result = await authService.login(value);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  });

  githubCallback = asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.redirect(`${config.cors.origin}/login?error=github_auth_failed`);
    }

    const result = await authService.loginWithGithub(req.user);

    // Redirect to frontend with token
    res.redirect(
      `${config.cors.origin}/auth/callback?token=${result.token}`
    );
  });

  refreshToken = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }

    const result = await authService.refreshToken(token);

    res.status(200).json({
      success: true,
      data: result
    });
  });

  changePassword = asyncHandler(async (req, res) => {
    const { error, value } = changePasswordSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    await authService.changePassword(
      req.user.userId,
      value.oldPassword,
      value.newPassword
    );

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  });

  resetPasswordRequest = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    await authService.resetPasswordRequest(email);

    res.status(200).json({
      success: true,
      message: 'If the email exists, a reset link will be sent'
    });
  });

  verifyToken = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }

    const result = await authService.verifyToken(token);

    res.status(200).json({
      success: true,
      data: result
    });
  });

  logout = asyncHandler(async (req, res) => {
    // JWT is stateless, so we just return success
    // Client should remove token from storage
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  });
}

module.exports = new AuthController();