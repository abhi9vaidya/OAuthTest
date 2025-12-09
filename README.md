# Google OAuth Login Demo

A minimal, clean full-stack web application demonstrating Google OAuth 2.0 login flow.

**Features:**
- Simple "Login with Google" button
- Secure session management with HTTP-only cookies
- Display user's Google profile (name, email, picture)
- Logout functionality
- Full comments explaining OAuth flow

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Tech Stack](#tech-stack)
3. [Google Cloud Setup](#google-cloud-setup)
4. [Installation & Setup](#installation--setup)
5. [Running the App](#running-the-app)
6. [OAuth Flow Explained](#oauth-flow-explained)
7. [API Endpoints](#api-endpoints)

---

## Project Structure

```
GoogleLogin_OAuth/
├── server/
│   ├── index.js          # Express server & OAuth routes
│   ├── auth.js           # Passport Google OAuth strategy
│   ├── package.json
│   ├── .env.example      # Template for environment variables
│   └── .env              # (Create this, never commit)
├── client/
│   ├── src/
│   │   ├── App.jsx       # React app with login/logout logic
│   │   ├── main.jsx      # React entry point
│   │   └── styles.css    # Simple styles
│   ├── index.html        # HTML template
│   ├── vite.config.js    # Vite configuration
│   ├── package.json
│   └── .env.example      # Frontend env template
├── .gitignore            # Git ignore file
├── README.md             # This file
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite |
| **Backend** | Node.js + Express |
| **Auth** | Passport.js + passport-google-oauth20 |
| **Session** | Express Session (HTTP-only cookies) |

---

## Google Cloud Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown and select **"New Project"**
3. Enter a project name (e.g., "OAuth Test") and click **Create**

### Step 2: Enable Google+ API

1. Go to **APIs & Services** > **Library**
2. Search for **"Google+ API"**
3. Click it and select **Enable**

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type (for testing)
3. Fill in the required fields:
   - **App name**: Your app name (e.g., "OAuth Test")
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click **Save and Continue**
5. (Scopes page) Click **Save and Continue**
6. (Summary page) Click **Back to Dashboard**

### Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ Create Credentials** > **OAuth client ID**
3. Choose **Web application**
4. Under **Authorized redirect URIs**, add:
   - `http://localhost:5000/auth/google/callback`
5. Click **Create**
6. Copy the **Client ID** and **Client Secret** from the popup

### Step 5: Add Your Credentials to `.env`

In the `server/` folder, create a `.env` file (copy from `.env.example`):

```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
SESSION_SECRET=your-random-secret
FRONTEND_ORIGIN=http://localhost:3000
BACKEND_ORIGIN=http://localhost:5000
```

⚠️ **Never commit `.env` to git!** It's already in `.gitignore`.

---

## Installation & Setup

### Prerequisites
- Node.js 16+ installed
- npm or yarn

### Backend Setup

```bash
cd server
npm install
```

### Frontend Setup

```bash
cd client
npm install
```

---

## Running the App

### Terminal 1: Start Backend

```bash
cd server
npm run dev
```

Expected output:
```
Server listening on port 5000
Frontend origin allowed: http://localhost:3000
```

### Terminal 2: Start Frontend

```bash
cd client
npm run dev
```

Expected output:
```
VITE v5.4.21 ready in XXX ms
  ➜  Local:   http://localhost:3000/
```

### Open in Browser

Open **http://localhost:3000** in your browser and click **"Login with Google"**!

---

## OAuth Flow Explained

The OAuth 2.0 authorization code flow used here:

```
User                Frontend              Backend                Google
  │                    │                    │                     │
  ├─ Click Login ──────>│                    │                     │
  │                    ├─ Redirect to /auth/google ───────────────>│
  │                    │                    │                     │
  │                    │<─────── User sees Google Login ──────────┤
  │                    │                    │                     │
  │<───────────────────── User approves ─────────────────────────┤
  │                    │                    │                     │
  │                    │<─ Code parameter ─────────────────────┤
  │                    │                    │                     │
  │                    ├─ POST /callback ───>│                     │
  │                    │    with code        │                     │
  │                    │                    ├─ Exchange code ────>│
  │                    │                    │   for tokens        │
  │                    │                    │<─ Access token ────┤
  │                    │                    │   & user profile    │
  │                    │                    │                     │
  │                    │<─ Set cookie (session) ────              │
  │                    │   Redirect to /    │                     │
  │<─ Logged In! ──────│                    │                     │
```

**Step-by-step:**

1. **User clicks "Login with Google"**
   - Frontend redirects to `/auth/google` on backend

2. **Backend redirects to Google**
   - Passport initiates OAuth flow
   - User sees Google's login & consent screen

3. **User approves**
   - Google sends an `authorization code` to `/auth/google/callback`

4. **Backend exchanges code for tokens**
   - Backend uses `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   - Calls Google API to exchange code for `access_token` and `id_token`
   - Backend extracts user profile (name, email, picture)

5. **Session created**
   - Backend calls `req.login()` to create a session
   - Session stored in memory (for demo; use Redis in production)
   - HTTP-only cookie sent to browser (secure, not accessible via JS)

6. **Frontend displays user**
   - Frontend calls `/me` to get logged-in user info
   - Shows "Welcome, [Name]" with profile picture

7. **Logout**
   - User clicks logout
   - Frontend calls `POST /logout`
   - Backend destroys session and clears cookie

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/auth/google` | Redirect to Google OAuth consent screen |
| `GET` | `/auth/google/callback` | OAuth callback (Google redirects here with code) |
| `GET` | `/me` | Get current logged-in user (requires valid session) |
| `POST` | `/logout` | Logout and destroy session |

### Example Responses

**GET /me** (logged in)
```json
{
  "user": {
    "id": "google-user-id",
    "name": "Your Name",
    "email": "your@email.com",
    "picture": "https://lh3.googleusercontent.com/..."
  }
}
```

**GET /me** (not logged in)
```json
{
  "error": "Not logged in"
}
```

---

## Environment Variables

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_CLIENT_ID` | OAuth client ID from Google Cloud | `1234567890-abc...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret (keep secret!) | `GOCSPX-abc123...` |
| `SESSION_SECRET` | Secret for signing session cookies | `my-super-secret-key` |
| `FRONTEND_ORIGIN` | Frontend URL (for CORS & redirects) | `http://localhost:3000` |
| `BACKEND_ORIGIN` | Backend URL (for OAuth callback) | `http://localhost:5000` |

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_BACKEND_ORIGIN` | Backend API URL | `http://localhost:5000` |

---

## Security Notes

- 🔒 **HTTP-only cookies**: Session cookies cannot be accessed via JavaScript (prevents XSS attacks)
- 🔐 **Client secret never exposed**: OAuth token exchange happens on the backend only
- 🚫 **No password storage**: Pure OAuth 2.0 flow—no passwords stored in your database
- ⚠️ **Never commit .env**: Credentials are in `.gitignore`

---

## Troubleshooting

### "Invalid Client" Error
- **Cause**: Google's OAuth settings haven't synced yet
- **Fix**: Wait 5-10 minutes and try again, or create a new OAuth client

### "Cannot GET /auth/google"
- **Cause**: Frontend is not connecting to the right backend
- **Fix**: Check `.env` files and ensure both servers are running

### "Not logged in" on /me
- **Cause**: Session cookie not being sent
- **Fix**: Check browser DevTools > Application > Cookies, ensure `connect.sid` exists

### CORS Error
- **Cause**: Frontend origin doesn't match `FRONTEND_ORIGIN` in backend `.env`
- **Fix**: Update `.env` to match your frontend URL

---

## Production Deployment

Before deploying to production:

1. **Change to HTTPS**: Update redirect URIs in Google Cloud and `.env`
2. **Use secure cookies**: Set `secure: true` in session config
3. **Use a session store**: Replace in-memory sessions with Redis or MongoDB
4. **Add rate limiting**: Prevent brute-force attacks
5. **Set strong secrets**: Use long random strings for `SESSION_SECRET`
6. **Enable CSRF protection**: Add csrf middleware for POST requests

---

## License

MIT - Feel free to use this for learning and projects!

---

## Questions?

Check the comments in the code for detailed explanations of:
- Google OAuth strategy setup (`server/auth.js`)
- OAuth endpoints (`server/index.js`)
- Frontend login flow (`client/src/App.jsx`)
