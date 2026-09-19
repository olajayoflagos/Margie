// Signup.jsx
import { useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import Seo from "./seo/Seo";
import { friendlyError } from "./utils/errors";
import "./Auth.css";

const googleProvider = new GoogleAuthProvider();

export default function Signup() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const auth = getAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, pw);

      // A Cloud Function (sendWelcomeEmail, functions/index.js) sends the
      // welcome email server-side as soon as this account is created - it
      // doesn't depend on the browser staying open. The verification email
      // is triggered from here; if it fails to send we still let the guest
      // into their new account (they land on /verify-email, which offers a
      // "Resend" button), so this is allowed to fail quietly.
      try {
        await sendEmailVerification(userCred.user);
      } catch (notifyError) {
        if (import.meta.env.DEV) console.warn("[signup] verification email failed", notifyError);
      }

      // Email/password accounts must verify before they can use the site -
      // App.jsx enforces this by gating every route until emailVerified is
      // true. Google accounts (handleGoogle below) skip this entirely since
      // Google has already verified the address.
      nav("/verify-email");
    } catch (error) {
      setErr(friendlyError(error, "We couldn't create your account. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setErr("");
    setGoogleBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
      nav("/");
    } catch (error) {
      if (error?.code !== "auth/popup-closed-by-user" && error?.code !== "auth/cancelled-popup-request") {
        setErr(friendlyError(error, "We couldn't sign you up with Google. Please try again."));
      }
    } finally {
      setGoogleBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <Seo
        title="Create an Account | Margie's"
        description="Create a Margie's account to book rooms and manage your stays."
        path="/signup"
        noindex
      />
      <form onSubmit={submit} className="auth-form">
        <h1>Sign Up</h1>

        {err && <p className="auth-form__error" role="alert">{err}</p>}

        <button
          type="button"
          className="google-btn"
          onClick={handleGoogle}
          disabled={googleBusy || busy}
        >
          <FcGoogle size={20} />
          {googleBusy ? "Signing up…" : "Continue with Google"}
        </button>

        <div className="auth-divider"><span>or</span></div>

        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          minLength={6}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          required
        />

        <label className="terms">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            required
          />
          <span>
            I agree to the{" "}
            <a href="/Terms_Conditions_Margies.pdf" target="_blank" rel="noopener noreferrer">
              Terms &amp; Conditions
            </a>
          </span>
        </label>

        <button type="submit" disabled={!agreed || busy}>
          {busy ? "Creating account…" : "Sign Up"}
        </button>

        <p className="auth-form__switch">
          Do you have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </main>
  );
}
