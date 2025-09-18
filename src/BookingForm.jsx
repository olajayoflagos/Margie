import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO, differenceInDays } from "date-fns";
// Import the new CSS file for BookingForm
import "./BookingForm.css";
import { createBookingRequest, getUnavailableDates } from "./bookingService";

const roomOptions = [
  { value: "apartment", label: "The Apartment", price: 20000 },
  { value: "diamond", label: "Room Diamond", price: 15000 },
  { value: "emerald", label: "Room Emerald", price: 12000 },
  { value: "onyx", label: "Room Onyx", price: 10000 },
  { value: "bronzite", label: "Room Bronzite", price: 8000 },
];

export default function BookingForm() {
  const [roomId, setRoomId] = useState(roomOptions[0].value);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [dates, setDates] = useState([null, null]);
  const [disabledDates, setDisabledDates] = useState([]);
  const [status, setStatus] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    async function loadDisabledDates() {
      try {
        const dates = await getUnavailableDates(roomId);
        setDisabledDates(dates);
      } catch (error) {
        console.error("Error loading disabled dates:", error);
      }
    }
    loadDisabledDates();
  }, [roomId]);

  // When the DatePicker returns a range, we set both checkIn and checkOut
  const handleDateSelect = (dateRange) => {
    setDates(dateRange);
    setCheckIn(dateRange[0] || null);
    setCheckOut(dateRange[1] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      setStatus("Please select check-in and check-out dates.");
      return;
    }

    const nights = differenceInDays(checkOut, checkIn);
    if (nights <= 0) {
      setStatus("Please select a valid date range.");
      return;
    }

    const room = roomOptions.find(r => r.value === roomId);
    const amountPaid = room.price * nights;

    setIsBooking(true);
    setStatus("");
    try {
      const bookingId = await createBookingRequest({
        name,
        email,
        partySize: Number(partySize),
        roomId,
        dates: [checkIn, checkOut],
        nights,
        amountPaid,
      });
      setStatus("Booking confirmed! ID: " + bookingId);
      // Optionally reset form here
    } catch (err) {
      console.error(err);
      setStatus("Failed to create booking. Try again.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="booking-form-container">
      <h3>Book a Room</h3>
      <form onSubmit={handleSubmit} className="booking-form">

        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="number"
          min="1"
          placeholder="Number of Guests"
          value={partySize}
          onChange={e => setPartySize(Number(e.target.value))}
          required
        />
        <label htmlFor="room-select">Select Room:</label>
        <select
          id="room-select"
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
          className="booking-form-select"
        >
          {roomOptions.map(room => (
            <option key={room.value} value={room.value}>{room.label}</option>
          ))}
        </select>

        <br />

        <label htmlFor="date-range-picker">Select Dates:</label>
        <DatePicker
          id="date-range-picker"
          selected={dates[0]}
          onChange={handleDateSelect}
          startDate={dates[0]}
          endDate={dates[1]}
          selectsRange
          inline
          excludeDates={disabledDates}
          minDate={new Date()}
          dateFormat="yyyy-MM-dd"
        />

        <br />
        {checkIn && checkOut && (
          <p className="total-cost">
            Total Cost: ₦{
              roomOptions.find(room => room.value === roomId).price
                * differenceInDays(checkOut, checkIn)
            }
          </p>
        )}
        <button type="submit" className="booking-form-button" disabled={isBooking}>
           {isBooking ? "Processing..." : "Book Now"}
        </button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
}