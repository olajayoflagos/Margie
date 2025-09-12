// src/App.jsx
import { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { FaWhatsapp, FaMapMarkerAlt, FaArrowUp, FaSun, FaMoon, FaBars, FaTimes } from "react-icons/fa";
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
// LandingPage content will be included inline as LandingContent

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
import "./LandingPage.css"; // keep your landing styles too (optional)

const whatsappUrl = "https://wa.me/+2348035350455?text=I will like to get information about Margies.";
const mapsUrl = "https://maps.app.goo.gl/Qb78GZHA61tEyM7XA?g_st=com.google.maps.preview.copy";

export default function App() {
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState(null);

  // Landing page local state
  const [mobileOpen, setMobileOpen] = useState(false);

  // Contact form state (site-wide contact in footer/sections)
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState(null);

  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  const location = useLocation();
  const navigate = useNavigate();

  // keep track of auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    return () => unsub();
  }, [auth]);

  // theme
  useEffect(() => {
    document.body.classList.remove("light-mode", "dark-mode");
    document.body.classList.add(theme + "-mode");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // scroll top button visibility
  useEffect(() => {
    const onScroll = () => setShowScrollTopButton(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // helper: navigate to home then scroll to section
  const goToSection = (sectionId) => {
    // close mobile menu
    setMobileOpen(false);

    if (location.pathname !== "/") {
      // navigate to root then scroll after short delay
      navigate("/");
      // give react time to render the landing page
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

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
    } catch (err) {
      console.error(err);
      setContactStatus({ message: "Error sending message. Please try again.", type: "error" });
    }
    setTimeout(() => setContactStatus(null), 5000);
  };

  // carousel items
  const carouselItems = [
    { src: Aapartment3, alt: "Main Apartment", caption: "Main Apartment" },
    { src: Aapartment5, alt: "Main Apartment 2", caption: "Main Apartment 2" },
    { src: Aadiamond1, alt: "Diamond Room", caption: "Diamond Room" },
    { src: Aaemerald1, alt: "Emerald Room", caption: "Emerald Room" },
    { src: Arbronzite1, alt: "Bronzite Room", caption: "Bronzite Room" },
    { src: Aronyx3, alt: "Onyx Room", caption: "Onyx Room" },
  ];

  // Scroll to top
  const scrollToTop = () =>
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  /* -------------------------
     Inline LandingPage content
     kept as a component so we have a single-file app
     ------------------------- */
  function LandingContent({ currentUserProp }) {
    // local page images & data (same as your LandingPage)
    const heroImg = Aapartment3;
    const roomDiamond = Aadiamond1;
    const roomEmerald = Aaemerald1;
    const roomOnyx = Aronyx3;
    const roomBronzite = Arbronzite1;
    const apt2 = Aapartment5;

    const rooms = [
      {
        name: "The Apartment",
        img: heroImg,
        perks: ["2 Bedrooms", "City View", "Kitchenette"],
        price: "₦127,500 / night",
      },
      {
        name: "Room Diamond",
        img: roomDiamond,
        perks: ["Queen Bed", "Smart TV", "Workspace"],
        price: "₦59,500 / night",
      },
      {
        name: "Room Emerald",
        img: roomEmerald,
        perks: ["Cozy Bed", "AC", "Fast Wi-Fi"],
        price: "₦59,500 / night",
      },
      {
        name: "Room Onyx",
        img: roomOnyx,
        perks: ["Warm Lighting", "Wardrobe", "Ensuite"],
        price: "₦34,000 / night",
      },
      {
        name: "Room Bronzite",
        img: roomBronzite,
        perks: ["Budget-friendly", "Clean", "Comfortable"],
        price: "₦59,500 / night",
      },
    ];

    const gallery = [heroImg, apt2, roomDiamond, roomEmerald, roomOnyx, roomBronzite];

    return (
      <div className="margies">
        {/* ====== NAVBAR (inside landing so we can show/hide with mobileOpen) ====== */}
        <header className="nav">
          <div className="nav__inner container">
            <a className="brand" onClick={() => { navigate("/"); setMobileOpen(false); }} style={{ cursor: "pointer" }}>
              <img src={logo} alt="Margie's logo" />
              <span>Margie’s</span>
            </a>

            <nav className={`nav__links ${mobileOpen ? "is-open" : ""}`}>
              <a onClick={() => goToSection("about")}>About</a>
              <a onClick={() => goToSection("rooms")}>Rooms</a>
              <a onClick={() => goToSection("amenities")}>Amenities</a>
              <a onClick={() => goToSection("location")}>Location</a>
              <Link to="/gallery" onClick={() => setMobileOpen(false)}>Gallery</Link>
              {/* Book Now navigates to the check section (which is on the home page) */}
              <button className="btn btn--sm btn--primary" onClick={() => goToSection("check")}>Book Now</button>
            </nav>

            <button
              className={`hamburger ${mobileOpen ? "is-open" : ""}`}
              aria-label="Toggle navigation"
              onClick={() => setMobileOpen(v => !v)}
            >
              {mobileOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </header>

        {/* ====== HERO ====== */}
        <section className="hero">
          <img className="hero__bg" src={heroImg} alt="Margie's Apartment hero" />
          <div className="hero__overlay" />
          <div className="container hero__content">
            <p className="eyebrow">Gbagada • Lagos Mainland</p>
            <h1>Live Lagos. Not just visit it.</h1>
            <p className="sub">
              Comfortable private rooms & a city-view apartment above a vibrant local spot.
              Steps from suya at night, a supermarket across the street, and quick access
              to everything Lagos.
            </p>
            <div className="hero__actions">
              <button className="btn btn--primary" onClick={() => goToSection("check")}>Check Availability</button>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn btn--ghost">
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* ====== TRUST STRIP ====== */}
        <section className="trust container">
          <div>Fast Wi-Fi</div>
          <div>24/7 Power</div>
          <div>Safe Location</div>
          <div>Self Check-in</div>
          <div>Great Value</div>
        </section>

        {/* ====== ABOUT ====== */}
        <section id="about" className="about container">
          <div className="about__text">
            <h2>Discover Margie’s</h2>
            <p>
              Nestled at <strong>43, Oguntona Crescent, Gbagada Phase 1</strong>, Margie’s
              blends comfort with the authentic rhythm of Lagos life...
            </p>
            <div className="about__cta">
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn btn--ghost">
                View on Google Maps
              </a>
              <button className="btn btn--primary" onClick={() => goToSection("check")}>Book Your Stay</button>
            </div>
          </div>
          <div className="about__image">
            <img src={apt2} alt="Margie's interior preview" />
          </div>
        </section>

        {/* ====== ROOMS ====== */}
        <section id="rooms" className="rooms container">
          <div className="section-head">
            <h2>Rooms & Apartment</h2>
            <p>Simple, spotless spaces—with all the essentials you actually need.</p>
          </div>

          <div className="rooms__grid">
            {rooms.map((r) => (
              <article className="room-card" key={r.name}>
                <div className="room-card__image">
                  <img src={r.img} alt={r.name} />
                </div>
                <div className="room-card__body">
                  <h3>{r.name}</h3>
                  <ul className="room-card__perks">
                    {r.perks.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                  <div className="room-card__footer">
                    <span className="price">{r.price}</span>
                    <button className="btn btn--sm btn--primary" onClick={() => goToSection("check")}>Reserve</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ====== AMENITIES ====== */}
        <section id="amenities" className="amenities">
          <div className="container">
            <div className="section-head">
              <h2>Amenities</h2>
              <p>Everything you need for a smooth, stress-free stay.</p>
            </div>

            <div className="amenities__grid">
              <div className="amenity">
                <span className="amenity__icon">⚡</span>
                <h4>Reliable Power</h4>
                <p>Backup power for minimal interruptions.</p>
              </div>
              <div className="amenity">
                <span className="amenity__icon">📶</span>
                <h4>Fast Wi-Fi</h4>
                <p>Solid internet for work and streaming.</p>
              </div>
              <div className="amenity">
                <span className="amenity__icon">🛏️</span>
                <h4>Cozy Beds</h4>
                <p>Fresh linens and restful nights.</p>
              </div>
              <div className="amenity">
                <span className="amenity__icon">🧹</span>
                <h4>Cleanliness</h4>
                <p>Sanitized rooms and common areas.</p>
              </div>
              <div className="amenity">
                <span className="amenity__icon">🔒</span>
                <h4>Secure</h4>
                <p>Safe neighborhood and smart locks.</p>
              </div>
              <div className="amenity">
                <span className="amenity__icon">🍢</span>
                <h4>Food Nearby</h4>
                <p>Suya spots & market just steps away.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ====== GALLERY ====== */}
        <section className="gallery container">
          <div className="section-head">
            <h2>Gallery</h2>
            <p>Take a quick look around.</p>
          </div>
          <div className="gallery__grid">
            {gallery.map((g, i) => (
              <div className="gallery__item" key={i}>
                <img src={g} alt={`Gallery ${i + 1}`} loading="lazy" />
              </div>
            ))}
          </div>
          <div className="center">
            <Link to="/gallery" className="btn btn--ghost" onClick={() => setMobileOpen(false)}>See More Photos</Link>
          </div>
        </section>

        {/* ====== TESTIMONIALS ====== */}
        <section className="testimonials">
          <div className="container">
            <div className="section-head">
              <h2>What Guests Say</h2>
            </div>
            <div className="testimonials__grid">
              <blockquote className="quote">
                <p>
                  “Great location, spotless room, and surprisingly quiet at night.
                  The suya down the road is elite!”
                </p>
                <footer>— Kemi, Abuja</footer>
              </blockquote>
              <blockquote className="quote">
                <p>
                  “Felt very safe. Self check-in was smooth, and the Wi-Fi was strong
                  enough for video calls.”
                </p>
                <footer>— David, London</footer>
              </blockquote>
              <blockquote className="quote">
                <p>
                  “Exactly as described. Lagos vibes with comfort. I’ll be back.”
                </p>
                <footer>— Chidera, Port Harcourt</footer>
              </blockquote>
            </div>
          </div>
        </section>

        {/* ====== LOCATION ====== */}
        <section id="location" className="location container">
          <div className="section-head">
            <h2>Find Us</h2>
            <p>43, Oguntona Crescent, Gbagada Phase 1, Lagos</p>
          </div>
          <div className="map-wrap">
            <iframe
              title="Margie's on Google Maps"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://maps.app.goo.gl/Qb78GZHA61tEyM7XA?g_st=com.google.maps.preview.copy"
            />
          </div>
          <div className="center">
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn btn--primary">
              Open in Google Maps
            </a>
          </div>
        </section>

        {/* ====== BOTTOM CTA ====== */}
        <section className="cta">
          <div className="container cta__inner">
            <h2>Ready to stay at Margie’s?</h2>
            <p>Pick your dates, reserve your room, and we’ll handle the rest.</p>
            <div className="cta__actions">
              <button className="btn btn--primary" onClick={() => goToSection("check")}>Check Availability</button>
              <a className="btn btn--ghost" href={whatsappUrl} target="_blank" rel="noreferrer">
                Ask a Question
              </a>
            </div>
          </div>
        </section>

        {/* footer inside landing */}
        <footer className="footer">
          <div className="container footer__grid">
            <div className="footer__brand">
              <img src={logo} alt="Margie's logo" />
              <p>Stay comfortable. Live Lagos.</p>
            </div>
            <div>
              <h5>Explore</h5>
              <ul>
                <li><a onClick={() => goToSection("rooms")}>Rooms</a></li>
                <li><a onClick={() => goToSection("amenities")}>Amenities</a></li>
                <li><Link to="/gallery" onClick={() => setMobileOpen(false)}>Gallery</Link></li>
                <li><button className="btn-link-like" onClick={() => goToSection("check")}>Book Now</button></li>
              </ul>
            </div>
            <div>
              <h5>Contact</h5>
              <ul>
                <li><a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a></li>
                <li><a href={mapsUrl} target="_blank" rel="noreferrer">Google Maps</a></li>
                <li><a href="/Privacy_Policy_Margies.pdf" download>Privacy Policy</a></li>
                <li><a href="/Terms_Conditions_Margies.pdf" download>Terms &amp; Conditions</a></li>
              </ul>
            </div>
          </div>
          <p className="footer__copy">© {new Date().getFullYear()} Margie’s. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  /* -------------------------
     App JSX (routes + header)
     ------------------------- */
  return (
    <div className="App">
      {/* Top-level header used when not on landing? We include a compact header here
          but the LandingContent also has its own header for the full landing look.
          To avoid double headers, our landing route renders LandingContent which
          contains its own header. For other pages we show this header.
       */}
      <header className="header top-header">
        <div className="brand-container" onClick={() => navigate("/")}>
          <img src={logo} alt="margies logo" className="logo" />
        </div>
        <nav>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><button onClick={() => toggleTheme()} className="theme-toggle-button" aria-label="Toggle theme">
              {theme === "light" ? <FaMoon /> : <FaSun />}
            </button></li>

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
        <Route
          path="/"
          element={
            <>
              {/* Landing (full) */}
              <LandingContent currentUserProp={currentUser} />

              {/* Under-landing media strip */}
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

              {/* Check availability is on the same home page as a section */}
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

              {/* Contact (already inside LandingContent, but keep global contact form functioning) */}
            </>
          }
        />

        {/* other routes */}
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/my-bookings" element={currentUser ? <MyBookings /> : <Navigate to="/" replace />} />
      </Routes>

      {/* floating actions (global) */}
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
    </div>
  );
}