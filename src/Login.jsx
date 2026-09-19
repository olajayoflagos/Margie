// Login.jsx
import { useState } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import Seo from "./seo/Seo";
import { friendlyError } from "./utils/errors";
import "./Auth.css";

const googleProvider = new GoogleAuthProvider();

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const auth = getAuth();
  const nav = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setNotice("");
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email, pw);
      nav(redirectTo, { replace: true });
    } catch (error) {
      setErr(friendlyError(error, "We couldn't sign you in. Please check your details and try again."));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setErr("");
    setNotice("");
    setGoogleBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
      nav(redirectTo, { replace: true });
    } catch (error) {
      // A user simply closing the Google popup isn't worth showing as an error.
      if (error?.code !== "auth/popup-closed-by-user" && error?.code !== "auth/cancelled-popup-request") {
        setErr(friendlyError(error, "We couldn't sign you in with Google. Please try again."));
      }
    } finally {
      setGoogleBusy(false);
    }
  };

  const handleReset = async () => {
    setErr("");
    setNotice("");
    if (!email) {
      setErr("Enter your email address above first, then tap “Forgot password?”.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setNotice("If an account exists for that email, a reset link is on its way. Check your inbox and spam folder.");
    } catch (error) {
      setErr(friendlyError(error, "We couldn't send the reset email just now. Please try again shortly."));
    }
  };

  return (
    <main className="auth-page">
      <Seo
        title="Log In | Margie's"
        description="Log in to your Margie's account to manage your bookings."
        path="/login"
        noindex
      />
      <form onSubmit={submit} className="auth-form">
        <h1>Log In</h1>

        {err && <p className="auth-form__error" role="alert">{err}</p>}
        {notice && <p className="auth-form__notice" role="status">{notice}</p>}

        <button
          type="button"
          className="google-btn"
          onClick={handleGoogle}
          disabled={googleBusy || busy}
        >
          <FcGoogle size={20} />
          {googleBusy ? "Signing in…" : "Continue with Google"}
        </button>

        <div className="auth-divider"><span>or</span></div>

        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          required
        />

        <button type="submit" disabled={busy}>
          {busy ? "Logging in…" : "Log In"}
        </button>

        <p className="auth-form__forgot">
          <button type="button" className="forgot-btn" onClick={handleReset}>
            Forgot password?
          </button>
        </p>

        <p className="auth-form__switch">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </main>
  );
}
