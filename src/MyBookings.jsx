import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchUserBookings, cancelBooking } from "./bookingService";
import { friendlyError } from "./utils/errors";
import {
  bookingPhase,
  checkInAt,
  checkOutAt,
  countdownParts,
  formatCountdown,
  formatDate,
  formatNaira,
  CHECK_IN_HOUR,
  CHECK_OUT_HOUR,
} from "./utils/bookingTime";
import "./MyBookings.css";

const hour12 = (h) => (h === 12 ? "12:00 noon" : h > 12 ? `${h - 12}:00 PM` : `${h}:00 AM`);

/** One ticking clock for the whole page rather than one per card. */
function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function Countdown({ label, target, now, tone }) {
  const parts = countdownParts(target, now);
  if (!parts) return null;
  return (
    <div className={`booking-countdown booking-countdown--${tone}`}>
      <span className="booking-countdown__label">{label}</span>
      <div className="booking-countdown__clock">
        {parts.days > 0 && (
          <span className="booking-countdown__unit">
            <b>{parts.days}</b>
            <small>{parts.days === 1 ? "day" : "days"}</small>
          </span>
        )}
        <span className="booking-countdown__unit">
          <b>{String(parts.hours).padStart(2, "0")}</b>
          <small>hrs</small>
        </span>
        <span className="booking-countdown__unit">
          <b>{String(parts.minutes).padStart(2, "0")}</b>
          <small>mins</small>
        </span>
        <span className="booking-countdown__unit">
          <b>{String(parts.seconds).padStart(2, "0")}</b>
          <small>secs</small>
        </span>
      </div>
      <span className="booking-countdown__plain">{formatCountdown(parts)} to go</span>
    </div>
  );
}

function BookingCard({ booking, now, onCancel, cancelling }) {
  const phase = bookingPhase(booking, now);
  const start = checkInAt(booking);
  const end = checkOutAt(booking);

  const phaseLabel = {
    upcoming: "Upcoming",
    active: "Staying now",
    past: "Completed",
    cancelled: "Cancelled",
  }[phase];

  return (
    <li className={`booking-card booking-card--${phase}`}>
      <div className="booking-card__head">
        <div>
          <h3>{booking.roomName || "Room"}</h3>
          <p className="booking-card__ref">
            Reference <code>{booking.paymentRef || booking.id}</code>
          </p>
        </div>
        <span className={`booking-badge booking-badge--${phase}`}>{phaseLabel}</span>
      </div>

      {phase === "upcoming" && (
        <Countdown label="Your stay begins in" target={start} now={now} tone="start" />
      )}
      {phase === "active" && (
        <Countdown label="Time left before check-out" target={end} now={now} tone="end" />
      )}

      <dl className="booking-details">
        <div>
          <dt>Check-in</dt>
          <dd>
            {formatDate(booking.checkIn)}
            <small> from {hour12(CHECK_IN_HOUR)}</small>
          </dd>
        </div>
        <div>
          <dt>Check-out</dt>
          <dd>
            {formatDate(booking.checkOut)}
            <small> by {hour12(CHECK_OUT_HOUR)}</small>
          </dd>
        </div>
        <div>
          <dt>Nights</dt>
          <dd>{booking.nights || "-"}</dd>
        </div>
        <div>
          <dt>Guests</dt>
          <dd>
            {booking.partySize || 1} {(booking.partySize || 1) === 1 ? "guest" : "guests"}
          </dd>
        </div>
        <div>
          <dt>Booked under</dt>
          <dd>{booking.guestName || "-"}</dd>
        </div>
        <div>
          <dt>Total paid</dt>
          <dd className="booking-details__amount">{formatNaira(booking.amountPaid)}</dd>
        </div>
      </dl>

      {phase === "past" && (
        <p className="booking-card__note">
          We hope you enjoyed your stay. <Link to="/check">Book again</Link> or{" "}
          <Link to="/support">buy the owner a coffee</Link>.
        </p>
      )}

      {phase === "cancelled" && (
        <p className="booking-card__note">
          This booking was cancelled. If you were charged and haven&apos;t been refunded, contact us
          with the reference above.
        </p>
      )}

      {(phase === "upcoming" || phase === "active") && (
        <div className="booking-card__actions">
          <button
            className="booking-card__cancel"
            onClick={() => onCancel(booking)}
            disabled={cancelling}
          >
            {cancelling ? "Cancelling…" : "Cancel booking"}
          </button>
        </div>
      )}
    </li>
  );
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const now = useNow();

  useEffect(() => {
    fetchUserBookings()
      .then(setBookings)
      .catch((err) =>
        setError(friendlyError(err, "We couldn't load your bookings. Please refresh and try again."))
      )
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (booking) => {
    const ok = window.confirm(
      `Cancel your booking for ${booking.roomName}?\n\nThis cannot be undone from here.`
    );
    if (!ok) return;

    setError("");
    setCancellingId(booking.id);
    try {
      await cancelBooking(booking.id);
      setBookings((list) =>
        list.map((b) => (b.id === booking.id ? { ...b, status: "cancelled" } : b))
      );
    } catch (err) {
      setError(friendlyError(err, "We couldn't cancel that booking. Please contact us and we'll help."));
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <main className="my-bookings">
        <h1>My Bookings</h1>
        <p className="my-bookings__loading">Loading your bookings…</p>
      </main>
    );
  }

  const order = { active: 0, upcoming: 1, past: 2, cancelled: 3 };
  const sorted = [...bookings].sort((a, b) => {
    const diff = order[bookingPhase(a, now)] - order[bookingPhase(b, now)];
    if (diff !== 0) return diff;
    return String(a.checkIn).localeCompare(String(b.checkIn));
  });

  const upcomingCount = sorted.filter((b) => bookingPhase(b, now) === "upcoming").length;
  const activeCount = sorted.filter((b) => bookingPhase(b, now) === "active").length;

  return (
    <main className="my-bookings">
      <h1>My Bookings</h1>

      {error && <p className="my-bookings__error">{error}</p>}

      {!sorted.length ? (
        <div className="my-bookings__empty">
          <p>You don&apos;t have any bookings yet.</p>
          <Link className="my-bookings__cta" to="/check">
            Check availability
          </Link>
        </div>
      ) : (
        <>
          <p className="my-bookings__summary">
            {activeCount > 0 && `${activeCount} stay in progress. `}
            {upcomingCount > 0
              ? `${upcomingCount} upcoming ${upcomingCount === 1 ? "booking" : "bookings"}.`
              : activeCount === 0 && "No upcoming bookings."}
          </p>

          <ul className="my-bookings__list">
            {sorted.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                now={now}
                onCancel={handleCancel}
                cancelling={cancellingId === b.id}
              />
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
