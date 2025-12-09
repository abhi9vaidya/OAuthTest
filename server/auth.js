require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Ensure Google OAuth credentials are configured
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env file');
}

/*
  Google OAuth Strategy Configuration:
  - clientID: Your app's ID from Google Cloud Console
  - clientSecret: Your app's secret from Google Cloud Console (keep this secret!)
  - callbackURL: The redirect URI after user approves - must match Google Cloud config
*/
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_ORIGIN || 'http://localhost:5000'}/auth/google/callback`
  },
  (accessToken, refreshToken, profile, done) => {
    /*
      This callback is called after Google returns the user's profile.
      We extract minimal user info and return it.
      In a real app, you might store this in a database and use it to find/create a user.
    */
    const user = {
      id: profile.id,
      name: profile.displayName,
      email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
      picture: profile.photos && profile.photos[0] ? profile.photos[0].value : null
    };
    done(null, user);
  }
));

/*
  Passport Serialization:
  - serializeUser: Store minimal data in the session cookie (just the user object)
  - deserializeUser: Retrieve user from session when request comes in with valid cookie
*/
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
