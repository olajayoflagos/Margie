// AdminLogin.jsx
import { useState } from "react";
import "./AdminLogin.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase"; // adjust this path to your firebase config

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Only call onLogin if it's the correct admin
      if (user.uid === "aI2M8Jt2TrSav72XthNdvTHnHzD3") {
        onLogin();
      } else {
        alert("Access denied. Not an admin.");
      }
    } catch (error) {
      alert("Incorrect email or password.");
    }
  };

  return (
    <div className="admin-login-container">
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit} className="admin-login-form">
        <input
          type="email"
          placeholder="Admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="admin-login-input"
        />
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="admin-login-input"
        />
        <button type="submit" className="admin-login-button">Login</button>
      </form>
    </div>
  );
}

export default AdminLogin;
