# Google OAuth Frontend (React + Vite)

This is a simple React app that talks to the backend to start OAuth login and display logged-in user details.

## Setup

1. Install dependencies and run:

   ```bash
   cd client
   npm install
   npm run dev
   ```

2. Open `http://localhost:3000` in the browser.

   The frontend will redirect the user to the backend `/auth/google` endpoint to start login.

## Environment Variables

- The frontend expects the backend to run at `http://localhost:5000` by default.
- You can set `VITE_BACKEND_ORIGIN` in a `.env` file in the `client/` folder if your backend runs elsewhere:

  ```env
  VITE_BACKEND_ORIGIN=http://localhost:5000
  ```

## How it works

- The "Login with Google" button redirects to the backend `/auth/google` endpoint.
- After login, the backend sets a secure session cookie.
- The frontend calls `/me` to get user info and displays it.
