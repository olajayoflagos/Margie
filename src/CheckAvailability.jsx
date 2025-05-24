import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './CheckAvailability.css';
import { getFunctions, httpsCallable } from 'firebase/functions';

const CheckAvailability = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchAvailableRooms = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'rooms'));
        const availableRooms = [];
        querySnapshot.forEach(doc => {
          if (doc.data().available) {
            availableRooms.push({ id: doc.id, ...doc.data() });
          }
        });
        setRooms(availableRooms);
      } catch (err) {
        setErrorMsg('Failed to fetch rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableRooms();
  }, []);

  const handleBookNow = async () => {
    
  setSuccessMsg('');
  setErrorMsg('');
  if (loading) return;
  if (checkIn && checkOut && checkIn >= checkOut) {
    setErrorMsg('Check-out date must be after check-in date');
    return;
  }
  if (checkIn && checkIn < new Date()) {
    setErrorMsg('Check-in date cannot be in the past');
    return;
  }
  if (checkOut && checkOut < new Date()) {
    setErrorMsg('Check-out date cannot be in the past');
    return;
  }

  if (!selectedRoom || !guestEmail || !guestName || !checkIn || !checkOut) {
    setErrorMsg('Please fill in all fields');
    return;
  }

  try {
    setLoading(true);
    const roomData = selectedRoom;

    const bookingRef = await addDoc(collection(db, 'bookings'), {
      guestName,
      guestEmail,
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0],
      roomId: roomData.id,
      roomName: roomData.name,
      amountPaid: roomData.price,
      paymentMethod: 'Paystack - Card',
      status: 'Pending',
    });

    // ✅ Correct Paystack setup
    console.log('Type of window.PaystackPop:', typeof window.PaystackPop);
    console.log('Type of window.PaystackPop.setup:', typeof window.PaystackPop.setup);

    try {
      if (window.PaystackPop && typeof window.PaystackPop.setup === 'function') {
        const paystack = window.PaystackPop.setup({
          key: 'pk_live_cb4309974c3aa9a757e93deee00f318d7b4ce241',
          email: guestEmail,
          amount: roomData.price * 100,
          currency: 'NGN',
          ref: `${Date.now()}`, // Optional: generate unique reference
          callback: function(response) { // Removed async
          console.log('Payment response received (simplified callback):', response);
          },
          onClose: function () {
            setErrorMsg('Payment cancelled.');
          },
        });

        paystack.openIframe();
      } else {
        setErrorMsg('Paystack payment could not be initialized.');
      }
    } catch (paystackError) {
      console.error('Paystack error:', paystackError);
      setErrorMsg('An error occurred while initializing payment.');
    }

  } catch (error) {
    console.error('Booking error:', error);
    setErrorMsg('An error occurred while booking. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="availability">
      <h2>Check Room Availability</h2>

      {loading && <div className="spinner"></div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

      <input
        type="text"
        placeholder="Your Full Name"
        value={guestName}
        onChange={e => setGuestName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Your Email Address"
        value={guestEmail}
        onChange={e => setGuestEmail(e.target.value)}
      />

      <div>
        <label>Check-In Date:</label>
        <DatePicker
          selected={checkIn}
          onChange={date => setCheckIn(date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select check-in date"
          minDate={new Date()}
        />
      </div>

      <div>
        <label>Check-Out Date:</label>
        <DatePicker
          selected={checkOut}
          onChange={date => setCheckOut(date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select check-out date"
          minDate={checkIn || new Date()}
        />
      </div>

      <select
        onChange={e => setSelectedRoom(JSON.parse(e.target.value))}
        defaultValue=""
      >
        <option value="" disabled> Select Available Room (15% Discount Ongoing) </option>
        {rooms.map(room => (
          <option key={room.id} value={JSON.stringify(room)}>
            {room.name} - ₦{room.price}
          </option>
        ))}
      </select>

      <button onClick={handleBookNow} disabled={loading}>
        {loading ? 'Processing...' : 'Book and Pay'}
      </button>
    </div>
  );
};

export default CheckAvailability;