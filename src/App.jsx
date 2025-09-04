import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { FaWhatsapp, FaMapMarkerAlt, FaArrowUp, FaSun, FaMoon } from "react-icons/fa";
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
import logo from "./assets/margies logo.jpg";
import Aadiamond1 from "./assets/Aadiamond1.jpg";
import Aaemerald1 from "./assets/Aaemerald1.jpg";
import Aapartment3 from "./assets/Aapartment3.jpg";
import Aapartment5 from "./assets/Aapartment5.jpg";
import Arbronzite1 from "./assets/Arbronzite1.jpg";
import Aronyx3 from "./assets/Aronyx3.jpg";
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

  // Carousel images shown in the “Home” strip under the landing
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
      {/* HEADER */}
      <header className="header">
        <div className="brand-container" onClick={() => navigate("/")}>
          <img src={logo} alt="margies logo" className="logo" />
        </div>
        <nav>
          {/* START: mobile nav toggle */}
<input id="nav-toggle" type="checkbox" className="nav-toggle" aria-label="Toggle navigation" />
<label htmlFor="nav-toggle" className="hamburger" aria-hidden="true"><span></span></label>
{/* END: mobile nav toggle */}
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><a href="#check">Book Now</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><Link to="/gallery" className={location.pathname === "/gallery" ? "active" : ""}>Gallery</Link></li>
            <li>
              <button onClick={toggleTheme} className="theme-toggle-button" aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
                {theme === "light" ? <FaMoon /> : <FaSun />}
              </button>
            </li>

            {!currentUser ? (
              <>

<li><Link to="/login" className="btn-yellow">Log In</Link></li>
<li><Link to="/signup" className="btn-grey">Sign Up</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/my-bookings">My Bookings</Link></li>
                <li><button onClick={handleLogout} className="admin-button-link">Logout</button></li>
                <li className="nav-welcome">Hello, {currentUser.email}</li>
              </>
            )}
          </ul>
        </nav>
      </header>

      <Routes>
        {/* HOME: Landing first, then your sections so #check works */}
        <Route
          path="/"
          element={
            <>
              <LandingPage currentUser={currentUser} />

              {/* A slim “media strip” under the landing (optional) */}
              <section id="home" className="section no-padding-top">
                <Carousel autoPlay infiniteLoop showThumbs={false} showStatus={false} interval={4000}>
                  {carouselItems.map((item, i) => (
                    <div key={i} className="carousel-slide">
                      <img src={item.src} alt={item.alt} className="carouselmedia" />
                      <p className="legend">{item.caption}</p>
                    </div>
                  ))}
                </Carousel>
              </section>

              {/* Check Availability */}
              <section id="check" className="section">
                <h2>Check Room Availability</h2>
                {currentUser ? (
                  <CheckAvailability />
                ) : (
                  <div className="booking-lock">
                    <p>
                      Please <Link to="/login">log in</Link> or{" "}
                      <Link to="/signup">sign up</Link> to book.
                    </p>
                  </div>
                )}
              </section>

              {/* About */}
              <section id="about" className="section">
                <h2>Discover Margies</h2>
                <p>
                  Nestled in the vibrant heart of Lagos Mainland at <strong>43, Oguntona Crescent, Gbagada Phase 1</strong>,
                  Margies is more than just accommodation—it’s a cultural experience. Perched above a bustling indigenous
                  restaurant and opposite a well-stocked supermarket, our location pulses with the authentic rhythm of Lagos life.
                </p>
                <p>
                  By day, explore the neighborhood’s tapestry of commerce and culture. By night, step right into Gbagada’s
                  legendary nightlife, with sizzling suya just steps away.
                </p>
              </section>

              {/* Contact */}
              <section id="contact" className="section">
                <h2>Contact Us</h2>
                <form className="contact-form" onSubmit={handleSubmitContact}>
                  <input type="text" name="name" placeholder="Full Name"
                         value={contactName} onChange={(e) => setContactName(e.target.value)} required />
                  <input type="email" name="email" placeholder="Email Address"
                         value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
                  <textarea name="message" placeholder="Your Message" rows="5"
                            value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} required />
                  <button type="submit">Send Message</button>
                </form>
                {contactStatus && <p className={`contact-status ${contactStatus.type}`}>{contactStatus.message}</p>}
              </section>

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
            </>
          }
        />

        {/* Other pages */}
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/my-bookings"
          element={currentUser ? <MyBookings /> : <Navigate to="/" replace />}
        />
      </Routes>

      {/* FOOTER */}
      <footer className="footer">
        <p>&copy; 2025 Margie’s. All rights reserved.</p>
        <a href="/Privacy_Policy_Margies.pdf" download>Privacy Policy</a> |
        <a href="/Terms_Conditions_Margies.pdf" download>Terms &amp; Conditions</a>
      </footer>
    </div>
  );
}
