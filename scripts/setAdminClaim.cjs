/**
 * Manual fallback for granting the admin custom claim. In normal use you
 * don't need this at all: logging in at /admin-login with
 * admin@margies.com.ng self-grants the claim automatically (see
 * ensureAdminClaim in functions/index.js). Keep this around only for
 * troubleshooting from your own machine - e.g. inspecting or revoking a
 * claim directly - then ignore/delete it again.
 *
 * This is NOT deployed - it runs once from your machine with a service
 * account key.
 *
 * Setup:
 *   1. Firebase Console -> Project Settings -> Service Accounts ->
 *      "Generate new private key". Save the JSON somewhere OUTSIDE the repo.
 *   2. npm install firebase-admin --no-save   (if not already installed)
 *   3. Run with either an email or a UID:
 *        node scripts/setAdminClaim.cjs /path/to/serviceAccountKey.json admin@margies.com.ng
 *        node scripts/setAdminClaim.cjs /path/to/serviceAccountKey.json <uid>
 */
const admin = require("firebase-admin");

const [, , keyPath, identifier] = process.argv;
if (!keyPath || !identifier) {
  console.error("Usage: node setAdminClaim.cjs <serviceAccountKey.json> <email-or-uid>");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(require("path").resolve(keyPath))),
});

async function main() {
  const isEmail = identifier.includes("@");
  const userRecord = isEmail
    ? await admin.auth().getUserByEmail(identifier)
    : await admin.auth().getUser(identifier);

  await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
  console.log(
    `Granted admin claim to ${userRecord.email || userRecord.uid} (uid ${userRecord.uid}). ` +
      `They must log out and back in for it to take effect.`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
