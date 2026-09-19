import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { differenceInDays } from "date-fns";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { db, auth, functions } from "./firebase";
import { friendlyError } from "./utils/errors";
import { formatDate, formatNaira, CHECK_IN_HOUR, CHECK_OUT_HOUR } from "./utils/bookingTime";
import { PAYSTACK_PUBLIC_KEY } from "./config";
import "./CheckAvailability.css";

const checkAvailabilityFn = httpsCallable(functions, "checkAvailability");
const verifyPaystackPaymentFn = httpsCallable(functions, "verifyPaystackPayment");

const MAX_GUESTS = 10;
const naira = formatNaira;
const hour12 = (h) => (h === 12 ? "12:00 noon" : h > 12 ? `${h - 12}:00 PM` : `${h}:00 AM`);

// Margie's own booking confirmation email is sent server-side by the
// notifyOnNewBooking Cloud Function (functions/index.js) the moment
// verifyPaystackPayment writes the confirmed booking - it doesn't depend on
// this tab staying open, so there's nothing to trigger from here.

export default function CheckAvailability() {
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedRoomId = location.state?.preselectedRoomId;

  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // Set as soon as Paystack confirms payment, so the guest always gets a
  // confirmation screen even if our own follow-up steps stumble.
  const [confirmed, setConfirmed] = useState(null);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || null;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u?.email) setGuestEmail((prev) => prev || u.email);
      if (u?.displayName) setGuestName((prev) => prev || u.displayName);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "rooms"));
        const loaded = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((r) => r.available);
        setRooms(loaded);
        if (preselectedRoomId && loaded.some((r) => r.id === preselectedRoomId)) {
          setSelectedRoomId(preselectedRoomId);
        }
      } catch (err) {
        setMsg({
          type: "error",
          text: friendlyError(err, "We couldn't load our rooms just now. Please refresh and try again."),
        });
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedRoomId]);

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const total = selectedRoom && nights > 0 ? selectedRoom.price * nights : 0;

  const handleBookAndPay = async () => {
    setMsg({ type: "", text: "" });

    if (!user) return navigate("/login", { state: { from: "/check" } });

    // Browsing rooms and availability is open to anyone; only the actual
    // booking/checkout step requires a verified email. Google accounts are
    // always considered verified since Google already confirmed the address.
    const isGoogleAccount = user.providerData?.some((p) => p.providerId === "google.com");
    if (!user.emailVerified && !isGoogleAccount) {
      return navigate("/verify-email");
    }

    if (!guestName.trim()) return setMsg({ type: "error", text: "Please enter the name the booking is under." });
    if (!guestEmail.trim()) return setMsg({ type: "error", text: "Please enter an email address for your receipt." });
    if (!selectedRoom) return setMsg({ type: "error", text: "Please choose a room." });
    if (!checkIn || !checkOut) return setMsg({ type: "error", text: "Please choose your check-in and check-out dates." });
    if (nights < 1) return setMsg({ type: "error", text: "Your check-out date must be after your check-in date." });

    setLoading(true);
    const checkInStr = checkIn.toISOString().slice(0, 10);
    const checkOutStr = checkOut.toISOString().slice(0, 10);

    try {
      const { data: availability } = await checkAvailabilityFn({
        roomId: selectedRoom.id,
        checkIn: checkInStr,
        checkOut: checkOutStr,
      });
      if (!availability.available) {
        setMsg({
          type: "error",
          text: "That room is already taken for those dates. Please try different dates or another room.",
        });
        return;
      }

      if (!window.PaystackPop || typeof window.PaystackPop.setup !== "function") {
        setMsg({
          type: "error",
          text: "Our payment window couldn't start. Please refresh the page, or contact us to book directly.",
        });
        return;
      }

      const paystack = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: guestEmail,
        amount: total * 100,
        currency: "NGN",
        ref: "" + Math.floor(Math.random() * 1000000000 + 1),
        metadata: {
          custom_fields: [
            { display_name: "Room", variable_name: "room", value: selectedRoom.name },
            { display_name: "Guests", variable_name: "guests", value: String(partySize) },
          ],
        },
        callback: function (res) {
          (async () => {
            const reference = res.reference;
            const details = {
              reference,
              roomName: selectedRoom.name,
              checkIn: checkInStr,
              checkOut: checkOutStr,
              nights,
              partySize,
              guestName,
              guestEmail,
              total,
            };

            setMsg({ type: "info", text: "Payment received - confirming your booking…" });
            setLoading(false);

            try {
              // The client never writes "confirmed" to Firestore itself. The
              // Cloud Function re-verifies the payment with Paystack first.
              await verifyPaystackPaymentFn({
                reference,
                roomId: selectedRoom.id,
                checkIn: checkInStr,
                checkOut: checkOutStr,
                guestName,
                guestEmail,
                partySize,
              });

              setMsg({ type: "", text: "" });
              setConfirmed({ ...details, recorded: true });
            } catch (err) {
              // The money moved but our record didn't. Still show the
              // confirmation with the reference - that reference is what makes
              // this recoverable - and flag it quietly rather than alarming them.
              if (import.meta.env.DEV) console.warn("[booking] verify failed", err);
              setMsg({ type: "", text: "" });
              setConfirmed({
                ...details,
                recorded: false,
                problem: friendlyError(
                  err,
                  "We couldn't finish confirming this automatically - please contact us with the reference below."
                ),
              });
            }
          })();
        },
        onClose: function () {
          setMsg({
            type: "info",
            text: "Payment was cancelled. Your dates are still selected if you'd like to try again.",
          });
        },
      });
      paystack.openIframe();
    } catch (err) {
      setMsg({
        type: "error",
        text: friendlyError(err, "We couldn't complete that just now. Please try again in a moment."),
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------- confirmation screen ----------
  if (confirmed) {
    return (
      <div className="availability booking-confirmed">
        <div className="booking-confirmed__emoji" aria-hidden="true">🎉</div>
        <h2>Thank you - your booking is confirmed!</h2>
        <p className="booking-confirmed__blurb">
          We can&apos;t wait to host you, {confirmed.guestName.split(" ")[0]}. Here are your details.
        </p>

        <dl className="booking-confirmed__details">
          <div>
            <dt>Room</dt>
            <dd>{confirmed.roomName}</dd>
          </div>
          <div>
            <dt>Check-in</dt>
            <dd>
              {formatDate(confirmed.checkIn)}
              <small>from {hour12(CHECK_IN_HOUR)}</small>
            </dd>
          </div>
          <div>
            <dt>Check-out</dt>
            <dd>
              {formatDate(confirmed.checkOut)}
              <small>by {hour12(CHECK_OUT_HOUR)}</small>
            </dd>
          </div>
          <div>
            <dt>Nights</dt>
            <dd>{confirmed.nights}</dd>
          </div>
          <div>
            <dt>Guests</dt>
            <dd>
              {confirmed.partySize} {confirmed.partySize === 1 ? "guest" : "guests"}
            </dd>
          </div>
          <div>
            <dt>Total paid</dt>
            <dd className="booking-confirmed__amount">{naira(confirmed.total)}</dd>
          </div>
          <div className="booking-confirmed__wide">
            <dt>Payment reference</dt>
            <dd>
              <code>{confirmed.reference}</code>
            </dd>
          </div>
        </dl>

        <p className="booking-confirmed__note">
          {confirmed.recorded
            ? `We're emailing these details to ${confirmed.guestEmail} now, and Paystack will send its payment receipt separately.`
            : `Paystack has emailed your payment receipt to ${confirmed.guestEmail}.`}
        </p>

        {confirmed.problem && (
          <p className="booking-confirmed__warn">
            {confirmed.problem} Please keep the reference above - it&apos;s all we need to put this
            right.
          </p>
        )}

        <div className="booking-confirmed__actions">
          <Link className="btn btn--primary" to="/my-bookings">
            View my bookings
          </Link>
          <Link className="btn" to="/">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="availability">
      <h2>Check &amp; Book a Room</h2>

      {msg.text && (
        <div className={`alert alert-${msg.type}`} role="status" aria-live="polite">
          {msg.text}
        </div>
      )}

      {!user && (
        <p className="availability__signin-note">
          <Link to="/login">Log in</Link> or <Link to="/signup">create an account</Link> to make a booking.
        </p>
      )}

      <div className="availability-form">
        <div className="field">
          <label htmlFor="guestName">Full name</label>
          <input
            id="guestName"
            type="text"
            placeholder="e.g. Chinedu Okafor"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            disabled={!user}
          />
        </div>

        <div className="field">
          <label htmlFor="guestEmail">Email address</label>
          <input
            id="guestEmail"
            type="email"
            placeholder="We'll send your receipt here"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            disabled={!user}
          />
        </div>

        <div className="field">
          <label htmlFor="partySize">How many people are lodging?</label>
          <select
            id="partySize"
            value={partySize}
            onChange={(e) => setPartySize(Number(e.target.value))}
            disabled={!user}
          >
            {Array.from({ length: MAX_GUESTS }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
          <small className="field__hint">
            Total number of people who will be staying in the room.
          </small>
        </div>

        <div className="field">
          <label htmlFor="roomSelect">Room</label>
          <select
            id="roomSelect"
            disabled={!user}
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
          >
            <option value="">Select a room</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} - {naira(r.price)} / night
              </option>
            ))}
          </select>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="checkIn">Check-in date</label>
            <DatePicker
              id="checkIn"
              selected={checkIn}
              onChange={(date) => setCheckIn(date)}
              placeholderText="Select a date"
              minDate={new Date()}
              dateFormat="dd MMM yyyy"
              disabled={!user}
            />
          </div>
          <div className="field">
            <label htmlFor="checkOut">Check-out date</label>
            <DatePicker
              id="checkOut"
              selected={checkOut}
              onChange={(date) => setCheckOut(date)}
              placeholderText="Select a date"
              minDate={checkIn || new Date()}
              dateFormat="dd MMM yyyy"
              disabled={!user}
            />
          </div>
        </div>
      </div>

      {selectedRoom && nights > 0 && (
        <p className="total-cost">
          {selectedRoom.name} · {partySize} {partySize === 1 ? "guest" : "guests"} · {nights}{" "}
          {nights === 1 ? "night" : "nights"} — <strong>{naira(total)}</strong>
          <span className="total-cost__breakdown">
            {naira(selectedRoom.price)} × {nights}
          </span>
        </p>
      )}

      <button className="availability__submit" onClick={handleBookAndPay} disabled={loading || !user}>
        {loading ? "Processing…" : "Book & Pay"}
      </button>

      {loading && <span className="spinner" aria-label="Loading" />}
    </div>
  );
}
