const express = require('express');
const passport = require('./passport-setup');
const authController = require('./auth.controller');
const { authMiddleware } = require('../../common/middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/reset-password', authController.resetPasswordRequest);
router.post('/verify', authController.verifyToken);

// GitHub OAuth routes
router.get('/github', 
  passport.authenticate('github', { scope: ['user:email', 'read:user', 'repo'] })
);

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  authController.githubCallback
);

// Protected routes
router.post('/change-password', authMiddleware, authController.changePassword);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.me);


module.exports = router;