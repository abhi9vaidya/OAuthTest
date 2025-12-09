import React, { useEffect, useState } from "react";
// Vite uses import.meta.env to expose env vars:
const BACKEND = import.meta.env.VITE_BACKEND_ORIGIN || "http://localhost:5000";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Step: call /me to verify if user is logged in. This endpoint checks the session cookie.
    // Flow recap:
    // 1) If not logged in -> backend has no session -> /me returns 401.
    // 2) If logged in -> /me returns user info stored in the session, that we then show.
    async function fetchMe() {
      try {
        setLoading(true);
        const res = await fetch(`${BACKEND}/me`, {
          credentials: "include",
        });
        if (res.status === 200) {
          const data = await res.json();
          setUser(data.user);
          setError(null);
        } else {
          setUser(null);
        }
      } catch (err) {
        setError("Failed to contact server");
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, []);

  const redirectToGoogle = () => {
    // Redirect user to backend endpoint that starts the OAuth flow
    window.location.href = `${BACKEND}/auth/google`;
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(`${BACKEND}/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setUser(null);
      } else {
        setError("Failed to logout");
      }
    } catch {
      setError("Failed to logout");
    }
  };

  if (loading) return <div className="center">Loading...</div>;
  if (error) return <div className="center">Error: {error}</div>;

  return (
    <div className="root">
      {!user ? (
        <div className="center">
          <button className="login-btn" onClick={redirectToGoogle}>
            Login with Google
          </button>
        </div>
      ) : (
        <div className="center">
          <img src={user.picture} alt="avatar" className="avatar" />
          <h2>Welcome, {user.name}</h2>
          <p>{user.email}</p>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
