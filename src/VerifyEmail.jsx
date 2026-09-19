// VerifyEmail.jsx
//
// Full-page gate shown instead of the site for any signed-in email/password
// user whose address isn't verified yet. App.jsx decides when to render this
// (see `needsVerification` there) - Google accounts and admin routes skip it
// entirely, since Google already verifies the address and the admin flow has
// its own separate access control.
import { useState } from "react";
import { getAuth, sendEmailVerification, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Seo from "./seo/Seo";
import { friendlyError } from "./utils/errors";
import "./Auth.css";

export default function VerifyEmail({ user }) {
  const [notice, setNotice] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const auth = getAuth();
  const nav = useNavigate();

  const resend = async () => {
    setErr("");
    setNotice("");
    setBusy(true);
    try {
      await sendEmailVerification(user);
      setNotice("Verification email sent. Check your inbox and spam folder.");
    } catch (error) {
      setErr(friendlyError(error, "We couldn't send the verification email just now. Please try again shortly."));
    } finally {
      setBusy(false);
    }
  };

  // Firebase doesn't push emailVerified changes to the client automatically -
  // it only refreshes on a new ID token, so "I've verified" has to force one.
  const iveVerified = async () => {
    setErr("");
    setNotice("");
    setChecking(true);
    try {
      await user.reload();
      if (user.emailVerified) {
        nav("/", { replace: true });
      } else {
        setErr("That email address isn't verified yet. Open the link in the email we sent, then try again.");
      }
    } catch (error) {
      setErr(friendlyError(error, "We couldn't check your verification status. Please try again."));
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    nav("/login", { replace: true });
  };

  return (
    <main className="auth-page">
      <Seo
        title="Verify Your Email | Margie's"
        description="Verify your email address to finish setting up your Margie's account."
        path="/verify-email"
        noindex
      />
      <div className="auth-form">
        <h1>Verify Your Email</h1>

        {err && <p className="auth-form__error" role="alert">{err}</p>}
        {notice && <p className="auth-form__notice" role="status">{notice}</p>}

        <p style={{ color: "#4b5563", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
          We sent a verification link to <strong>{user?.email}</strong>. Open it to
          activate your account - you'll need to do this before you can book a room
          or manage your stays.
        </p>

        <button type="button" onClick={iveVerified} disabled={checking}>
          {checking ? "Checking…" : "I've verified - continue"}
        </button>

        <p className="auth-form__forgot">
          <button type="button" className="forgot-btn" onClick={resend} disabled={busy}>
            {busy ? "Sending…" : "Resend verification email"}
          </button>
        </p>

        <p className="auth-form__switch">
          Wrong account? <button type="button" className="forgot-btn" onClick={handleLogout}>Log out</button>
        </p>
      </div>
    </main>
  );
}
