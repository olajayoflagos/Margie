const functions = require("firebase-functions");
const admin = require("firebase-admin");
const emailjs = require("@emailjs/nodejs");
admin.initializeApp();
const db = admin.firestore();

// -----------------------------------------------------------------------
// Transactional email (booking confirmations, welcome messages) - sent from
// the server with the Admin SDK / Node runtime, through EmailJS using the
// templates already built in your EmailJS dashboard. This replaces sending
// these emails from the browser: it still works if the guest closes the tab
// right after paying, and it can't be blocked by an ad-blocker.
//
// Firebase Auth's own emails (verification links, password resets) are a
// completely separate system, sent by Firebase itself - none of this file
// touches those.
//
// Configure in functions/.env (see functions/.env.example):
//   EMAILJS_SERVICE_ID=service_xxxxxxx
//   EMAILJS_PUBLIC_KEY=your_public_key
//   EMAILJS_PRIVATE_KEY=your_private_key           (EmailJS dashboard -> Account -> API Keys.
//                                                    Required for sending from a server instead
//                                                    of a browser - without it EmailJS rejects
//                                                    the request since there's no origin to check.)
//   EMAILJS_WELCOME_TEMPLATE_ID=template_xxxxxxx
//   EMAILJS_BOOKING_TEMPLATE_ID=template_xxxxxxx
//   EMAILJS_COFFEE_TEMPLATE_ID=template_xxxxxxx    (optional - only the welcome and booking
//                                                    templates are wired up so far; add this
//                                                    once a "thank you for the coffee" template
//                                                    exists in EmailJS, no code change needed)
//
// Each call below passes a flat set of named params (to_email, to_name,
// room_name, etc.) - map those exact names to placeholders in the EmailJS
// template editor (Settings -> Content, using {{param_name}}). The "To
// Email" field of each EmailJS template should be set to {{to_email}}.
let emailjsReady = false;
function ensureEmailJsInitialized() {
  if (emailjsReady) return true;
  const { EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY } = process.env;
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) {
    functions.logger.warn(
      "EmailJS is not configured - set EMAILJS_SERVICE_ID, EMAILJS_PUBLIC_KEY and EMAILJS_PRIVATE_KEY in functions/.env."
    );
    return false;
  }
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY, privateKey: EMAILJS_PRIVATE_KEY });
  emailjsReady = true;
  return true;
}

/**
 * Sends one email via an EmailJS template. Deliberately swallows its own
 * errors and logs instead of throwing: a failed notification email must
 * never turn a successful payment, booking, or signup into an error for the
 * guest. Returns a boolean so callers can tell if it went out.
 */
async function sendTemplateEmail(templateId, templateParams) {
  if (!templateId) return false; // that template isn't configured yet - skip quietly
  if (!ensureEmailJsInitialized()) return false;
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  if (!serviceId) {
    functions.logger.warn("EMAILJS_SERVICE_ID is not set - skipping email.");
    return false;
  }
  try {
    await emailjs.send(serviceId, templateId, templateParams);
    return true;
  } catch (err) {
    functions.logger.error("EmailJS send failed", {
      templateId,
      message: err?.text || err?.message || String(err),
    });
    return false;
  }
}

const naira = (n) => `₦${Number(n || 0).toLocaleString("en-NG")}`;

// Passed as template params to every EmailJS template below - reference
// {{instagram_handle}} / {{instagram_url}} in the template design if you
// want the link in the footer.
const INSTAGRAM_HANDLE = "@margiesplace_";
const INSTAGRAM_URL = "https://instagram.com/margiesplace_";

// Paystack secret key - set with:
//   firebase functions:config:set paystack.secret_key="sk_live_xxxxx"
// NEVER hardcode the secret key in source. The public key (pk_live_...) is
// fine to keep in client code; the secret key (sk_live_...) is not.
/**
 * Paystack secret key.
 *
 * Preferred (and the only future-proof option): an environment variable.
 * Put it in functions/.env - see functions/.env.example:
 *
 *   PAYSTACK_SECRET_KEY=sk_live_xxxxxxxx
 *
 * functions.config() is kept only as a fallback for older deployments. It is
 * deprecated in firebase-functions v6 and THROWS in newer runtimes, which is
 * why the call is wrapped - an uncaught throw here at module load turns every
 * callable in this file into a bare "internal" error in the browser with no
 * useful message.
 *
 * NEVER hardcode the secret key. The public key (pk_...) in client code is fine.
 */
function readPaystackSecret() {
  if (process.env.PAYSTACK_SECRET_KEY) return process.env.PAYSTACK_SECRET_KEY;
  try {
    return functions.config().paystack?.secret_key;
  } catch (err) {
    functions.logger.warn(
      "functions.config() is unavailable - set PAYSTACK_SECRET_KEY in functions/.env instead.",
      { message: err.message }
    );
    return undefined;
  }
}

const PAYSTACK_SECRET_KEY = readPaystackSecret();

/**
 * Recompute the price server-side from the room's stored price, rather than
 * trusting whatever amount the client sends. This is what stops a guest from
 * editing the request in devtools to pay less (or "pay" nothing).
 */
async function computeExpectedAmount(roomId, checkIn, checkOut) {
  const roomSnap = await db.collection("rooms").doc(roomId).get();
  if (!roomSnap.exists) {
    throw new functions.https.HttpsError("not-found", "Room not found.");
  }
  const room = roomSnap.data();
  const nights = Math.round(
    (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
  );
  if (nights <= 0) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid date range.");
  }
  return { amount: room.price * nights, nights, room };
}

async function isRoomAvailable(roomId, checkIn, checkOut) {
  const snap = await db
    .collection("bookings")
    .where("roomId", "==", roomId)
    .where("status", "in", ["confirmed", "pending_payment"])
    .get();

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  for (const doc of snap.docs) {
    const b = doc.data();
    const bStart = new Date(b.checkIn);
    const bEnd = new Date(b.checkOut);
    if (start < bEnd && end > bStart) return false;
  }
  return true;
}

/**
 * Callable: checkAvailability
 * Public-facing availability check (used before showing the Paystack modal).
 */
exports.checkAvailability = functions.https.onCall(async (data) => {
  const { roomId, checkIn, checkOut } = data;
  if (!roomId || !checkIn || !checkOut) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing roomId, checkIn, or checkOut."
    );
  }
  const available = await isRoomAvailable(roomId, checkIn, checkOut);
  return { available };
});

/**
 * Callable: verifyPaystackPayment
 * The ONLY way a booking is ever marked "confirmed". The client sends the
 * Paystack reference plus booking details; this function verifies the
 * transaction directly with Paystack's API (server-to-server, using the
 * secret key), re-checks availability, recomputes the price itself, and
 * only then writes the confirmed booking with the Admin SDK. The client can
 * no longer forge a "confirmed, paid" booking because it never gets write
 * access to that status (see firestore.rules).
 */
exports.verifyPaystackPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Please log in first.");
  }
  const { reference, roomId, checkIn, checkOut, guestName, guestEmail, partySize } = data;
  if (!reference || !roomId || !checkIn || !checkOut) {
    throw new functions.https.HttpsError("invalid-argument", "Missing booking details.");
  }
  if (!PAYSTACK_SECRET_KEY) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Payment verification is not configured on the server."
    );
  }

  const { amount: expectedAmount, nights, room } = await computeExpectedAmount(
    roomId,
    checkIn,
    checkOut
  );

  const available = await isRoomAvailable(roomId, checkIn, checkOut);
  if (!available) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "This room was just booked for those dates. You have not been charged twice - please contact us with your payment reference if you were debited."
    );
  }

  // Verify the transaction with Paystack directly (server-to-server).
  const verifyRes = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
  );
  const verifyJson = await verifyRes.json();

  if (!verifyJson.status || verifyJson.data?.status !== "success") {
    throw new functions.https.HttpsError("failed-precondition", "Payment could not be verified.");
  }

  const paidKobo = verifyJson.data.amount; // Paystack amounts are in kobo
  if (paidKobo < expectedAmount * 100) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Amount paid does not match the price of this booking."
    );
  }

  // Prevent replaying the same Paystack reference against a second booking.
  const existing = await db
    .collection("bookings")
    .where("paymentRef", "==", reference)
    .limit(1)
    .get();
  if (!existing.empty) {
    return { bookingId: existing.docs[0].id, status: "confirmed" };
  }

  const bookingRef = await db.collection("bookings").add({
    userId: context.auth.uid,
    guestName: guestName || context.auth.token.name || "",
    guestEmail: guestEmail || context.auth.token.email || "",
    partySize: partySize || 1,
    roomId,
    roomName: room.name,
    checkIn,
    checkOut,
    nights,
    amountPaid: expectedAmount,
    paymentRef: reference,
    status: "confirmed",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await db.collection("rooms").doc(roomId).collection("availability").add({
    bookingId: bookingRef.id,
    startDate: admin.firestore.Timestamp.fromDate(new Date(checkIn)),
    endDate: admin.firestore.Timestamp.fromDate(new Date(checkOut)),
    status: "booked",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { bookingId: bookingRef.id, status: "confirmed" };
});

/**
 * Callable: recordSupportPayment  ("Buy the owner a coffee")
 *
 * Small fixed-amount tip. Same trust model as bookings: the client sends only
 * the Paystack reference, and this function verifies the transaction with
 * Paystack server-to-server before writing anything. No login required, so a
 * guest can tip after checkout without creating an account.
 */
const SUPPORT_AMOUNT_NGN = 500;

exports.recordSupportPayment = functions.https.onCall(async (data, context) => {
  const { reference, email, note } = data || {};
  if (!reference) {
    throw new functions.https.HttpsError("invalid-argument", "Missing payment reference.");
  }
  if (!PAYSTACK_SECRET_KEY) {
    functions.logger.error("recordSupportPayment: Paystack secret key is not configured.");
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Payments are not fully configured on our side yet - your payment is safe, keep your reference."
    );
  }

  try {
    // Node 18+ has global fetch. On the Node 16 runtime it does not exist, and
    // the resulting TypeError surfaces to the browser as a bare "internal".
    if (typeof fetch !== "function") {
      functions.logger.error(
        "recordSupportPayment: global fetch missing - set the functions runtime to nodejs18 or later."
      );
      throw new functions.https.HttpsError(
        "failed-precondition",
        "We couldn't reach our payment provider - your payment is safe, keep your reference."
      );
    }

    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
    );
    const verifyJson = await verifyRes.json();

    if (!verifyJson.status || verifyJson.data?.status !== "success") {
      functions.logger.warn("recordSupportPayment: verification failed", {
        reference,
        paystackMessage: verifyJson.message,
      });
      throw new functions.https.HttpsError("failed-precondition", "That payment could not be verified.");
    }
    if (verifyJson.data.amount < SUPPORT_AMOUNT_NGN * 100) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The amount received was lower than expected."
      );
    }

    // Don't record the same reference twice.
    const existing = await db
      .collection("support_payments")
      .where("paymentRef", "==", reference)
      .limit(1)
      .get();
    if (!existing.empty) {
      return { id: existing.docs[0].id, status: "recorded" };
    }

    const ref = await db.collection("support_payments").add({
      paymentRef: reference,
      amount: Math.round(verifyJson.data.amount / 100),
      currency: verifyJson.data.currency || "NGN",
      email: email || verifyJson.data.customer?.email || "",
      note: (note || "").slice(0, 200),
      userId: context.auth?.uid || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info("Coffee received", { id: ref.id, reference });
    return { id: ref.id, status: "recorded" };
  } catch (err) {
    // Re-throw the errors we raised on purpose; convert anything unexpected
    // into a message a guest can read, and log the real cause for us.
    if (err instanceof functions.https.HttpsError) throw err;
    functions.logger.error("recordSupportPayment failed unexpectedly", {
      reference,
      message: err.message,
      stack: err.stack,
    });
    throw new functions.https.HttpsError(
      "internal",
      "Your payment went through, but we couldn't record it just now. Please keep your reference."
    );
  }
});

/**
 * Callable: fetchMyBookings
 */
exports.fetchMyBookings = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
  }
  const snap = await db
    .collection("bookings")
    .where("userId", "==", context.auth.uid)
    .orderBy("createdAt", "desc")
    .get();
  return { bookings: snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) };
});

/**
 * Callable: cancelBooking
 */
exports.cancelBooking = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
  }
  const { bookingId } = data;
  if (!bookingId) {
    throw new functions.https.HttpsError("invalid-argument", "Missing booking ID.");
  }

  const bookingRef = db.collection("bookings").doc(bookingId);
  const bookingSnap = await bookingRef.get();
  if (!bookingSnap.exists) {
    throw new functions.https.HttpsError("not-found", "Booking not found.");
  }
  const bookingData = bookingSnap.data();
  if (bookingData.userId !== context.auth.uid && !context.auth.token.admin) {
    throw new functions.https.HttpsError("permission-denied", "Not your booking.");
  }
  if (bookingData.status === "cancelled") {
    return { status: "already_cancelled" };
  }

  await bookingRef.update({
    status: "cancelled",
    cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
    cancelledBy: context.auth.uid,
  });

  const availSnap = await db
    .collection("rooms")
    .doc(bookingData.roomId)
    .collection("availability")
    .where("bookingId", "==", bookingId)
    .get();
  await Promise.all(availSnap.docs.map((d) => d.ref.update({ status: "cancelled" })));

  return { status: "success" };
});

/**
 * Firestore trigger: fires whenever a new booking document is written -
 * in practice, right after verifyPaystackPayment confirms payment and
 * creates it. Sends the guest their confirmation email from Margie's own
 * mailbox (Paystack separately emails its own payment receipt), and BCCs
 * the owner so a new booking is never missed.
 */
exports.notifyOnNewBooking = functions.firestore
  .document("bookings/{bookingId}")
  .onCreate(async (snap) => {
    const booking = snap.data();
    functions.logger.log("New booking created", {
      bookingId: snap.id,
      roomId: booking.roomId,
      status: booking.status,
    });

    if (booking.status !== "confirmed" || !booking.guestEmail) return;

    await sendTemplateEmail(process.env.EMAILJS_BOOKING_TEMPLATE_ID, {
      to_email: booking.guestEmail,
      to_name: booking.guestName || "there",
      room_name: booking.roomName,
      check_in: booking.checkIn,
      check_out: booking.checkOut,
      nights: booking.nights,
      guests: booking.partySize,
      amount_paid: naira(booking.amountPaid),
      payment_ref: booking.paymentRef,
      owner_email: process.env.OWNER_EMAIL || "",
      instagram_handle: INSTAGRAM_HANDLE,
      instagram_url: INSTAGRAM_URL,
    });
  });

/**
 * Firestore trigger: fires whenever a "buy the owner a coffee" tip is
 * recorded (see recordSupportPayment above, which only writes after
 * verifying the payment with Paystack). Sends the tipper a thank-you note -
 * once EMAILJS_COFFEE_TEMPLATE_ID is set (see the comment near the top of
 * this file). Until then this is a harmless no-op.
 */
exports.notifyOnCoffee = functions.firestore
  .document("support_payments/{paymentId}")
  .onCreate(async (snap) => {
    const payment = snap.data();
    if (!payment.email) return;

    await sendTemplateEmail(process.env.EMAILJS_COFFEE_TEMPLATE_ID, {
      to_email: payment.email,
      amount: naira(payment.amount),
      payment_ref: payment.paymentRef,
      note: payment.note || "",
      owner_email: process.env.OWNER_EMAIL || "",
      instagram_handle: INSTAGRAM_HANDLE,
      instagram_url: INSTAGRAM_URL,
    });
  });

/**
 * Auth trigger: fires whenever a new Firebase Auth user is created (i.e.
 * right after Signup.jsx calls createUserWithEmailAndPassword, or a Google
 * sign-up). Sends a welcome email independently of the client - it still
 * goes out even if the guest closes the tab immediately after signing up.
 */
exports.sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
  if (!user.email) return;
  const name = user.displayName || user.email.split("@")[0];

  await sendTemplateEmail(process.env.EMAILJS_WELCOME_TEMPLATE_ID, {
    to_email: user.email,
    to_name: name,
    instagram_handle: INSTAGRAM_HANDLE,
    instagram_url: INSTAGRAM_URL,
  });
});

/**
 * Callable: ensureAdminClaim
 *
 * Lets the Firebase Auth account signed in as admin@margies.com.ng
 * self-grant the `admin` custom claim the first time it calls this after
 * logging in - instead of having to run scripts/setAdminClaim.cjs by hand
 * from a local machine every time.
 *
 * This checks the *email* on the verified ID token, not a hardcoded UID.
 * That's deliberate: admin@margies.com.ng is the only mailbox that should
 * ever be treated as the admin, full stop - so whichever Firebase Auth
 * account is currently signed in with that exact address gets the claim,
 * regardless of its UID. That also means this self-heals: if the admin
 * account was ever re-created, had its password reset, or a previous
 * ADMIN_UID-based deploy left it without the claim, logging in again here
 * grants it immediately and overrides any old blockage - there's nothing to
 * reconfigure by hand.
 *
 * This is safe because context.auth.token.email comes from a verified ID
 * token that only the real mailbox owner (their email + password, or a
 * Google sign-in to that address) can produce - it cannot be spoofed from
 * the browser console. Every other account gets `granted: false` and
 * nothing changes for them.
 */
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@margies.com.ng").toLowerCase();

exports.ensureAdminClaim = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Please log in first.");
  }
  const email = (context.auth.token.email || "").toLowerCase();
  if (email !== ADMIN_EMAIL) {
    return { granted: false };
  }
  if (context.auth.token.admin === true) {
    return { granted: true, alreadyHad: true };
  }
  await admin.auth().setCustomUserClaims(context.auth.uid, { admin: true });
  functions.logger.log("Granted admin claim via ensureAdminClaim", {
    uid: context.auth.uid,
    email,
  });
  return { granted: true, alreadyHad: false };
});
