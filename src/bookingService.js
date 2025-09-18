import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import emailjs from "emailjs-com";

// Helper: expand a date range into yyyy-mm-dd date strings (inclusive start, exclusive end)
function expandRangeToDates(startStr, endStr) {
  const out = [];
  let cur = new Date(startStr);
  const end = new Date(endStr);
  while (cur < end) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

export async function createBookingRequest(details) {
  if (!auth.currentUser) throw new Error("Auth required");
  const docRef = await addDoc(collection(db, "bookings"), {
    ...details,
    createdAt: serverTimestamp(),
    userId: auth.currentUser.uid,
    status: "active",
  });

  // send EmailJS confirmation (keeps single source of truth for emails)
  try {
    await emailjs.send(
      "service_3osbiq5",
      "template_6aqw75p",
      {
        booking_id: docRef.id,
        email: details.email,
        checkIn: details.dates[0].toISOString().slice(0, 10),
        checkOut: details.dates[1].toISOString().slice(0, 10),
        name: details.name,
        roomName: details.roomId,
        amountPaid: details.amountPaid,
      }
    );
  } catch (err) {
    // Don't block booking on email failure — log and continue
    console.warn("EmailJS send failed:", err);
  }

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
    // overlap check: if requested start < booking end && requested end > booking start
    if (s < be && e > bs) return false;
  }
  return true;
}

// Return array of date strings that are already booked for a room (yyyy-mm-dd)
export async function getUnavailableDates(roomId) {
  const snap = await getDocs(
    query(
      collection(db, "bookings"),
      where("roomId", "==", roomId),
      where("status", "==", "active")
    )
  );
  const out = [];
  for (let d of snap.docs) {
    const b = d.data();
    if (b.checkIn && b.checkOut) {
      out.push(...expandRangeToDates(b.checkIn, b.checkOut));
    }
  }
  // dedupe
  return Array.from(new Set(out)).map(s => new Date(s));
}

export async function fetchUserBookings() {
  if (!auth.currentUser) throw new Error("Auth required");
  const q = query(
    collection(db, "bookings"),
    where("userId", "==", auth.currentUser.uid)
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function cancelBooking(bookingId) {
  if (!auth.currentUser) throw new Error("Auth required");
  const ref = doc(db, "bookings", bookingId);
  await updateDoc(ref, { status: "cancelled" });
  return { success: true };
}