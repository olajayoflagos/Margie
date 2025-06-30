import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import emailjs from "emailjs-com";
import { db } from "./firebase";

const auth = getAuth();


export async function createBookingRequest(details) {
  const docRef = await addDoc(collection(db, "bookings"), {
    ...details,
    createdAt: serverTimestamp(),
    userId: auth.currentUser.uid,
    status: "active"
  });
  // 2) send EmailJS order confirmation
  await emailjs.send(
    "service_3osbiq5",
    "template_6aqw75p",
    {
      booking_id: docRef.id,
      email: details.email,
      checkIn: details.dates[0].toISOString().slice(0,10),
      checkOut: details.dates[1].toISOString().slice(0,10),
      name: details.name,
      roomName: details.roomId,
      amountPaid: details.amountPaid
    }
  );
  return docRef.id;
}

export async function checkRoomAvailability({ roomId, start, end }) {
  const snap = await getDocs(
    query(
      collection(db, "bookings"),
      where("roomId", "==", roomId),
      where("status", "==", "active")
    )
  );
  const s = new Date(start), e = new Date(end);
  for (let d of snap.docs) {
    const b = d.data();
    const bs = new Date(b.checkIn), be = new Date(b.checkOut);
    if (s < be && e > bs) return false;
  }
  return true;
}


/**
 * Step 3: Fetch current user’s bookings (admin only sees all)
 */
export async function fetchUserBookings() {
  if (!auth.currentUser) throw new Error("Auth required");
  // Query the "bookings" collection where userId equals the current user
  const q = query(
    collection(db, "bookings"),
    where("userId", "==", auth.currentUser.uid)
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Step 4: Cancel via Cloud Function
 */
export async function cancelBooking(bookingId) {
  if (!auth.currentUser) throw new Error("Auth required");
  const ref = doc(db, "bookings", bookingId);
  await updateDoc(ref, { status: "cancelled" });
  return { success: true };
}