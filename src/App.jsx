import { useState, useEffect, useRef } from "react"; // Added useEffect and useRef
import {  Routes, Route, Link, useLocation, useNavigate, Navigate } from "react-router-dom"; // Added useLocation, useNavigate
import { FaWhatsapp, FaMapMarkerAlt, FaArrowUp, FaSun, FaMoon } from "react-icons/fa"; // Added FaArrowUp, FaSun, FaMoon
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from './firebase';
import Login from "./Login";
import Signup from "./Signup";
import ResetPassword from "./ResetPassword";
import MyBookings from "./MyBookings";
import { signOut } from "firebase/auth"; // at top
import { createBookingRequest, fetchUserBookings } from "./bookingService";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";
import CheckAvailability from "./CheckAvailability";
import Gallery from "./Gallery";
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Import carousel styles
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
    // Use scrollIntoView with smooth behavior
    element.scrollIntoView({ behavior: 'smooth' });
  }
};


function App() {
  // --- State Variables ---
  const auth = getAuth();
const [currentUser, setCurrentUser] = useState(null);
useEffect(() => {
  onAuthStateChanged(auth, user => setCurrentUser(user));
}, []);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState(null); // Changed to null initially for no message
  const [showScrollTopButton, setShowScrollTopButton] = useState(false); // State for scroll-to-top button visibility
  const [activeSection, setActiveSection] = useState('home'); // State for active navigation link highlighting
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light'; // 'light' or 'dark'
  });
  const location = useLocation();
  const navigate = useNavigate();
  const handleCarouselClick = (index, item) => {
      console.log("Carousel image clicked:", index, item.props.alt);
      // Navigate to the gallery page
      navigate('/gallery');
  };
  const handleSubmitContact = async (e) => {
    e.preventDefault();
    // Set status with loading text and type
    setContactStatus({ message: "Sending message...", type: 'info' });

    try {
      // Ensure db, collection, addDoc, and Timestamp are imported and correctly initialized
      await addDoc(collection(db, "messages"), {
        name: contactName,
        email: contactEmail,
        message: contactMessage,
        created: Timestamp.now()
      });
      // Set status for success
      setContactStatus({ message: "Message sent successfully!", type: 'success' });
      // Clear form fields on success
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (err) {
       // Set status for error
       setContactStatus({ message: "Error sending message. Please try again.", type: 'error' });
       console.error("Error sending contact message to Firebase:", err); // Log the specific Firebase error
      }

    setTimeout(() => {
      setContactStatus(null); // Set back to null to hide the message
    }, 5000); // Clear after 5 seconds (adjust as needed)
  };


  const handleLogout = async () => {
    await signOut(auth);
    navigate("/", { replace: true });    // ← send them home
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Smooth scrolling behavior
    });
  };

  const carouselItems = [
    { src: Aapartment3, alt: "Main Apartment", caption: "Main Apartment", roomKey: "Aapartment3" },
    { src: Aapartment5, alt: "Main Apartment 2", caption: "Main Apartment 2", roomKey: "Aapartment5" },
    { src: Aadiamond1, alt: "Diamond Room", caption: "Diamond Room", roomKey: "Aadiamond1" },
    { src: Aaemerald1, alt: "Emerald Room", caption: "Emerald Room", roomKey: "Aaemerald1" },
    { src: Arbronzite1, alt: "Bronzite Room", caption: "Bronzite Room", roomKey: "Arbronzite1" },
    { src: Aronyx3, alt: "Onyx Room", caption: "Onyx Room", roomKey: "Aronyx3" },
  ];

  const whatsappUrl = 'https://wa.me/+2348035350455?text=I will like to get information about Margies.';
  const mapsUrl = 'https://maps.app.goo.gl/Qb78GZHA61tEyM7XA?g_st=com.google.maps.preview.copy';

  const toggleTheme = () => {
    // Update the theme state
    setTheme(currentTheme => (currentTheme === 'light' ? 'dark' : 'light'));
  };
 
  useEffect(() => {
   
    document.body.classList.remove('light-mode', 'dark-mode'); // Remove both first
    document.body.classList.add(theme + '-mode'); // Add the current theme class

   
    localStorage.setItem('theme', theme);

  }, [theme]); // This effect depends solely on the 'theme' state

  useEffect(() => {
   
    if (location.pathname !== '/') {
       
        setShowScrollTopButton(false); // Hide scroll-to-top button on other routes
        return; // Exit the effect early if not on the root path
    }

    // Helper to get header height for scroll offset
    const headerHeight = () => {
        const header = document.querySelector('.header');
        // Use clientHeight which includes padding but not borders or margins
        return header ? header.clientHeight : 0;
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      // List all section IDs you want to track for highlighting
      const sections = ['home', 'check', 'about', 'contact'];
      // Default active section, usually 'home' when near the top
      let currentActive = 'home';

      for (let i = sections.length - 1; i >= 0; i--) {
          const sectionId = sections[i];
          const sectionElement = document.getElementById(sectionId);
          if (sectionElement) {
              // Get the top position of the section relative to the top of the *document*
              const sectionTop = sectionElement.getBoundingClientRect().top + window.scrollY;
              const activationOffset = headerHeight() + 100; // Adjust buffer as needed
              if (scrollY >= sectionTop - activationOffset) {
                  currentActive = sectionId;
                  break;
              }
          }
      }

      if (sections.includes(currentActive) && activeSection !== currentActive) {
         setActiveSection(currentActive);
      }

      if (scrollY > 300) {
        setShowScrollTopButton(true);
      } else {
        setShowScrollTopButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    const timeoutId = setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };

  }, [location.pathname, activeSection]); // Re-run this effect if route changes or activeSection changes

  const getNavLinkClass = (sectionId) => {
    if (location.pathname === '/') {
        return activeSection === sectionId ? 'active' : '';
    } else if (location.pathname === '/gallery' && sectionId === 'gallery') {
         return ''; // Or 'active' if you were passing 'gallery' to this function for the Link
    }
    return ''; // Default case: no active class
  };

  return (
    <div className="App">
      {/* --- Header --- */}
      <header className="header">
        <div className="brand-container">
          <div className="logo-container" onClick={() => scrollToSection('home')} role="button" aria-label="Scroll to home section" tabIndex="0">
              <img src={logo} alt="margies logo" className="logo" />
          </div>
        </div>
        <nav>
          <ul className="nav-links">
            <li>
  <Link to="/" onClick={e => {
    e.preventDefault();
    navigate('/');
    // if you’re already on “/” this will kick you to the top:
    scrollToSection('home');
  }}>
    Home
  </Link>
</li>

            <li><a href="#check" onClick={(e) => { e.preventDefault(); scrollToSection('check'); }} className={getNavLinkClass('check')}>Book Now</a></li>
            <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }} className={getNavLinkClass('about')}>About</a></li>
            <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }} className={getNavLinkClass('contact')}>Contact Us</a></li>
             <li>
                <Link to="/gallery" className={location.pathname === '/gallery' ? 'active' : ''}>Gallery</Link>
             </li>
            <li>
                <button onClick={toggleTheme} className="theme-toggle-button" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
                    {/* Show Moon icon in light mode, Sun in dark mode */}
                    {theme === 'light' ? <FaMoon /> : <FaSun />}
                </button>
            </li>
         {/* START: user-aware nav links */}
 {!currentUser && ( 
   <> <li><Link to="/login">Log In</Link></li>
       <li><Link to="/signup">Sign Up</Link></li>
   </>
 )}
 {currentUser && currentUser.uid !== "aI2M8Jt2TrSav72XthNdvTHnHzD3" && (
   <> <li><Link to="/my-bookings">My Bookings</Link></li>
       <li><button onClick={handleLogout}>Logout</button></li>
       <li className="nav-welcome">Hello, {currentUser.email}</li>
   </>
 )}
 {currentUser && currentUser.uid === "aI2M8Jt2TrSav72XthNdvTHnHzD3" && (
   <li><button onClick={handleLogout}>Admin Logout</button></li>
 )}
          </ul>
        </nav>
      </header>
      <Routes>
<Route path="/" element={
  currentUser?.uid === "aI2M8Jt2TrSav72XthNdvTHnHzD3"
    ? <AdminDashboard />
    : currentUser?.uid === "aI2M8Jt2TrSav72XthNdvTHnHzD3"
      ? <AdminLogin />
    : (
      
          <main>
            <section id="home" className="section no-padding-top"> {/* Added no-padding-top class for the carousel if needed in CSS */}
              <Carousel
                autoPlay
                infiniteLoop
                showThumbs={false}
                showStatus={false}
                interval={4000} // Auto-play interval in milliseconds
                onClickItem={handleCarouselClick} // Make items clickable (handler navigates to Gallery)
              >
                {/* Map over carouselItems data to render slides */}
                {carouselItems.map((item, index) => (
                  <div key={index} className="carousel-slide">
                    {/* Use the imported image source */}
                    <img src={item.src} alt={item.alt} className="carouselmedia" />
                    {/* Display the caption as legend */}
                    <p className="legend">{item.caption}</p>
                  </div>
                ))}
              </Carousel>
            </section> 
            <section id="check" className="section">
              <h2>Check Room Availability</h2>
{ currentUser
  ? <CheckAvailability />
  : (
    <div className="booking-lock">
      <p>Please <Link to="/login">log in</Link> or <Link to="/signup">sign up</Link> to book.</p>
    </div>
  )
}
            </section> 
  <section id="about" className="section">
    <h2>Discover Margies</h2>
    {/* Your existing About Us content */}
              <p>
                Nestled in the vibrant heart of Lagos Mainland at <strong>43, Oguntona Crescent, Gbagada Phase 1</strong>,
                Margies is more than just accommodation - it's a cultural experience. Perched above a bustling indigenous
                restaurant and opposite a well-stocked supermarket, our location pulses with the authentic rhythm of Lagos life.
              </p>

              <p>
                By day, explore our neighborhood's rich tapestry of commerce and culture. By night, step right into Gbagada's
                legendary nightlife, with our building standing just moments away from the sizzling Suya grill spot where
                Lagosians from all walks of life converge under the stars.
              </p>
              <p>
                Whether you're here for business or pleasure, Margies offers the perfect blend of convenience and local flavor.
                Need anything? Reach us at <strong>+234 803 535 0455</strong>, use our <strong>Contact Us</strong> form,
                or tap the WhatsApp icon for instant assistance. We're not just your hosts - we're your gateway to authentic
                Lagos living.
              </p>

              <p>
                At Margies, you don't visit Lagos - you <em>live</em> it. Wake up to the aroma of local delicacies wafting
                from below, stroll to the supermarket across the street for essentials, and end your day sharing stories over
                Suya with fellow guests and locals alike. This isn't just a stay - it's your Lagos story waiting to happen.
              </p>
            </section> 
            <section id="contact" className="section">
              <h2>Contact Us</h2>
              {/* Contact Form */}
              <form className="contact-form" onSubmit={handleSubmitContact}>
                <input type="text" name="name" placeholder="Full Name"
                  value={contactName} onChange={(e) => setContactName(e.target.value)} required />
                <input type="email" name="email" placeholder="Email Address"
                  value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
                <textarea name="message" placeholder="Your Message" rows="5"
                  value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} required />
                <button type="submit">Send Message</button>
              </form>
              {contactStatus && (
                <p className={`contact-status ${contactStatus.type}`}>
                  {contactStatus.message}
                </p>
              )}
            </section> 
            <a href={mapsUrl} className="map-float" target="_blank" rel="noopener noreferrer" aria-label="View location on Google Maps">
              <FaMapMarkerAlt className="map-icon" />
            </a>
            <a href={whatsappUrl} className="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">
              <FaWhatsapp className="whatsapp-icon" />
            </a>

             {showScrollTopButton && (
                <button onClick={scrollToTop} className="scroll-top-button" aria-label="Scroll to top">
                   <FaArrowUp /> {/* Use the arrow icon imported from react-icons/fa */}
                </button>
             )}

          </main> 
              )
            } 
      /> 
      <Route path="/gallery" element={<Gallery />} /> {/* <-- The Gallery Route */}

      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/signup" element={<Signup />} />
      <Route
  path="/my-bookings"
  element={
    currentUser
      ? <MyBookings />
      : <Navigate to="/" replace />
  }
/>


    </Routes>
    {/* --- Footer --- */}
    <footer className="footer">
      <p>&copy; 2025 Margie's. All rights reserved.</p>
      <a href="/Privacy_Policy_Margies.pdf" download>Privacy Policy</a> |
      <a href="/Terms_Conditions_Margies.pdf" download>Terms & Conditions</a>
    </footer> {/* <-- End of footer */}

  </div>

); 
} 

export default App;
