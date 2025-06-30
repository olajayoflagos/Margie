import React, { useState } from "react";
import "./AdminLogin.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const nav = useNavigate();
      if (user.uid === "aI2M8Jt2TrSav72XthNdvTHnHzD3") {
        onLogin();
        nav("/admin")
      } else {
        setErr("Access denied");
      }
    } catch {
      alert("Incorrect credentials");
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
          onChange={e => setEmail(e.target.value)}
          className="admin-login-input"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="admin-login-input"
          required
        />
        <button type="submit" className="admin-login-button">
          Login
        </button>
      </form>
    </div>
  );
}