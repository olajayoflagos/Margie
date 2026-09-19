/**
 * Booking time helpers.
 *
 * Bookings store dates as plain "YYYY-MM-DD" strings, with no time of day.
 * The house times are the ones published in our schema.org data, so they must
 * stay in sync with functions/index.js and src/seo/schema.js.
 */
export const CHECK_IN_HOUR = 14; // 2:00 PM
export const CHECK_OUT_HOUR = 12; // 12:00 noon

/** "2026-09-20" + hour -> a real Date in the visitor's local time. */
export function atHour(dateStr, hour) {
  if (!dateStr) return null;
  const [y, m, d] = String(dateStr).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, hour, 0, 0, 0);
}

export const checkInAt = (booking) => atHour(booking.checkIn, CHECK_IN_HOUR);
export const checkOutAt = (booking) => atHour(booking.checkOut, CHECK_OUT_HOUR);

/**
 * Where a booking sits relative to right now.
 *  cancelled | upcoming | active | past
 */
export function bookingPhase(booking, now = new Date()) {
  if (booking.status === "cancelled") return "cancelled";
  const start = checkInAt(booking);
  const end = checkOutAt(booking);
  if (!start || !end) return "upcoming";
  if (now < start) return "upcoming";
  if (now >= start && now < end) return "active";
  return "past";
}

/**
 * Breaks a millisecond gap into days/hours/minutes/seconds.
 * Returns null once the moment has passed, so callers can stop rendering.
 */
export function countdownParts(target, now = new Date()) {
  if (!target) return null;
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) return null;

  const totalSeconds = Math.floor(ms / 1000);
  return {
    ms,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

/** "3 days, 4 hrs" / "4 hrs 12 mins" / "12 mins 30 secs" */
export function formatCountdown(parts) {
  if (!parts) return "";
  const { days, hours, minutes, seconds } = parts;
  if (days > 0) return `${days} ${days === 1 ? "day" : "days"}, ${hours} ${hours === 1 ? "hr" : "hrs"}`;
  if (hours > 0) return `${hours} ${hours === 1 ? "hr" : "hrs"} ${minutes} ${minutes === 1 ? "min" : "mins"}`;
  if (minutes > 0) return `${minutes} ${minutes === 1 ? "min" : "mins"} ${seconds} ${seconds === 1 ? "sec" : "secs"}`;
  return `${seconds} ${seconds === 1 ? "second" : "seconds"}`;
}

/** "Sat, 20 Sep 2026" */
export function formatDate(dateStr) {
  const d = atHour(dateStr, 12);
  if (!d) return dateStr || "-";
  return d.toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const formatNaira = (n) => `\u20a6${Number(n || 0).toLocaleString("en-NG")}`;
