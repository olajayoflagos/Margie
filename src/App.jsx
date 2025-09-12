// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { FaWhatsapp, FaMapMarkerAlt, FaArrowUp } from "react-icons/fa";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { db } from "./firebase";

import Header from "./Header";
import Login from "./Login";
import Signup from "./Signup";
import ResetPassword from "./ResetPassword";
import MyBookings from "./MyBookings";
import AdminDashboard from "./AdminDashboard";
import Gallery from "./Gallery";
import CheckAvailability from "./CheckAvailability";
import LandingPage from "./LandingPage";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./App.css";

const whatsappUrl = "https://wa.me/+2348035350455?text=I will like to get information about Margies.";
const mapsUrl = "https://maps.app.goo.gl/Qb78GZHA61tEyM7XA?g_st=com.google.maps.preview.copy";

export default function App() {
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState(null);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => onAuthStateChanged(auth, setCurrentUser), [auth]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  useEffect(() => {
    document.body.classList.remove("light-mode", "dark-mode");
    document.body.classList.add(theme + "-mode");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const onScroll = () => setShowScrollTopButton(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/", { replace: true });
  };

  const handleSubmitContact = async (e) => {
    e.preventDefault();
    setContactStatus({ message: "Sending message...", type: "info" });
    try {
      await addDoc(collection(db, "messages"), {
        name: contactName,
        email: contactEmail,
        message: contactMessage,
        created: Timestamp.now(),
      });
      setContactStatus({ message: "Message sent successfully!", type: "success" });
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch {
      setContactStatus({ message: "Error sending message. Please try again.", type: "error" });
    }
    setTimeout(() => setContactStatus(null), 5000);
  };

  const scrollToTop = () =>
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  return (
    <div className="App">
      {/* Single consistent header used on every page */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <Routes>
        <Route path="/" element={<LandingPage currentUser={currentUser} />} />

        {/* NEW: Check page is a standalone route */}
        <Route
          path="/check"
          element={
            currentUser ? (
              <main className="page-with-padding">
                <h1 style={{ textAlign: "center", marginTop: 20 }}>Check Room Availability</h1>
                <div className="panel-fill">
                  <CheckAvailability />
                </div>
              </main>
            ) : (
              <main className="page-with-padding">
                <div className="booking-lock" style={{ maxWidth: 700, margin: "2rem auto" }}>
                  <p>Please <Link to="/login">log in</Link> or <Link to="/signup">sign up</Link> to book.</p>
                </div>
              </main>
            )
          }
        />

        <Route path="/gallery" element={<Gallery />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/my-bookings" element={currentUser ? <MyBookings /> : <Navigate to="/" replace />} />

        {/* Admin route: protect as needed */}
        <Route path="/admin" element={currentUser?.uid === "aI2M8Jt2TrSav72XthNdvTHnHzD3" ? <AdminDashboard /> : <Navigate to="/" replace />} />
      </Routes>

      {/* Floating actions */}
      <a href={mapsUrl} className="map-float" target="_blank" rel="noopener noreferrer" aria-label="View location on Google Maps">
        <FaMapMarkerAlt className="map-icon" />
      </a>
      <a href={whatsappUrl} className="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">
        <FaWhatsapp className="whatsapp-icon" />
      </a>

      {showScrollTopButton && (
        <button onClick={scrollToTop} className="scroll-top-button" aria-label="Scroll to top">
          <FaArrowUp />
        </button>
      )}

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Margie's. All rights reserved.</p>
        <a href="/Privacy_Policy_Margies.pdf" download>Privacy Policy</a> |
        <a href="/Terms_Conditions_Margies.pdf" download>Terms &amp; Conditions</a>
      </footer>
    </div>
  );
}