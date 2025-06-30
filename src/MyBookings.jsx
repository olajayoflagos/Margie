// MyBookings.jsx
import { useEffect, useState } from "react";
import { fetchUserBookings, cancelBooking } from "./bookingService";
import "./MyBookings.css";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserBookings()
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading…</p>;
  if (!bookings.length) return <p>No bookings yet.</p>;

  return (
    <div className="my-bookings">
      <h2>My Bookings</h2>
      <ul>
        {bookings.map(b => (
          <li key={b.id}>
            <strong>{b.roomName}</strong><br/>
            {b.dates[0]} → {b.dates[b.dates.length-1]}<br/>
            Nights: {b.nights} • ₦{b.amountPaid}<br/>
            Status: {b.status}
            {b.status !== "cancelled" && (
<button onClick={async () => {
  await cancelBooking(b.id);
  setBookings(bookings.map(x => 
    x.id === b.id ? { ...x, status: "cancelled" } : x
  ));
}}>
  Cancel
</button>

            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
