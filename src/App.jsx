// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { FaWhatsapp, FaMapMarkerAlt, FaArrowUp } from "react-icons/fa";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { db } from "./firebase";

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
import logoImg from "./assets/margies logo.jpg";
import Aadiamond1 from "./assets/Aadiamond1.jpg";
import Aaemerald1 from "./assets/Aaemerald1.jpg";
import Aapartment3 from "./assets/Aapartment3.jpg";
import Aapartment5 from "./assets/Aapartment5.jpg";
import Arbronzite1 from "./assets/Arbronzite1.jpg";
import Aronyx3 from "./assets/Aronyx3.jpg";
import "./App.css";

const whatsappUrl =
  "https://wa.me/+2348035350455?text=I will like to get information about Margies.";
const mapsUrl =
  "https://maps.app.goo.gl/Qb78GZHA61tEyM7XA?g_st=com.google.maps.preview.copy";

// -------- Header component (Landing-style header with hamburger) --------
function Header({ currentUser, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // close mobile menu on navigation change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header className="nav">
      <div className="nav__inner container">
        <button
          className="brand"
          onClick={() => {
            navigate("/");
            setMobileOpen(false);
          }}
          aria-label="Go to home"
        >
          <img src={logoImg} alt="Margie's logo" className="brand__logo" />
          <span className="brand__title">Margie’s</span>
        </button>

        <nav className={`nav__links ${mobileOpen ? "is-open" : ""}`}>
          <a href="#about" onClick={() => setMobileOpen(false)}>
            About
          </a>
          <a href="#rooms" onClick={() => setMobileOpen(false)}>
            Rooms
          </a>
          <a href="#amenities" onClick={() => setMobileOpen(false)}>
            Amenities
          </a>
          <a href="#location" onClick={() => setMobileOpen(false)}>
            Location
          </a>
          <Link to="/gallery" onClick={() => setMobileOpen(false)}>
            Gallery
          </Link>

          <div className="nav__actions">
            {!currentUser ? (
              <>
                <Link
                  to="/login"
                  className="btn btn--sm btn--yellow"
                  onClick={() => setMobileOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="btn btn--sm btn--grey"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link to="/my-bookings" onClick={() => setMobileOpen(false)}>
                  My Bookings
                </Link>
                <button
                  className="admin-button-link"
                  onClick={() => {
                    onLogout();
                    setMobileOpen(false);
                  }}
                >
                  Logout
                </button>
                <span className="nav-welcome">Hello, {currentUser.email}</span>
              </>
            )}
          </div>
        </nav>

        <button
          className={`hamburger ${mobileOpen ? "is-open" : ""}`}
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((s) => !s)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

// --------- small Contact Page (separate route) ----------
function ContactPage() {
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [status, setStatus] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ type: "info", text: "Sending..." });
    try {
      await addDoc(collection(db, "messages"), {
        name: contactName,
        email: contactEmail,
        message: contactMessage,
        created: Timestamp.now(),
      });
      setStatus({ type: "success", text: "Message sent. Thank you!" });
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", text: "Failed to send. Try again." });
    }
    setTimeout(() => setStatus(null), 5000);
  };

  return (
    <main className="page page--center">
      <section className="section section--narrow">
        <h1>Contact Us</h1>
        <div className="card-panel">
          <form className="contact-form" onSubmit={submit}>
            <input
              type="text"
              placeholder="Full name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email address"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
            />
            <textarea
              placeholder="Message"
              rows="6"
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              required
            />
            <button type="submit" className="btn btn--primary">
              Send Message
            </button>
            {status && <p className={`contact-status ${status.type}`}>{status.text}</p>}
          </form>
        </div>
      </section>
    </main>
  );
}

// ----------------- App -----------------
export default function App() {
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsub();
  }, [auth]);

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

  const carouselItems = [
    { src: Aapartment3, alt: "Main Apartment", caption: "Main Apartment" },
    { src: Aapartment5, alt: "Main Apartment 2", caption: "Main Apartment 2" },
    { src: Aadiamond1, alt: "Diamond Room", caption: "Diamond Room" },
    { src: Aaemerald1, alt: "Emerald Room", caption: "Emerald Room" },
    { src: Arbronzite1, alt: "Bronzite Room", caption: "Bronzite Room" },
    { src: Aronyx3, alt: "Onyx Room", caption: "Onyx Room" },
  ];

  const scrollToTop = () =>
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  return (
    <div className="App">
      <Header currentUser={currentUser} onLogout={handleLogout} />

      <Routes>
        {/* Landing */}
        <Route
          path="/"
          element={
            <>
              <LandingPage currentUser={currentUser} />

              <section id="home" className="section no-padding-top">
                <Carousel autoPlay infiniteLoop showThumbs={false} showStatus={false} interval={4000}>
                  {carouselItems.map((it, i) => (
                    <div key={i} className="carousel-slide">
                      <img src={it.src} alt={it.alt} className="carouselmedia" />
                      <p className="legend">{it.caption}</p>
                    </div>
                  ))}
                </Carousel>
              </section>
            </>
          }
        />

        {/* Check availability - own page (card panel wrapper for shadow) */}
        <Route
          path="/check"
          element={
            <main className="page page--center">
              <section className="section section--narrow">
                <h1>Check Room Availability</h1>
                <div className="card-panel">
                  <CheckAvailability />
                </div>
              </section>
            </main>
          }
        />

        {/* Contact page */}
        <Route path="/contact" element={<ContactPage />} />

        {/* Other routes */}
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/my-bookings"
          element={currentUser ? <MyBookings /> : <Navigate to="/login" replace />}
        />

        {/* Admin dashboard route example (secured by uid in your admin login component or auth) */}
        <Route path="/admin" element={<AdminDashboard />} />
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

      {/* Footer */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Margie’s. All rights reserved.</p>
        <a href="/Privacy_Policy_Margies.pdf" download>
          Privacy Policy
        </a>{" "}
        | <a href="/Terms_Conditions_Margies.pdf" download>Terms &amp; Conditions</a>
      </footer>
    </div>
  );
}