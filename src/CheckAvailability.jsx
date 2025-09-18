import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { differenceInDays } from "date-fns";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "./firebase";
import { checkRoomAvailability } from "./bookingService";
import "./CheckAvailability.css";

export default function CheckAvailability() {
  const navigate = useNavigate();

  // Form state
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);

  // UI state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // Load auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return () => unsub();
  }, []);

  // Load available rooms once
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "rooms"));
        setRooms(
          snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(r => r.available)
        );
      } catch (err) {
        console.error(err);
        setMsg({ type: "error", text: "Failed to load rooms." });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleBookAndPay = async () => {
    setMsg({ type: "", text: "" });

    // Validation
    if (!guestName || !guestEmail || partySize < 1) {
      return setMsg({ type: "error", text: "Enter name, email & party size." });
    }
    if (!user) {
      return navigate("/login");
    }
    if (!selectedRoom || !checkIn || !checkOut || checkIn >= checkOut) {
      return setMsg({ type: "error", text: "Select room & valid dates." });
    }

    setLoading(true);
    const nights = differenceInDays(checkOut, checkIn);
    try {
      // Check availability
      const ok = await checkRoomAvailability({
        roomId: selectedRoom.id,
        start: checkIn.toISOString().slice(0, 10),
        end: checkOut.toISOString().slice(0, 10),
      });
      if (!ok) {
        setMsg({ type: "error", text: "Room not available for those dates." });
        return;
      }

      // Compute amount
      const amountPaid = selectedRoom.price * nights;

      // Launch Paystack
      if (window.PaystackPop && typeof window.PaystackPop.setup === "function") {
        const paystack = window.PaystackPop.setup({
          key: 'pk_live_cb4309974c3aa9a757e93deee00f318d7b4ce241',
          email: guestEmail,
          amount: amountPaid * 100, // Paystack expects amount in kobo
          currency: "NGN",
          ref: "" + Math.floor(Math.random() * 1000000000 + 1),
          callback: function (res) {
            (async () => {
              try {
                await addDoc(collection(db, "bookings"), {
                  guestName,
                  guestEmail,
                  partySize,
                  roomId: selectedRoom.id,
                  roomName: selectedRoom.name,
                  checkIn: checkIn.toISOString().slice(0,10),
                  checkOut: checkOut.toISOString().slice(0,10),
                  nights,
                  amountPaid,
                  paymentRef: res.reference,
                  status: "active",
                  createdAt: serverTimestamp(),
                  userId: user.uid,
                });
                setMsg({ type: "success", text: "Booking confirmed!" });
              } catch (err) {
                console.error(err);
                setMsg({ type: "error", text: "Failed to save booking after payment." });
              }
            })();
          },
          onClose: function () {
            setMsg({ type: "error", text: "Payment cancelled." });
          },
        });
        paystack.openIframe();
      } else {
        setMsg({
          type: "error",
          text: "Could not initialize Paystack. Try again later.",
        });
      }
    } catch (e) {
      console.error(e);
      setMsg({
        type: "error",
        text: "Unexpected error. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="availability">
      <h2>Check & Book a Room</h2>
      {loading && <div className="spinner"></div>}
      {msg.text && (
        <div className={`alert alert-${msg.type}`}>{msg.text}</div>
      )}

      <div className="availability-form">
        <input
          type="text"
          placeholder="Full Name"
          value={guestName}
          onChange={e => setGuestName(e.target.value)}
          disabled={!user}
        />
        <input
          type="email"
          placeholder="Email Address"
          value={guestEmail}
          onChange={e => setGuestEmail(e.target.value)}
          disabled={!user}
        />
        <input
          type="number"
          placeholder="Number of Individuals"
          min="1"
          value={partySize}
          onChange={e => setPartySize(Math.max(1, +e.target.value))}
          disabled={!user}
        />
      </div>

      {!user && <p><a href="/login">Log in</a> to book.</p>}

      <select
        disabled={!user}
        onChange={e => setSelectedRoom(JSON.parse(e.target.value))}
        defaultValue=""
      >
        <option value="" disabled>
          Select Room
        </option>
        {rooms.map(r => (
          <option key={r.id} value={JSON.stringify(r)}>
            {r.name} – ₦{r.price}/night
          </option>
        ))}
      </select>

      <DatePicker
        selected={checkIn}
        onChange={date => setCheckIn(date)}
        placeholderText="Check-in Date"
        minDate={new Date()}
        disabled={!user}
      />
      <DatePicker
        selected={checkOut}
        onChange={date => setCheckOut(date)}
        placeholderText="Check-out Date"
        minDate={checkIn || new Date()}
        disabled={!user}
      />

      {selectedRoom && checkIn && checkOut && (
        <p className="total-cost">
          {selectedRoom.name}: ₦{selectedRoom.price}×
          {differenceInDays(checkOut, checkIn)} = ₦
          {selectedRoom.price * differenceInDays(checkOut, checkIn)}
        </p>
      )}

      <button
        onClick={handleBookAndPay}
        disabled={loading || !user}
      >
        {loading ? "Processing…" : "Book & Pay"}
      </button>
    </div>
  );
}