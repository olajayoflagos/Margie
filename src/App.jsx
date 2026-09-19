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
import { FaWhatsapp, FaMapMarkerAlt, FaArrowUp, FaInstagram } from "react-icons/fa";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { db } from "./firebase";
import Seo from "./seo/Seo";
import { friendlyError } from "./utils/errors";

import Login from "./Login";
import Signup from "./Signup";
import ResetPassword from "./ResetPassword";
import VerifyEmail from "./VerifyEmail";
import MyBookings from "./MyBookings";

import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";
import ProtectedAdminRoute from "./ProtectedAdminRoute";
import Gallery from "./Gallery";
import CheckAvailability from "./CheckAvailability";
import LandingPage from "./LandingPage";
import RoomPage from "./RoomPage";
import BlogList from "./blog/BlogList";
import BlogPost from "./blog/BlogPost";
import Support from "./Support";

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
const instagramUrl = "https://instagram.com/margiesplace_";

// -------- Header component (Landing-style header with hamburger) --------
function Header({ currentUser, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // close mobile menu on navigation change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Sections (#about, #rooms, #amenities, #location) only exist on the
  // homepage. From any other page (e.g. a room page) a plain <a href="#about">
  // does nothing useful - there's nothing on the current page to scroll to.
  // This navigates to "/" first (if needed) and then smooth-scrolls once the
  // homepage content is on screen, so the links work from anywhere on the site.
  const goToSection = (id) => (e) => {
    e.preventDefault();
    setMobileOpen(false);
    if (location.pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate(`/#${id}`);
    }
  };

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
          <a href="/#about" onClick={goToSection("about")}>
            About
          </a>
          <a href="/#rooms" onClick={goToSection("rooms")}>
            Rooms
          </a>
          <a href="/#amenities" onClick={goToSection("amenities")}>
            Amenities
          </a>
          <a href="/#location" onClick={goToSection("location")}>
            Location
          </a>
          <Link to="/gallery" onClick={() => setMobileOpen(false)}>
            Gallery
          </Link>
          <Link to="/blog" onClick={() => setMobileOpen(false)}>
            Guides &amp; Stories
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
      setStatus({
        type: "error",
        text: friendlyError(err, "We couldn't send your message. Please try again, or reach us on WhatsApp."),
      });
    }
    setTimeout(() => setStatus(null), 5000);
  };

  return (
    <main className="page page--center">
      <Seo
        title="Contact Margie's | Gbagada, Lagos"
        description="Get in touch with Margie's for booking questions, group stays, or anything else."
        path="/contact"
      />
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
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsub();
  }, [auth]);

  // Completes the navigation started by Header's goToSection: once we've
  // landed on "/" with a #hash (either via the header links above, or a
  // shared link like margies.com.ng/#amenities), scroll to that section once
  // its content has painted.
  useEffect(() => {
    if (location.pathname === "/" && location.hash) {
      const id = location.hash.slice(1);
      const t = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
      return () => clearTimeout(t);
    }
  }, [location]);

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
              <Seo
                title="Check Availability & Book | Margie's"
                description="Check room availability and book your stay at Margie's in Gbagada, Lagos."
                path="/check"
              />
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

        {/* Buy the owner a coffee */}
        <Route path="/support" element={<Support />} />

        {/* Rooms - each gets its own indexable URL, meta tags and schema */}
        <Route path="/rooms/:slug" element={<RoomPage />} />

        {/* Guides & Stories (blog / articles CMS) */}
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogPost />} />

        {/* Other routes */}
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/verify-email"
          element={
            currentUser ? (
              <VerifyEmail user={currentUser} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/my-bookings"
          element={
            currentUser ? (
              <>
                <Seo
                  title="My Bookings | Margie's"
                  description="View and manage your bookings at Margie's."
                  path="/my-bookings"
                  noindex
                />
                <MyBookings />
              </>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Admin: /admin-login signs in, /admin is gated by a real custom
            claim check (ProtectedAdminRoute), not a hidden client-side UID. */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
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
        <br />
        <Link to="/support" className="footer__coffee">
          ☕ Buy the owner a coffee
        </Link>
        <br />
        <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="footer__instagram">
          <FaInstagram style={{ verticalAlign: "-2px", marginRight: "4px" }} />
          @margiesplace_
        </a>
      </footer>
    </div>
  );
}