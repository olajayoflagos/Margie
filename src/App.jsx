import { useState, useEffect, useRef } from "react"; // Added useEffect and useRef
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom"; // Added useLocation, useNavigate

import { FaWhatsapp, FaMapMarkerAlt, FaArrowUp, FaSun, FaMoon } from "react-icons/fa"; // Added FaArrowUp, FaSun, FaMoon

// Make sure these Firestore imports are present
import { collection, addDoc, Timestamp } from 'firebase/firestore';
// And ensure your db is imported, matching how you export it from firebase.js
// Assuming './firebase' is the correct path to your Firebase initialization file
import { db } from './firebase';


import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";
import CheckAvailability from "./CheckAvailability";
import Gallery from "./Gallery";
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Import carousel styles
import logo from "./assets/margies logo.jpg";
// Import your image assets
import Aadiamond1 from "./assets/Aadiamond1.jpg";
import Aaemerald1 from "./assets/Aaemerald1.jpg";
import Aapartment3 from "./assets/Aapartment3.jpg";
import Aapartment5 from "./assets/Aapartment5.jpg";
import Arbronzite1 from "./assets/Arbronzite1.jpg";
import Aronyx3 from "./assets/Aronyx3.jpg";
import "./App.css";


// Function to handle smooth scrolling for internal links
// This function will be called by the navigation links and logo
const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (element) {
    // Use scrollIntoView with smooth behavior
    element.scrollIntoView({ behavior: 'smooth' });
  }
};


function App() {
  // --- State Variables ---
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState(null); // Changed to null initially for no message
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false); // State for scroll-to-top button visibility
  const [activeSection, setActiveSection] = useState('home'); // State for active navigation link highlighting

   // Theme state: initialize from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light'; // 'light' or 'dark'
  });

  // --- React Router Hooks ---
  // Get current route location to help with nav highlighting
  const location = useLocation();
  // Get navigate function for programmatic navigation (e.g., from carousel click)
  const navigate = useNavigate();

  // --- Handlers ---

  // Carousel click handler - defined inside App to use navigate
  const handleCarouselClick = (index, item) => {
      console.log("Carousel image clicked:", index, item.props.alt);
      // Navigate to the gallery page
      navigate('/gallery');
  };

  // Contact form submission handler
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

    // Clear status message after a few seconds (regardless of success or failure)
    setTimeout(() => {
      setContactStatus(null); // Set back to null to hide the message
    }, 5000); // Clear after 5 seconds (adjust as needed)
  };

  // Admin login handler (simple state update)
  const handleLogin = () => {
    setIsLoggedIn(true);
    setIsAdmin(true); // Assuming isAdmin is true when logged in to admin
  };

  // Admin logout handler (simple state update)
  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false); // Assuming isAdmin is false when logged out
  };

  // Scroll to top function for the scroll-to-top button
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Smooth scrolling behavior
    });
  };

// End of Part 1
// App.jsx - Part 2

  // --- Data Definitions ---

   // Carousel items data - add an identifier for linking later if needed
  const carouselItems = [
    { src: Aapartment3, alt: "Main Apartment", caption: "Main Apartment", roomKey: "Aapartment3" },
    { src: Aapartment5, alt: "Main Apartment 2", caption: "Main Apartment 2", roomKey: "Aapartment5" },
    { src: Aadiamond1, alt: "Diamond Room", caption: "Diamond Room", roomKey: "Aadiamond1" },
    { src: Aaemerald1, alt: "Emerald Room", caption: "Emerald Room", roomKey: "Aaemerald1" },
    { src: Arbronzite1, alt: "Bronzite Room", caption: "Bronzite Room", roomKey: "Arbronzite1" },
    { src: Aronyx3, alt: "Onyx Room", caption: "Onyx Room", roomKey: "Aronyx3" },
  ];

  // URLs for floating icons
  const whatsappUrl = 'https://wa.me/+2348035350455?text=I will like to get information about Margies.';
  const mapsUrl = 'https://maps.app.goo.gl/Qb78GZHA61tEyM7XA?g_st=com.google.maps.preview.copy';


  // --- Theme Toggle Function ---
  // Function to toggle between light and dark themes
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

      // Determine active navigation link based on scroll position
      // Loop through sections in reverse order to prioritize sections lower on the page
      for (let i = sections.length - 1; i >= 0; i--) {
          const sectionId = sections[i];
          const sectionElement = document.getElementById(sectionId);
          if (sectionElement) {
              // Get the top position of the section relative to the top of the *document*
              const sectionTop = sectionElement.getBoundingClientRect().top + window.scrollY;
              // Calculate the activation point. The section is considered active when its top
              // is within a certain range from the top of the viewport, typically below the fixed header.
              // Add a small buffer (e.g., 100-150px) below the header height to give some room
              const activationOffset = headerHeight() + 100; // Adjust buffer as needed

              // Check if the current scroll position is at or past the section's activation point
              if (scrollY >= sectionTop - activationOffset) {
                  currentActive = sectionId;
                  // Once a section is found that meets the criteria, we set it as active and stop checking
                  // lower sections to prevent multiple links from being active or lower sections incorrectly
                  // overriding higher ones when both are partially in view.
                  break;
              }
          }
      }

      // Update active section state only if it changes to avoid unnecessary re-renders
      // Only update if the determined section is one of the tracked ones
      if (sections.includes(currentActive) && activeSection !== currentActive) {
         setActiveSection(currentActive);
      }
      // Optional: Handle case near the very top if 'home' wasn't caught
      // if (scrollY < 50 && activeSection !== 'home') {
      //     setActiveSection('home');
      // }

      // --- Scroll to Top Button Logic ---
      // Show/hide scroll-to-top button based on scroll position
      // Using 300px as the threshold, adjust as needed
      if (scrollY > 300) {
        setShowScrollTopButton(true);
      } else {
        setShowScrollTopButton(false);
      }
    };


    // Add the scroll event listener when on the root path
    window.addEventListener('scroll', handleScroll);

    // Initial check on mount to set the correct active section and button visibility
    // Use a small delay to ensure all section elements are rendered and measured correctly
    const timeoutId = setTimeout(handleScroll, 100);


    // Clean up the event listener and timeout when the component unmounts or route changes away from '/'
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };

  }, [location.pathname, activeSection]); // Re-run this effect if route changes or activeSection changes


  // --- Helper function to get the class name for navigation links ---
  // This determines which link gets the 'active' class based on current route and scroll position
  const getNavLinkClass = (sectionId) => {
    // Only apply 'active' class if we are on the root path ("/")
    // AND the section ID matches the currently determined activeSection state
    if (location.pathname === '/') {
        return activeSection === sectionId ? 'active' : '';
    } else if (location.pathname === '/gallery' && sectionId === 'gallery') {
        // Handle the Gallery link specifically: it's active only when on the /gallery route
        // (This assumes you add an identifier like 'gallery' to the Gallery Link element)
        // In your current JSX, the Gallery Link is handled directly by checking location.pathname
        // So this specific check might not be needed here, but is kept for illustration.
         return ''; // Or 'active' if you were passing 'gallery' to this function for the Link
    }
    return ''; // Default case: no active class
  };

// End of Part 2
// App.jsx - Part 3

  // --- Rendered JSX ---
  return (
    // The main App container. Consider adding the theme class here instead of body if preferred,
    // but applying to body is standard for global theme changes.
    <div className="App">
      {/* --- Header --- */}
      <header className="header">
        <div className="brand-container">
          {/* Make logo clickable to scroll to home */}
          {/* Use a div with onClick for smooth scrolling to the section */}
          {/* Add ARIA attributes for accessibility */}
          <div className="logo-container" onClick={() => scrollToSection('home')} role="button" aria-label="Scroll to home section" tabIndex="0">
              <img src={logo} alt="margies logo" className="logo" />
          </div>
        </div>
        <nav>
          <ul className="nav-links">
            {/* Navigation Links */}
            {/* Use anchor tags with onClick to trigger smooth scroll */}
            {/* Conditionally add the 'active' class using the helper function */}
            <li><a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }} className={getNavLinkClass('home')}>Home</a></li>
            <li><a href="#check" onClick={(e) => { e.preventDefault(); scrollToSection('check'); }} className={getNavLinkClass('check')}>Book Now</a></li>
            <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }} className={getNavLinkClass('about')}>About</a></li>
            <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }} className={getNavLinkClass('contact')}>Contact Us</a></li>

            {/* Gallery Link - Use Link component for navigation to a different route */}
            {/* Add 'active' class to the Gallery link only when on the /gallery route */}
             <li>
                <Link to="/gallery" className={location.pathname === '/gallery' ? 'active' : ''}>Gallery</Link>
             </li>

            {/* Theme Toggle Button */}
            {/* Use a button for clickability, and FaSun/FaMoon icons */}
            <li>
                <button onClick={toggleTheme} className="theme-toggle-button" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
                    {/* Show Moon icon in light mode, Sun in dark mode */}
                    {theme === 'light' ? <FaMoon /> : <FaSun />}
                </button>
            </li>

            {/* Admin Login/Logout buttons */}
            {/* Conditionally render based on isAdmin and isLoggedIn state */}
            {/* Show Admin Login button if not in admin mode AND not logged in */}
            {!isAdmin && !isLoggedIn && (
              <li><button onClick={() => setIsAdmin(true)} className="admin-button-link">Admin Login</button></li>
            )}
             {/* Show Logout button if in admin mode AND logged in */}
             {isAdmin && isLoggedIn && (
              <li><button onClick={handleLogout} className="admin-button-link">Logout</button></li>
            )}
            {/* Note: This setup assumes isAdmin state is true only when attempting login or viewing admin dashboard.
                 You might need to refine the logic for isAdmin based on actual authentication status or roles. */}
          </ul>
        </nav>
      </header>

      {/* --- Main Content & Routes --- */}
      {/* Define routes using react-router-dom's Routes component */}
      <Routes>
        {/* The main route ("/") conditional rendering for admin vs public view */}
        <Route path="/" element={
          isAdmin ? (
            // If isAdmin is true, render Admin components
            isLoggedIn ? <AdminDashboard /> : <AdminLogin onLogin={handleLogin} />
          ) : (
            // If isAdmin is false, render the public facing sections
            <main> {/* Main content container for the public view */}

            {/* Home Section with Carousel */}
            {/* Add id="home" for smooth scrolling target and section highlighting */}
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
            </section> {/* <-- End of the Home section */}

            {/* Check Availability Section */}
            {/* Add id="check" for smooth scrolling target and section highlighting */}
            <section id="check" className="section">
              <h2>Check Room Availability</h2>
              {/* Render the CheckAvailability component */}
              {/* NOTE: If CheckAvailability contains Paystack logic, it will be untouched */}
              <CheckAvailability />
            </section> {/* <-- End of the Check Availability section */}

            {/* About Section */}
             {/* Add id="about" for smooth scrolling target and section highlighting */}
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
            </section> {/* <-- End of the About section */}

            {/* Contact Section */}
            {/* Add id="contact" for smooth scrolling target and section highlighting */}
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
              {/* Display status message with dynamic class */}
              {/* contactStatus is an object { message: '...', type: '...' } or null */}
              {contactStatus && (
                <p className={`contact-status ${contactStatus.type}`}>
                  {contactStatus.message}
                </p>
              )}
            </section> {/* <-- End of the Contact section */}

            {/* Floating Icons */}
            {/* Add ARIA labels for accessibility */}
            {/* Ensure these links are correct and use the defined URLs */}
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
      } /> {/* <-- End of the <Route path="/"> element */}

      {/* Route for the Gallery page */}
      {/* This route renders the Gallery component when the path is "/gallery" */}
      <Route path="/gallery" element={<Gallery />} /> {/* <-- The Gallery Route */}

    </Routes> {/* <-- End of Routes component */}

    {/* --- Footer --- */}
    <footer className="footer">
      <p>&copy; 2025 Margie's. All rights reserved.</p>
      {/* Footer links */}
      {/* Ensure paths and attributes are correct */}
      <a href="/Privacy_Policy_Margies.pdf" download>Privacy Policy</a> |
      <a href="/Terms_Conditions_Margies.pdf" download>Terms & Conditions</a>
    </footer> {/* <-- End of footer */}

  </div>

); 
} 

export default App;
