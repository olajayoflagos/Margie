// App.jsx
import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
  Navigate
} from "react-router-dom";
import { FaWhatsapp, FaMapMarkerAlt, FaArrowUp, FaSun, FaMoon } from "react-icons/fa";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { db } from "./firebase";

import Login from "./Login";
import Signup from "./Signup";
import ResetPassword from "./ResetPassword";
import MyBookings from "./MyBookings";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";
import CheckAvailability from "./CheckAvailability";
import Gallery from "./Gallery";

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

const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

function App() {
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => setCurrentUser(user));
  }, []);

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState(null);

  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "light";
  });

  const location = useLocation();
  const navigate = useNavigate();

  const handleCarouselClick = (index, item) => {
    console.log("Carousel image clicked:", index, item.props.alt);
    navigate("/gallery");
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
      setContactStatus({ message: "Error sending message. Try again.", type: "error" });
      console.error("Error sending contact message:", err);
    }

    setTimeout(() => setContactStatus(null), 5000);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/", { replace: true });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const carouselItems = [
    { src: Aapartment3, alt: "Main Apartment", caption: "Main Apartment" },
    { src: Aapartment5, alt: "Main Apartment 2", caption: "Main Apartment 2" },
    { src: Aadiamond1, alt: "Diamond Room", caption: "Diamond Room" },
    { src: Aaemerald1, alt: "Emerald Room", caption: "Emerald Room" },
    { src: Arbronzite1, alt: "Bronzite Room", caption: "Bronzite Room" },
    { src: Aronyx3, alt: "Onyx Room", caption: "Onyx Room" },
  ];

  const whatsappUrl =
    "https://wa.me/+2348035350455?text=I will like to get information about Margies.";
  const mapsUrl =
    "https://maps.app.goo.gl/Qb78GZHA61tEyM7XA?g_st=com.google.maps.preview.copy";

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    document.body.classList.remove("light-mode", "dark-mode");
    document.body.classList.add(theme + "-mode");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (location.pathname !== "/") {
      setShowScrollTopButton(false);
      return;
    }

    const headerHeight = () => {
      const header = document.querySelector(".header");
      return header ? header.clientHeight : 0;
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const sections = ["home", "check", "about", "contact"];
      let currentActive = "home";

      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionId = sections[i];
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
          const sectionTop =
            sectionElement.getBoundingClientRect().top + window.scrollY;
          const activationOffset = headerHeight() + 100;
          if (scrollY >= sectionTop - activationOffset) {
            currentActive = sectionId;
            break;
          }
        }
      }

      if (sections.includes(currentActive) && activeSection !== currentActive) {
        setActiveSection(currentActive);
      }

      setShowScrollTopButton(scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    const timeoutId = setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, [location.pathname, activeSection]);

  const getNavLinkClass = (sectionId) => {
    if (location.pathname === "/") {
      return activeSection === sectionId ? "active" : "";
    } else if (location.pathname === "/gallery" && sectionId === "gallery") {
      return "active";
    }
    return "";
  };

  return (
    <div className="App">
      {/* --- Header --- */}
      <header className="header">
        <div className="brand-container">
          <div
            className="logo-container"
            onClick={() => scrollToSection("home")}
            role="button"
            aria-label="Scroll to home section"
            tabIndex="0"
          >
            <img src={logo} alt="margies logo" className="logo" />
          </div>
        </div>
        <nav>
          <ul className="nav-links">
            <li>
              <Link to="/" onClick={() => scrollToSection("home")}>
                Home
              </Link>
            </li>
            <li>
              <a
                href="#check"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("check");
                }}
                className={getNavLinkClass("check")}
              >
                Book Now
              </a>
            </li>
            <li>
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("about");
                }}
                className={getNavLinkClass("about")}
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("contact");
                }}
                className={getNavLinkClass("contact")}
              >
                Contact Us
              </a>
            </li>
            <li>
              <Link
                to="/gallery"
                className={location.pathname === "/gallery" ? "active" : ""}
              >
                Gallery
              </Link>
            </li>
            <li>
              <button
                onClick={toggleTheme}
                className="theme-toggle-button"
                aria-label={`Switch to ${
                  theme === "light" ? "dark" : "light"
                } mode`}
              >
                {theme === "light" ? <FaMoon /> : <FaSun />}
              </button>
            </li>
            {!currentUser && (
              <>
                <li>
                  <Link to="/login">Log In</Link>
                </li>
                <li>
                  <Link to="/signup">Sign Up</Link>
                </li>
              </>
            )}
            {currentUser &&
              currentUser.uid !== "aI2M8Jt2TrSav72XthNdvTHnHzD3" && (
                <>
                  <li>
                    <Link to="/my-bookings">My Bookings</Link>
                  </li>
                  <li>
                    <button onClick={handleLogout}>Logout</button>
                  </li>
                  <li className="nav-welcome">Hello, {currentUser.email}</li>
                </>
              )}
            {currentUser &&
              currentUser.uid === "aI2M8Jt2TrSav72XthNdvTHnHzD3" && (
                <li>
                  <button onClick={handleLogout}>Admin Logout</button>
                </li>
              )}
          </ul>
        </nav>
      </header>

      {/* --- Routes --- */}
      <Routes>
        <Route
          path="/"
          element={
            currentUser?.uid === "aI2M8Jt2TrSav72XthNdvTHnHzD3" ? (
              <AdminDashboard />
            ) : (
              <main>
                {/* Home Section */}
                <section id="home" className="section no-padding-top">
                  <Carousel
                    autoPlay
                    infiniteLoop
                    showThumbs={false}
                    showStatus={false}
                    interval={4000}
                    onClickItem={handleCarouselClick}
                  >
                    {carouselItems.map((item, index) => (
                      <div key={index} className="carousel-slide">
                        <img src={item.src} alt={item.alt} className="carouselmedia" />
                        <p className="legend">{item.caption}</p>
                      </div>
                    ))}
                  </Carousel>
                </section>

                {/* Booking Section */}
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

                {/* About Section */}
                <section id="about" className="section">
                  <h2>Discover Margies</h2>
                  <p>
                    Nestled in the vibrant heart of Lagos Mainland at{" "}
                    <strong>43, Oguntona Crescent, Gbagada Phase 1</strong>,
                    Margies is more than just accommodation - it's a cultural
                    experience...
                  </p>
                </section>

                {/* Contact Section */}
                <section id="contact" className="section">
                  <h2>Contact Us</h2>
                  <form className="contact-form" onSubmit={handleSubmitContact}>
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required
                    />
                    <textarea
                      name="message"
                      placeholder="Your Message"
                      rows="5"
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      required
                    />
                    <button type="submit">Send Message</button>
                  </form>
                  {contactStatus && (
                    <p className={`contact-status ${contactStatus.type}`}>
                      {contactStatus.message}
                    </p>
                  )}
                </section>

                {/* Floating Icons */}
                <a
                  href={mapsUrl}
                  className="map-float"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View location on Google Maps"
                >
                  <FaMapMarkerAlt className="map-icon" />
                </a>
                <a
                  href={whatsappUrl}
                  className="whatsapp-float"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat with us on WhatsApp"
                >
                  <FaWhatsapp className="whatsapp-icon" />
                </a>
                {showScrollTopButton && (
                  <button
                    onClick={scrollToTop}
                    className="scroll-top-button"
                    aria-label="Scroll to top"
                  >
                    <FaArrowUp />
                  </button>
                )}
              </main>
            )
          }
        />

        {/* Extra Routes */}
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/my-bookings"
          element={currentUser ? <MyBookings /> : <Navigate to="/" replace />}
        />

        {/* Admin Route */}
        <Route
          path="/admin"
          element={
            currentUser?.uid === "aI2M8Jt2TrSav72XthNdvTHnHzD3" ? (
              <AdminDashboard />
            ) : (
              <AdminLogin />
            )
          }
        />
      </Routes>

      {/* --- Footer --- */}
      <footer className="footer">
        <p>&copy; 2025 Margie's. All rights reserved.</p>
        <a href="/Privacy_Policy_Margies.pdf" download>
          Privacy Policy
        </a>{" "}
        |{" "}
        <a href="/Terms_Conditions_Margies.pdf" download>
          Terms & Conditions
        </a>
      </footer>
    </div>
  );
}

export default App;
