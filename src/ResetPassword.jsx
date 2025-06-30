import { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg]     = useState("");
  const auth = getAuth();

  const submit = async e => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setMsg("Check your inbox for a reset link.");
    } catch {
      setMsg("Could not send reset email.");
    }
  };

  return (
    <form onSubmit={submit} className="auth-form">
      <h2>Reset Password</h2>
      {msg && <p className="error">{msg}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <button type="submit">Send Reset Link</button>
    </form>
  );
}
