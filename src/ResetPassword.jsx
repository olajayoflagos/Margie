import { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { Link } from "react-router-dom";
import Seo from "./seo/Seo";
import { friendlyError } from "./utils/errors";
import "./Auth.css";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const auth = getAuth();

  const submit = async (e) => {
    e.preventDefault();
    setNotice("");
    setErr("");
    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setNotice("If an account exists for that email, a reset link is on its way. Check your inbox and spam folder.");
    } catch (error) {
      setErr(friendlyError(error, "We couldn't send the reset email just now. Please try again shortly."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <Seo
        title="Reset Password | Margie's"
        description="Reset the password for your Margie's account."
        path="/reset-password"
        noindex
      />
      <form onSubmit={submit} className="auth-form">
        <h1>Reset Password</h1>

        {err && <p className="auth-form__error" role="alert">{err}</p>}
        {notice && <p className="auth-form__notice" role="status">{notice}</p>}

        <label htmlFor="reset-email">Email</label>
        <input
          id="reset-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={busy}>
          {busy ? "Sending…" : "Send Reset Link"}
        </button>

        <p className="auth-form__switch">
          Remembered it? <Link to="/login">Log in</Link>
        </p>
      </form>
    </main>
  );
}
