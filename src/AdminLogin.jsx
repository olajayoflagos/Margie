import React, { useState } from "react";
import "./AdminLogin.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      if (user && user.uid === "aI2M8Jt2TrSav72XthNdvTHnHzD3") {
        onLogin && onLogin();
        navigate("/admin");
      } else {
        setErr("Access denied");
      }
    } catch (error) {
      console.error(error);
      setErr("Incorrect credentials");
    }
  };

  return (
    <div className="admin-login-container">
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit} className="admin-login-form">
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="admin-login-input"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="admin-login-input"
          required
        />
        {err && <p className="admin-login-error">{err}</p>}
        <button type="submit" className="admin-login-button">
          Login
        </button>
      </form>
    </div>
  );
}