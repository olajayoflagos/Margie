// BookingForm.jsx
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO } from "date-fns";
// Import the new CSS file for BookingForm
import "./BookingForm.css";
import { createBookingRequest } from "./bookingService";
import emailjs from "emailjs-com";
import { differenceInDays } from "date-fns";
const roomOptions = [
  { value: "apartment", label: "The Apartment" },
  { value: "diamond", label: "Room Diamond" },
  { value: "emerald", label: "Room Emerald" },
  { value: "onyx", label: "Room Onyx" },
  { value: "bronzite", label: "Room Bronzite" },
];


// Assuming this component might receive props like initialRoomId or initialDates
export default function BookingForm() {
  const [roomId, setRoomId] = useState(roomOptions[0].value); // Default to the first room
 const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [partySize, setPartySize] = useState(1);
const [checkIn, setCheckIn] = useState(null);
const [checkOut, setCheckOut] = useState(null);
  const [dates, setDates] = useState([]); // Array for [startDate, endDate]
  const [disabledDates, setDisabledDates] = useState([]); // Dates to disable in the picker
  const [status, setStatus] = useState(""); // To display booking status feedback
  const [isBooking, setIsBooking] = useState(false); // To show loading state

  // Load unavailable dates for the initially selected room
  useEffect(() => {
    async function loadDisabledDates() {
      try {
        // Fetch unavailable dates for the current room (and its linked rooms via service)
        const dates = await getUnavailableDates(roomId);
        // Convert string dates to Date objects required by DatePicker excludeDates prop
        const parsed = dates.map(dateStr => parseISO(dateStr));
        setDisabledDates(parsed);
      } catch (error) {
        console.error("Error loading disabled dates:", error);
        // Handle error loading dates if necessary
      }
    }

    loadDisabledDates();
     // Dependency array: re-run effect if roomId changes
  }, [roomId]);


  // Function to handle date range selection from the DatePicker
  const handleDateSelect = (dateRange) => {
      // DatePicker returns [startDate, endDate] for range selection
      setDates(dateRange);
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  const nights = differenceInDays(checkOut, checkIn);
  const amountPaid = roomOptions
    .find(r => r.value === roomId).price
    * nights;

  // 1) Write booking & fire EmailJS confirmation
  const bookingId = await createBookingRequest({
    name, email, partySize,
    roomId, dates: [checkIn, checkOut],
    nights, amountPaid
  });
  await emailjs.send(
    "service_3osbiq5",
    "template_6aqw75p",
    {
      booking_id: bookingId,
      email,
      checkIn: checkIn.toISOString().slice(0,10),
      checkOut: checkOut.toISOString().slice(0,10),
      name,
      roomName: roomOptions.find(r=>r.value===roomId).label,
      amountPaid
    }
  );
  setStatus("Booking confirmed!");
};


 
  return (
    // Added a className to the main div
    <div className="booking-form-container">
      <h3>Book a Room</h3> {/* This will use themed h3 style */}
      <form onSubmit={handleSubmit} className="booking-form"> {/* Added form class */}

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
            onChange={e => setPartySize(e.target.value)}
            required
        />
        <label htmlFor="room-select">Select Room:</label> {/* Added label htmlFor */}
        <select
          id="room-select" // Match label htmlFor
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
          className="booking-form-select" // Added class
        >
          {roomOptions.map(room => (
            <option key={room.value} value={room.value}>{room.label}</option>
          ))}
        </select>

        <br />

        <label htmlFor="date-range-picker">Select Dates:</label> {/* Added label htmlFor */}
        <DatePicker
          id="date-range-picker" // Match label htmlFor
          selected={null} // DatePicker manages the range internally based on startDate/endDate props
          onChange={handleDateSelect} // Use the new handler
          startDate={dates[0]}
          endDate={dates[1]}
          selectsRange
          inline // Display inline calendar
          excludeDates={disabledDates} // Disable already booked dates
          minDate={new Date()} // Cannot book past dates
          dateFormat="yyyy-MM-dd" // Consistent format
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
           {isBooking ? "Processing..." : "Book Now"} {/* Button text based on loading state */}
        </button>
      </form>
      {/* Display the status message */}
      {status && <p>{status}</p>}
    </div>
  );
}