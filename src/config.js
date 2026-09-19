/**
 * Client-side configuration.
 *
 * The Paystack PUBLIC key is safe in client code (the secret key is not, and
 * lives only in Firebase Functions config). Keeping it here means you can
 * switch between live and test mode by setting one environment variable
 * instead of editing components:
 *
 *   .env.local      VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxx   (for testing)
 *   Vercel env var  VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxx   (production)
 *
 * With a pk_test_ key you can pay with Paystack's test cards and no real money
 * moves - that is the safest way to test the whole booking flow end to end.
 */
export const PAYSTACK_PUBLIC_KEY =
  import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ||
  "pk_live_cb4309974c3aa9a757e93deee00f318d7b4ce241";

/** "Buy the owner a coffee" tip amount, in naira. */
export const SUPPORT_AMOUNT_NGN = Number(import.meta.env.VITE_SUPPORT_AMOUNT_NGN || 500);

export const IS_TEST_MODE = PAYSTACK_PUBLIC_KEY.startsWith("pk_test_");

/**
 * NOTE: Booking confirmations, coffee thank-yous, and welcome emails are now
 * sent server-side by Cloud Functions (see functions/index.js -
 * notifyOnNewBooking, notifyOnCoffee, sendWelcomeEmail) using Margie's own
 * SMTP mailbox, configured via functions/.env. The client no longer sends
 * these itself (EmailJS has been removed) - this is more reliable, since it
 * doesn't depend on the guest's browser staying open, and keeps the mailbox
 * password out of client-side code entirely.
 */
export const OWNER_EMAIL = import.meta.env.VITE_OWNER_EMAIL || "info@margies.com.ng";
