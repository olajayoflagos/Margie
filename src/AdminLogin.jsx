import React, { useState } from "react";
import "./AdminLogin.css";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { auth, functions } from "./firebase";
import { useNavigate } from "react-router-dom";
import { friendlyError } from "./utils/errors";

const ensureAdminClaimFn = httpsCallable(functions, "ensureAdminClaim");

// The one and only admin mailbox. Kept in one place so the client-side check
// here always matches the server-side check in functions/index.js
// (ensureAdminClaim) and firestore.rules (isAdmin()).
const ADMIN_EMAIL = "admin@margies.com.ng";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");
  const [resetBusy, setResetBusy] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setNotice("");

    // Reject anything but the one admin mailbox before ever touching
    // Firebase - there is nothing to authenticate against for any other
    // address, admin or not.
    if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
      setErr(`Only ${ADMIN_EMAIL} can sign in here.`);
      return;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      let token = await cred.user.getIdTokenResult(true);

      // Whichever Firebase Auth account is currently signed in with
      // admin@margies.com.ng self-grants the `admin` custom claim here -
      // functions/index.js checks the token's email, not a hardcoded UID, so
      // this always works even if that account's UID changed (a password
      // reset, a re-created account, etc.) and overrides any stale claim
      // state left over from before.
      if (!token.claims.admin) {
        try {
          const { data } = await ensureAdminClaimFn();
          if (data?.granted) {
            token = await cred.user.getIdTokenResult(true);
          }
        } catch (claimErr) {
          if (import.meta.env.DEV) console.warn("[admin-login] ensureAdminClaim failed", claimErr);
        }
      }

      if (token.claims.admin) {
        navigate("/admin");
      } else {
        setErr("This account does not have admin access.");
      }
    } catch (error) {
      setErr(friendlyError(error, "We couldn't sign you in. Please check your details and try again."));
    }
  };

  // Always resets the one admin mailbox's password, regardless of what's
  // typed in the email field above (even if it's empty) - there is only ever
  // one admin account to reset.
  const handleReset = async () => {
    setErr("");
    setNotice("");
    setResetBusy(true);
    try {
      await sendPasswordResetEmail(auth, ADMIN_EMAIL);
      setNotice(`A password reset link has been sent to ${ADMIN_EMAIL}. Check that inbox.`);
    } catch (error) {
      setErr(friendlyError(error, "We couldn't send the reset email just now. Please try again shortly."));
    } finally {
      setResetBusy(false);
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
        {notice && <p className="admin-login-notice">{notice}</p>}
        <button type="submit" className="admin-login-button">
          Login
        </button>
        <p className="admin-login-forgot">
          <button type="button" className="admin-login-forgot-btn" onClick={handleReset} disabled={resetBusy}>
            {resetBusy ? "Sending…" : `Reset ${ADMIN_EMAIL} password`}
          </button>
        </p>
      </form>
    </div>
  );
}
