// Signup.jsx
import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification  } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import emailjs from "emailjs-com";
import "./Auth.css"; 

export default function Signup() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [agreed, setAgreed] = useState(false);
  const auth = getAuth();
  const nav = useNavigate();

  const submit = async e => {
    e.preventDefault();
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, pw);
      await sendEmailVerification(userCred.user);
      await emailjs.send(
        "service_3osbiq5",
        "template_gtcxcv7",
        { name: email, email: email },
        "5Pr-FJ_TWj0vvjJmP"
      );
      nav("/");
    } catch (error) {
      console.error("Signup error:", error);
      setErr(error.message || "Signup failed");
    }
  };

  return (
    <form onSubmit={submit} className="auth-form">
      <h2>Sign Up</h2>
      {err && <p className="error">{err}</p>}
      <input type="email" placeholder="Email" value={email}
             onChange={e=>setEmail(e.target.value)} required/>
      <input type="password" placeholder="Password" value={pw}
             onChange={e=>setPw(e.target.value)} required/>
      <label className="terms">
        <input
          type="checkbox"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
          required
        />
        I agree to the <a href="/Terms_Conditions_Margies.pdf" download>Terms & Conditions</a>
      </label>
      <button type="submit" disabled={!agreed}>
  Sign Up
</button>
    </form>
  );
}
