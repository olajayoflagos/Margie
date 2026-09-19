import { httpsCallable } from "firebase/functions";
import { auth, functions } from "./firebase";

// Booking creation now happens exclusively via the verifyPaystackPayment
// Cloud Function (called from CheckAvailability.jsx after Paystack confirms
// payment) - the client is never trusted to write a "confirmed" booking
// directly. This file only wraps the read/cancel callables used elsewhere.

const fetchMyBookingsFn = httpsCallable(functions, "fetchMyBookings");
const cancelBookingFn = httpsCallable(functions, "cancelBooking");

export async function fetchUserBookings() {
  if (!auth.currentUser) throw new Error("Auth required");
  const { data } = await fetchMyBookingsFn();
  return data.bookings;
}

export async function cancelBooking(bookingId) {
  if (!auth.currentUser) throw new Error("Auth required");
  const { data } = await cancelBookingFn({ bookingId });
  return data;
}
