/*
  Simple Node + Express backend with Google OAuth using passport.
  Endpoints:
    GET /auth/google -> redirect to Google consent
    GET /auth/google/callback -> handle OAuth code exchange and create session
    GET /me -> returns current user
    POST /logout -> destroys session
*/
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('./auth');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

// CORS - allow the frontend origin and credentials (cookies) to be sent
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

/*
  Session setup:
  - We use server-side sessions stored in memory (for demo only); in production use a store like Redis.
  - Cookie settings: httpOnly prevents JS access to cookie (mitigates XSS), secure should be true on HTTPS.
  - `secret` signs the session ID cookie; keep it safe in .env as SESSION_SECRET.
*/
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));

// Initialize passport and session hooks
app.use(passport.initialize());
app.use(passport.session());

// --- OAuth endpoints ---

/*
  /auth/google
  - Redirects the user to Google's OAuth 2.0 consent page.
  - User will see Google's login screen and permission request.
  - After user approves, Google sends them to /auth/google/callback with an authorization code.
*/
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/*
  /auth/google/callback
  - Google redirects here after user approves.
  - The "authorization code" in the URL is exchanged for tokens on the backend.
  - Passport handles the code exchange automatically using clientID and clientSecret.
  - After exchange, we have the user's profile and create a session.
*/
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND_ORIGIN}/?error=auth` }),
  (req, res) => {
    // Successful authentication: session is created, redirect to frontend
    res.redirect(`${FRONTEND_ORIGIN}`);
  }
);

/*
  Note about the OAuth exchange:
  - Step: Google returns an `authorization code` to this callback URL.
  - Our Passport strategy (or our code) uses `client_id` and `client_secret` to exchange that code
    for an `access_token` and an `id_token` (JWT with basic user claims).
  - We avoid exposing `client_secret` to the browser by doing this on the server.
  - After exchange, we can call Google APIs if needed using `access_token`, or simply use `profile` info
    provided by the auth library (passport) to create a session.
*/

app.get('/me', (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.json({ user: req.user });
  }
  res.status(401).json({ error: 'Not logged in' });
});

app.post('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ error: 'Failed to destroy session' });
      }
      res.clearCookie('connect.sid', { path: '/'});
      res.json({ ok: true });
    });
  });
});

app.get('/', (req, res) => {
  res.send('Google OAuth demo backend');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Frontend origin allowed: ${FRONTEND_ORIGIN}`);
});
