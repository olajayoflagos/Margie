/**
 * Turns any error (Firebase Auth, Firestore, Cloud Functions, network) into a
 * short, human sentence that is safe to show a guest.
 *
 * Rules of thumb used here:
 *  - Never leak "Firebase:", "auth/...", "FirebaseError", stack traces, or
 *    internal collection/function names into the UI.
 *  - Never tell an attacker which half of a login pair was wrong.
 *  - Always give the guest something they can actually do next.
 *
 * The raw error is still logged to the console for you, the developer.
 */

const AUTH_MESSAGES = {
  "auth/invalid-email": "That email address doesn't look right. Please check it and try again.",
  "auth/user-disabled": "This account has been disabled. Please contact us so we can help.",
  "auth/user-not-found": "We couldn't sign you in. Please check your email and password.",
  "auth/wrong-password": "We couldn't sign you in. Please check your email and password.",
  "auth/invalid-credential": "We couldn't sign you in. Please check your email and password.",
  "auth/invalid-login-credentials": "We couldn't sign you in. Please check your email and password.",
  "auth/email-already-in-use": "An account with this email already exists. Try logging in instead.",
  "auth/weak-password": "Please choose a stronger password - at least 6 characters.",
  "auth/missing-password": "Please enter your password.",
  "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
  "auth/network-request-failed": "We couldn't reach our servers. Please check your connection and try again.",
  "auth/requires-recent-login": "For your security, please log in again before making this change.",
  "auth/popup-closed-by-user": "The sign-in window was closed before you finished.",
  "auth/operation-not-allowed": "This sign-in method isn't available right now. Please contact us.",
};

const FUNCTION_MESSAGES = {
  unauthenticated: "Please log in to continue.",
  "permission-denied": "You don't have permission to do that.",
  "not-found": "We couldn't find that item. It may have been removed.",
  "invalid-argument": "Some details are missing or incorrect. Please review the form and try again.",
  "already-exists": "That has already been recorded.",
  "resource-exhausted": "Our booking service is busy right now. Please try again shortly.",
  "deadline-exceeded": "That took too long to respond. Please try again.",
  unavailable: "Our booking service is temporarily unavailable. Please try again in a moment.",
  internal: "Something went wrong on our side. Please try again, or contact us if it continues.",
  unknown: "Something went wrong. Please try again.",
};

/** Bare status words that some SDKs use as the whole message ("internal",
 *  "unavailable"). These must never be shown - they're codes, not sentences. */
const BARE_CODE_WORDS = new Set([
  ...Object.keys(FUNCTION_MESSAGES),
  "failed-precondition",
  "cancelled",
  "aborted",
  "out-of-range",
  "data-loss",
  "unimplemented",
  "error",
]);

/** Strip anything that looks like SDK noise out of a message. */
function looksInternal(text) {
  if (!text) return true;
  const trimmed = String(text).trim();

  // A single lowercase word or hyphenated code is a status code, not a message.
  if (BARE_CODE_WORDS.has(trimmed.toLowerCase())) return true;
  if (/^[a-z][a-z-]*$/.test(trimmed)) return true;

  return (
    /firebase/i.test(trimmed) ||
    /firestore/i.test(trimmed) ||
    /\bauth\/[a-z-]+/i.test(trimmed) ||
    /functions\//i.test(trimmed) ||
    /\(([a-z]+\/[a-z-]+)\)/i.test(trimmed) ||
    /\bINTERNAL\b|ERR_|undefined|\bnull\b|\bat \w+\./i.test(trimmed)
  );
}

/**
 * @param {unknown} error   the caught error
 * @param {string} fallback what to say when we can't classify it
 * @returns {string} a message safe to render in the UI
 */
export function friendlyError(error, fallback = "Something went wrong. Please try again.") {
  if (import.meta.env.DEV) console.error("[handled error]", error);

  if (!error) return fallback;
  if (typeof error === "string") return looksInternal(error) ? fallback : error;

  const code = error.code || "";

  if (AUTH_MESSAGES[code]) return AUTH_MESSAGES[code];
  if (FUNCTION_MESSAGES[code]) return FUNCTION_MESSAGES[code];

  // Callable functions throw as "functions/failed-precondition" etc.
  const bare = code.includes("/") ? code.split("/").pop() : code;

  // A known status code always wins over the raw message. Getting this order
  // wrong is how a bare "internal" ends up rendered in the UI.
  if (FUNCTION_MESSAGES[bare]) return FUNCTION_MESSAGES[bare];

  // Messages we set ourselves with HttpsError are written for guests, so they
  // can pass through - but only if they read like a sentence.
  if (error.message && !looksInternal(error.message)) return error.message;

  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "You appear to be offline. Please check your connection and try again.";
  }

  return fallback;
}

export default friendlyError;
