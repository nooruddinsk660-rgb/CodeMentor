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
      scope: ['user:email', 'read:user', 'repo']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        logger.info(`GitHub OAuth callback for user: ${profile.username}`);

        // Extract email from profile
        const email = profile.emails && profile.emails.length > 0 
          ? profile.emails[0].value 
          : `${profile.username}@github.user`;

        // Check if user exists
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
          // Update existing user
          user.githubAccessToken = accessToken;
          user.avatar = profile.photos && profile.photos.length > 0 
            ? profile.photos[0].value 
            : user.avatar;
          user.lastLogin = new Date();
          
          await user.save();
          logger.info(`Existing user logged in: ${user.username}`);
        } else {
          // Check if email already exists (user might have signed up differently)
          user = await User.findOne({ email });

          if (user) {
            // Link GitHub account to existing user
            user.githubId = profile.id;
            user.githubAccessToken = accessToken;
            user.avatar = profile.photos && profile.photos.length > 0 
              ? profile.photos[0].value 
              : user.avatar;
            user.lastLogin = new Date();
            
            await user.save();
            logger.info(`GitHub account linked to existing user: ${user.username}`);
          } else {
            // Create new user
            user = new User({
              githubId: profile.id,
              username: profile.username.toLowerCase(),
              email,
              fullName: profile.displayName || profile.username,
              bio: profile._json.bio || '',
              avatar: profile.photos && profile.photos.length > 0 
                ? profile.photos[0].value 
                : null,
              githubAccessToken: accessToken,
              githubData: {
                username: profile.username,
                profileUrl: profile.profileUrl,
                avatarUrl: profile.photos && profile.photos.length > 0 
                  ? profile.photos[0].value 
                  : null,
                bio: profile._json.bio,
                company: profile._json.company,
                location: profile._json.location,
                publicRepos: profile._json.public_repos,
                followers: profile._json.followers,
                following: profile._json.following
              },
              isVerified: true,
              lastLogin: new Date()
            });

            await user.save();
            logger.info(`New user created via GitHub: ${user.username}`);
          }
        }

        return done(null, user);
      } catch (error) {
        logger.error('Error in GitHub OAuth strategy:', error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;