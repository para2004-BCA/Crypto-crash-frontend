// src/pages/AuthPage.js
import React, { useState } from 'react';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:5000'; // ✅ change if deployed

export default function AuthPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    setError('');
    if (!username.trim()) return setError("Username is required");

    try {
      if (isLoginMode) {
        const res = await axios.post(`${BACKEND_URL}/api/player/login`, { username });
        onLogin(res.data); // callback to parent App
      } else {
        const res = await axios.post(`${BACKEND_URL}/api/player/register`, { username });
        onLogin(res.data);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setError("Username already exists");
      } else if (err.response?.status === 404) {
        setError("User not found");
      } else {
        setError("Server error, try again");
      }
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>{isLoginMode ? "Login" : "Register"}</h2>
      <input
        type="text"
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="Username"
      />
      <br />
      <button onClick={handleAuth}>
        {isLoginMode ? "Login" : "Register"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>
        {isLoginMode ? "Don't have an account?" : "Already have an account?"}
        <button onClick={() => setIsLoginMode(!isLoginMode)}>
          {isLoginMode ? "Register here" : "Login here"}
        </button>
      </p>
    </div>
  );
}
