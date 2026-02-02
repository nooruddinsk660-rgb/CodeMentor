// backend/src/modules/auth/passport-setup.js
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const config = require('../../core/config/env');
const User = require('../users/user.model');
const logger = require('../../core/config/loggerConfig');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GitHubStrategy(
    {
      clientID: config.github.clientID,
      clientSecret: config.github.clientSecret,
      callbackURL: config.github.callbackURL,
      scope: ['user:email', 'read:user', 'public_repo'], // Changed 'repo' to 'public_repo' for least privilege unless you explicitly need private access
      passReqToCallback: true // Important for linking accounts later if needed
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        logger.info(`GitHub OAuth callback for user: ${profile.username}`);

        // Robust email extraction (GitHub profile.emails can be empty if private)
        let email = profile.emails && profile.emails[0]?.value;

        if (!email) {
          // Fallback: This user might not have a public email. 
          // In production, you might want to fetch it using the accessToken from the /user/emails endpoint.
          // For now, we generate a placeholder to prevent schema validation errors.
          email = `${profile.username}@github.orbitdev.io`;
        }

        // 1. Check if user exists by GitHub ID
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
          // Update tokens and profile data
          user.githubAccessToken = accessToken;
          user.avatar = profile.photos?.[0]?.value || user.avatar;
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }

        // 2. Check if user exists by Email (Account Linking)
        user = await User.findOne({ email });

        if (user) {
          // Link GitHub to existing account
          user.githubId = profile.id;
          user.githubAccessToken = accessToken;
          if (!user.avatar) user.avatar = profile.photos?.[0]?.value;
          await user.save();
          return done(null, user);
        }

        // 3. Create New User
        const newUser = new User({
          githubId: profile.id,
          username: profile.username.toLowerCase(),
          email: email.toLowerCase(),
          fullName: profile.displayName || profile.username,
          bio: profile._json.bio || '',
          avatar: profile.photos?.[0]?.value,
          githubAccessToken: accessToken,
          isVerified: true, // GitHub users are implicitly verified
          githubData: {
            username: profile.username,
            profileUrl: profile.profileUrl,
            publicRepos: profile._json.public_repos,
            followers: profile._json.followers,
            following: profile._json.following
          }
        });

        await newUser.save();
        logger.info(`New user created via GitHub: ${newUser.username}`);
        return done(null, newUser);

      } catch (error) {
        logger.error('Error in GitHub OAuth strategy:', error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;