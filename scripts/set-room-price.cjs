/**
 * Temporarily change a room's price so you can test a real end-to-end booking
 * for a small amount (e.g. ₦500) instead of ₦59,500.
 *
 * This is safe to use because the amount actually charged is recomputed
 * server-side in functions/index.js from the Firestore `rooms` document - so
 * changing the price here changes what Paystack collects AND what the
 * verification step expects. (Editing src/data/rooms.js alone would NOT work:
 * the server would still expect the old price and reject the payment.)
 *
 * Setup (once):
 *   1. Firebase console -> Project settings -> Service accounts -> Generate key
 *   2. export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json
 *
 * Usage:
 *   node scripts/set-room-price.cjs list
 *   node scripts/set-room-price.cjs set onyx 500      # drop to ₦500 for testing
 *   node scripts/set-room-price.cjs restore onyx      # put the real price back
 *
 * `set` saves the existing price to `priceBeforeTest` first, so `restore`
 * always puts the correct amount back. Don't forget to restore it.
 */
const admin = require("firebase-admin");

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error("Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path first.");
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();

const [command, roomId, rawPrice] = process.argv.slice(2);

async function list() {
  const snap = await db.collection("rooms").get();
  if (snap.empty) return console.log("No rooms found.");
  snap.docs.forEach((d) => {
    const r = d.data();
    const testing = r.priceBeforeTest ? `  (TEST MODE - real price ₦${r.priceBeforeTest})` : "";
    console.log(`${d.id.padEnd(14)} ${String(r.name || "").padEnd(18)} ₦${r.price}${testing}`);
  });
}

async function set() {
  const price = Number(rawPrice);
  if (!roomId || !Number.isFinite(price) || price < 100) {
    console.error("Usage: node scripts/set-room-price.cjs set <roomId> <price>  (min 100)");
    process.exit(1);
  }
  const ref = db.collection("rooms").doc(roomId);
  const snap = await ref.get();
  if (!snap.exists) {
    console.error(`Room "${roomId}" not found. Run "list" to see room IDs.`);
    process.exit(1);
  }
  const current = snap.data();
  const update = { price };
  if (current.priceBeforeTest === undefined) update.priceBeforeTest = current.price;
  await ref.update(update);
  console.log(`✔ ${roomId} is now ₦${price} (real price kept as ₦${update.priceBeforeTest ?? current.priceBeforeTest}).`);
  console.log("  Remember: node scripts/set-room-price.cjs restore " + roomId);
}

async function restore() {
  const ref = db.collection("rooms").doc(roomId);
  const snap = await ref.get();
  if (!snap.exists) {
    console.error(`Room "${roomId}" not found.`);
    process.exit(1);
  }
  const { priceBeforeTest } = snap.data();
  if (priceBeforeTest === undefined) {
    console.log(`${roomId} is not in test mode - nothing to restore.`);
    return;
  }
  await ref.update({
    price: priceBeforeTest,
    priceBeforeTest: admin.firestore.FieldValue.delete(),
  });
  console.log(`✔ ${roomId} restored to ₦${priceBeforeTest}.`);
}

(async () => {
  try {
    if (command === "list") await list();
    else if (command === "set") await set();
    else if (command === "restore") await restore();
    else console.log("Commands: list | set <roomId> <price> | restore <roomId>");
  } catch (err) {
    console.error("Failed:", err.message);
    process.exit(1);
  }
  process.exit(0);
})();
