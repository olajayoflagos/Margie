const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

/**
 * Callable Cloud Function: checkAvailability
 * Checks for overlapping active bookings for a given room and date range.
 */
exports.checkAvailability = functions.https.onCall(async (data, context) => {
  const { roomId, start, end } = data;
  // Validate parameters
  if (!roomId || !start || !end) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing roomId, start, or end parameter.'
    );
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  // Query active bookings for this room
  const snap = await db.collection('bookings')
    .where('roomId', '==', roomId)
    .where('status', '==', 'active')
    .get();

  // Check for any overlap
  for (const doc of snap.docs) {
    const b = doc.data();
    const bStart = new Date(b.checkIn);
    const bEnd = new Date(b.checkOut);
    // Overlap occurs if requested start < existing end AND requested end > existing start
    if (startDate < bEnd && endDate > bStart) {
      return { available: false };
    }
  }

  return { available: true };
});

/**
 * Callable Cloud Function: fetchMyBookings
 * Returns the current user's bookings (requires Firebase Auth).
 */
exports.fetchMyBookings = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required to fetch bookings.'
    );
  }

  const uid = context.auth.uid;
  const snap = await db.collection('bookings')
    .where('userId', '==', uid)
    .orderBy('createdAt', 'desc')
    .get();

  const bookings = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return { bookings };
});
