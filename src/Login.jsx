// Login.jsx
import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import "./Auth.css"; 

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const auth = getAuth();
  
  const nav = useNavigate();

  const submit = async e => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, pw);
      nav("/");
    } catch {
      setErr("Login failed");
    }
  };

  return (
    <form onSubmit={submit} className="auth-form">
      <h2>Log In</h2>
      {err && <p className="error">{err}</p>}
      <input type="email" placeholder="Email" value={email}
             onChange={e=>setEmail(e.target.value)} required/>
      <input type="password" placeholder="Password" value={pw}
             onChange={e=>setPw(e.target.value)} required/>
      <button type="submit">Log In</button>
  <p className="auth-form__forgot">
    <button
      type="button"
      className="forgot-btn"
      onClick={async () => {
        try {
          await sendPasswordResetEmail(auth, email);
          alert("Password reset email sent!");
        } catch {
          alert("Failed to send reset email.");
        }
      }}
    >
      Forgot password?
    </button>
  </p>
    </form>
  );
}
