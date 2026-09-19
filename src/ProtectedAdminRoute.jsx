import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

// Kept in sync with AdminLogin.jsx, functions/index.js (ensureAdminClaim)
// and firestore.rules (isAdmin()) - admin@margies.com.ng is the only mailbox
// this app treats as the admin.
const ADMIN_EMAIL = "admin@margies.com.ng";

/**
 * Wraps /admin. Checks that someone is logged in, their ID token carries the
 * `admin` custom claim (self-granted via ensureAdminClaim on admin login),
 * AND their email is admin@margies.com.ng. This is a UX guard only - the
 * real enforcement is firestore.rules, which checks both
 * request.auth.token.admin and request.auth.token.email before allowing
 * reads/writes.
 */
export default function ProtectedAdminRoute({ children }) {
  const [status, setStatus] = useState("checking"); // checking | allowed | denied

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStatus("denied");
        return;
      }
      try {
        const token = await user.getIdTokenResult(true);
        const isAdmin =
          token.claims.admin === true &&
          (token.claims.email || "").toLowerCase() === ADMIN_EMAIL;
        setStatus(isAdmin ? "allowed" : "denied");
      } catch {
        setStatus("denied");
      }
    });
    return () => unsub();
  }, []);

  if (status === "checking") return <p className="page page--center">Checking access…</p>;
  if (status === "denied") return <Navigate to="/admin-login" replace />;
  return children;
}
