import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { auth, functions } from "./firebase";
import Seo from "./seo/Seo";
import { friendlyError } from "./utils/errors";
import { PAYSTACK_PUBLIC_KEY, SUPPORT_AMOUNT_NGN, IS_TEST_MODE } from "./config";
import "./Support.css";

const recordSupportPaymentFn = httpsCallable(functions, "recordSupportPayment");

// The "thank you" email is sent server-side by the notifyOnCoffee Cloud
// Function (functions/index.js) as soon as recordSupportPayment writes the
// verified payment - Paystack separately emails its own receipt.

export default function Support() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // Set the moment Paystack confirms payment, independently of whether our own
  // backend managed to record it. The guest has paid either way and should see
  // a thank you, not a red error box.
  const [paid, setPaid] = useState(null); // { reference, emailed, recorded }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u?.email) setEmail((prev) => prev || u.email);
    });
    return () => unsub();
  }, []);

  const pay = () => {
    setMsg({ type: "", text: "" });

    if (!email.trim()) {
      return setMsg({ type: "error", text: "Please enter an email address for your receipt." });
    }
    if (!window.PaystackPop || typeof window.PaystackPop.setup !== "function") {
      return setMsg({
        type: "error",
        text: "Our payment window couldn't start. Please refresh the page and try again.",
      });
    }

    setBusy(true);
    try {
      const paystack = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email,
        amount: SUPPORT_AMOUNT_NGN * 100, // kobo
        currency: "NGN",
        ref: "coffee_" + Date.now() + "_" + Math.floor(Math.random() * 100000),
        metadata: {
          custom_fields: [
            { display_name: "Purpose", variable_name: "purpose", value: "Buy the owner a coffee" },
            { display_name: "Note", variable_name: "note", value: note || "-" },
          ],
        },
        callback: function (res) {
          (async () => {
            const reference = res.reference;

            // 1. Show the thank you immediately. The money has moved.
            setPaid({ reference, recorded: false });
            setBusy(false);

            // 2. Record it on our side - this is also what triggers the
            //    server-side thank-you email (notifyOnCoffee). If this fails
            //    it is our problem, not the guest's - log it, mention it
            //    gently, never alarm them.
            try {
              await recordSupportPaymentFn({ reference, email, note });
              setPaid((p) => (p ? { ...p, recorded: true } : p));
            } catch (err) {
              if (import.meta.env.DEV) console.warn("[support] record failed", friendlyError(err), err);
              setPaid((p) => (p ? { ...p, recorded: false, recordError: true } : p));
            }
          })();
        },
        onClose: function () {
          setBusy(false);
          setMsg({ type: "info", text: "No problem - maybe next time!" });
        },
      });
      paystack.openIframe();
    } catch (err) {
      setBusy(false);
      setMsg({ type: "error", text: friendlyError(err) });
    }
  };

  // ---------- thank-you screen ----------
  if (paid) {
    return (
      <main className="page page--center">
        <Seo
          title="Thank You | Margie's"
          description="Thank you for supporting Margie's."
          path="/support"
          noindex
        />
        <section className="support">
          <div className="support__card support__card--thanks">
            <div className="support__emoji" aria-hidden="true">🎉</div>
            <h1>Thank you - we appreciate you!</h1>
            <p className="support__blurb">
              Your ₦{SUPPORT_AMOUNT_NGN.toLocaleString("en-NG")} came through and it means a lot.
              The owner will be enjoying that coffee shortly. ☕
            </p>

            <dl className="support__receipt">
              <div>
                <dt>Amount</dt>
                <dd>₦{SUPPORT_AMOUNT_NGN.toLocaleString("en-NG")}</dd>
              </div>
              <div>
                <dt>Reference</dt>
                <dd><code>{paid.reference}</code></dd>
              </div>
              {note && (
                <div>
                  <dt>Your note</dt>
                  <dd>{note}</dd>
                </div>
              )}
            </dl>

            <p className="support__secure">
              {paid.recorded
                ? `We're emailing a thank-you note to ${email} now, and Paystack will send its own receipt separately.`
                : `Paystack has emailed your payment receipt to ${email}.`}
            </p>

            {paid.recordError && (
              <p className="support__secure">
                Keep your reference handy just in case - we&apos;ll double-check this one on our side.
              </p>
            )}

            <Link className="support__btn support__btn--link" to="/">
              Back to Margie&apos;s
            </Link>
          </div>
        </section>
      </main>
    );
  }

  // ---------- payment form ----------
  return (
    <main className="page page--center">
      <Seo
        title="Buy the Owner a Coffee | Margie's"
        description="Enjoyed your stay at Margie's? Say thank you with a small ₦500 tip."
        path="/support"
      />

      <section className="support">
        <div className="support__card">
          <div className="support__emoji" aria-hidden="true">☕</div>
          <h1>Buy the owner a coffee</h1>
          <p className="support__blurb">
            If Margie&apos;s made your stay easier, you can say thank you with a small tip. It goes
            straight to the owner - no subscription, no account needed.
          </p>

          <p className="support__amount">₦{SUPPORT_AMOUNT_NGN.toLocaleString("en-NG")}</p>

          {IS_TEST_MODE && (
            <p className="support__testmode">
              Test mode is on - use a Paystack test card, no real money will move.
            </p>
          )}

          {msg.text && (
            <div className={`support__msg support__msg--${msg.type}`} role="status" aria-live="polite">
              {msg.text}
            </div>
          )}

          <div className="support__field">
            <label htmlFor="support-email">Email for your receipt</label>
            <input
              id="support-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="support__field">
            <label htmlFor="support-note">Leave a note (optional)</label>
            <input
              id="support-note"
              type="text"
              maxLength={120}
              placeholder="Say something nice…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button className="support__btn" onClick={pay} disabled={busy}>
            {busy ? "Opening payment…" : `Send ₦${SUPPORT_AMOUNT_NGN.toLocaleString("en-NG")} ☕`}
          </button>

          <p className="support__secure">Payments are handled securely by Paystack.</p>
          {user && <p className="support__secure">Signed in as {user.email}</p>}
        </div>
      </section>
    </main>
  );
}
