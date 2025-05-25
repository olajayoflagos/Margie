import { useState, useEffect, useRef } from "react"; // Added useEffect and useRef
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom"; // Added useLocation, useNavigate

import { FaWhatsapp, FaMapMarkerAlt, FaArrowUp, FaSun, FaMoon } from "react-icons/fa"; // Added FaArrowUp, FaSun, FaMoon

// Make sure these Firestore imports are present
import { collection, addDoc, Timestamp } from 'firebase/firestore';
// And ensure your db is imported, matching how you export it from firebase.js
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

// Keep the handleCarouselClick but remove the alert for smoother interaction
const handleCarouselClick = (index, item) => {
  console.log("Carousel image clicked:", index, item.props.alt);
  // Removed the alert. User can click the Gallery link in the nav to see more.
  // You could potentially add more sophisticated logic here later, like showing a modal
  // with a larger image or linking to a specific room gallery page if you create one.
};

// Function to handle smooth scrolling for internal links
// This function will be called by the navigation links
const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (element) {
    // Use scrollIntoView with smooth behavior
    element.scrollIntoView({ behavior: 'smooth' });
  }
};


function App() {
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

  // Get current route location to help with nav highlighting
  const location = useLocation();
  const navigate = useNavigate(); 
  // Carousel click handler - defined inside App to use navigate
  const handleCarouselClick = (index, item) => {
      console.log("Carousel image clicked:", index, item.props.alt);
      // Navigate to the gallery page
      navigate('/gallery');
  };


   // Carousel items - add an identifier for linking later
  const carouselItems = [
    { src: Aapartment3, alt: "Main Apartment", caption: "Main Apartment", roomKey: "Aapartment3" },
    { src: Aapartment5, alt: "Main Apartment 2", caption: "Main Apartment 2", roomKey: "Aapartment5" },
    { src: Aadiamond1, alt: "Diamond Room", caption: "Diamond Room", roomKey: "Aadiamond1" },
    { src: Aaemerald1, alt: "Emerald Room", caption: "Emerald Room", roomKey: "Aaemerald1" },
    { src: Arbronzite1, alt: "Bronzite Room", caption: "Bronzite Room", roomKey: "Arbronzite1" },
    { src: Aronyx3, alt: "Onyx Room", caption: "Onyx Room", roomKey: "Aronyx3" },
  ];

  const handleSubmitContact = async (e) => {
    e.preventDefault();
    setContactStatus({ message: "Sending message...", type: 'info' });

    try {
      // Ensure db, collection, addDoc, and Timestamp are imported
      await addDoc(collection(db, "messages"), {
        name: contactName,
        email: contactEmail,
        message: contactMessage,
        created: Timestamp.now()
      });
      setContactStatus({ message: "Message sent successfully!", type: 'success' });
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (err) {
      setContactStatus({ message: "Error sending message. Please try again.", type: 'error' });
      console.error("Error sending contact message to Firebase:", err); // Log the specific Firebase error
    }

    setTimeout(() => {
      setContactStatus(null);
    }, 5000);
  };


  const whatsappUrl = 'https://wa.me/+2348035350455?text=I will like to get information about Margies.';
  const mapsUrl = 'https://maps.app.goo.gl/Qb78GZHA61tEyM7XA?g_st=com.google.maps.preview.copy';

  // Effect to handle scroll events for scroll-to-top button and navigation highlighting
  useEffect(() => {
    // This effect should only run if we are on the root path ("/")
    if (location.pathname !== '/') {

      // Effect to apply theme class to the body and save to localStorage
useEffect(() => {
  // Apply the theme class to the body element
  document.body.className = theme + '-mode'; // This will add 'light-mode' or 'dark-mode' class to the body

  // Save the current theme preference to localStorage
  localStorage.setItem('theme', theme);

}, [theme]); // Re-run this effect whenever the 'theme' state changes


        setShowScrollTopButton(true);
        // Reset active section state when leaving the home page
        setActiveSection(null); // Or set to a value indicating no section is active
        return; // Exit the effect early
    }

    // Helper to get header height for scroll offset
    const headerHeight = () => {
        const header = document.querySelector('.header');
        // Use clientHeight which includes padding but not borders or margins
        return header ? header.clientHeight : 0;
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      // List all section IDs you want to track
      const sections = ['home', 'check', 'about', 'contact'];
      let currentActive = 'home'; // Default to home section when at the very top

      // Show/hide scroll-to-top button
      if (scrollY > 1) { // Show button after scrolling down 300px
        setShowScrollTopButton(true);
      } else {
        setShowScrollTopButton(false);
      }

      // Determine active navigation link based on scroll position
      // Loop through sections in reverse order to prioritize sections lower on the page
      // This ensures that if the viewport covers parts of multiple sections, the lowest one visible near the top is highlighted.
      for (let i = sections.length - 1; i >= 0; i--) {
          const sectionId = sections[i];
          const sectionElement = document.getElementById(sectionId);
          if (sectionElement) {
              // Get the top position of the section relative to the top of the *document*
              const sectionTop = sectionElement.getBoundingClientRect().top + window.scrollY;
              // Calculate the activation point. The section is considered active when its top
              // is within a certain range from the top of the viewport, typically below the fixed header.
              // Add a small buffer (e.g., 50px) below the header height.
              const activationOffset = headerHeight() + 50; // 50px buffer below header

              // Check if the current scroll position is at or past the section's activation point
              if (scrollY >= sectionTop - activationOffset) {
                  currentActive = sectionId;
                  break; // Found the section currently considered "active", stop checking
              }
          }
      }

      // Update state only if it changes to avoid unnecessary re-renders
      // Check that currentActive is one of the tracked sections before updating state
      if (sections.includes(currentActive) && activeSection !== currentActive) {
         setActiveSection(currentActive);
      } else if (!sections.includes(currentActive) && activeSection !== null && scrollY < 50) {
          // Handle case where scroll is near top and no section is technically "active" yet
           setActiveSection('home');
      }
    };


    // Add the scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Initial check on mount to set the correct active section and button visibility
    // Use a small delay to ensure all section elements are rendered and measured correctly
    const timeoutId = setTimeout(handleScroll, 100);


    // Clean up the event listener and timeout when the component unmounts or route changes
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [location.pathname, activeSection]); // Re-run effect if route changes or activeSection changes

  // Note: login/logout handlers are kept here as they are simple state updates

  // Function to toggle between light and dark themes
const toggleTheme = () => {
  setTheme(currentTheme => (currentTheme === 'light' ? 'dark' : 'light'));
};


  const handleLogin = () => {
    setIsLoggedIn(true);
    setIsAdmin(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Helper function to get the class name for navigation links
  const getNavLinkClass = (sectionId) => {
    // Only apply 'active' class if we are on the root path and the section ID matches the activeSection state
    // Also handle the Gallery link separately since it's a different route
    if (location.pathname === '/') {
        return activeSection === sectionId ? 'active' : '';
    } else if (location.pathname === '/gallery' && sectionId === 'gallery') {
        // This condition would apply if you had a 'gallery' section ID on the home page
        // Since Gallery is a separate route, we handle its highlighting in the JSX return below
        return '';
    }
    return ''; // Default case, no active class
  };

// End of Part 1a
// App.jsx - Part 1b

  return (

      <div className="App">
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
              {/* Use anchor tags with onClick to trigger smooth scroll */}
              {/* Conditionally add the 'active' class using the helper function */}
              <li><a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }} className={getNavLinkClass('home')}>Home</a></li>
              <li><a href="#check" onClick={(e) => { e.preventDefault(); scrollToSection('check'); }} className={getNavLinkClass('check')}>Book Now</a></li>
              <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }} className={getNavLinkClass('about')}>About</a></li>
              <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }} className={getNavLinkClass('contact')}>Contact Us</a></li>
              {/* Keep the Link component for navigating to a different route */}
              {/* Add 'active' class to the Gallery link only when on the /gallery route */}
               <li><Link to="/gallery" className={location.pathname === '/gallery' ? 'active' : ''}>Gallery</Link></li>

{/* Theme Toggle Button */}
     {/* Use a button for clickability, and FaSun/FaMoon icons */}
     <li>
         <button onClick={toggleTheme} className="theme-toggle-button" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
             {theme === 'light' ? <FaMoon /> : <FaSun />} {/* Show Moon icon in light mode, Sun in dark mode */}
         </button>
     </li>

              {/* Admin Login/Logout buttons */}
              {/* Conditionally render based on isAdmin and isLoggedIn state */}
              {!isAdmin && !isLoggedIn && ( // Only show Admin Login if not logged in as admin
                <li><button onClick={() => setIsAdmin(true)} className="admin-button-link">Admin Login</button></li>
              )}
               {isAdmin && isLoggedIn && ( // Only show Logout if logged in as admin
                <li><button onClick={handleLogout} className="admin-button-link">Logout</button></li>
              )}
              {/* Note: This setup assumes isAdmin state is true only when attempting login or viewing admin dashboard.
                   You might need to refine the logic for isAdmin based on actual authentication status. */}
            </ul>
          </nav>
        </header>

        {/* Define routes using react-router-dom's Routes component */}
        <Routes>
          {/* The main route ("/") conditional rendering for admin vs public view */}
          <Route path="/" element={
            isAdmin ? (
              isLoggedIn ? <AdminDashboard /> : <AdminLogin onLogin={handleLogin} />
            ) : (
              <main> {/* Main content for the public view */}
              {/* Home Section with Carousel */}
              {/* Add id="home" for smooth scrolling target and section highlighting */}
              <section id="home" className="section no-padding-top"> {/* Added no-padding-top class for the carousel if needed in CSS */}
              <Carousel
              autoPlay
              infiniteLoop
              showThumbs={false}
              showStatus={false}
              interval={4000} // Auto-play interval in milliseconds
              onClickItem={handleCarouselClick} // Make items clickable (handle function removes alert)
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

                {/* Check Availability Section */}
                {/* Add id="check" for smooth scrolling target and section highlighting */}
                <section id="check" className="section">
                  <h2>Check Room Availability</h2>
                  {/* Render the CheckAvailability component */}
                  <CheckAvailability />
                </section>

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
                </section>

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
                </section>

                {/* Floating Icons */}
                {/* Add ARIA labels for accessibility */}
                <a href={mapsUrl} className="map-float" target="_blank" rel="noopener noreferrer" aria-label="View location on Google Maps">
                  <FaMapMarkerAlt className="map-icon" />
                </a>
                <a href={whatsappUrl} className="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">
                  <FaWhatsapp className="whatsapp-icon" />
                </a>

                {/* Scroll to Top Button - Only visible when showScrollTopButton state is true */}
                 {showScrollTopButton && (
                    <button onClick={scrollToTop} className="scroll-top-button" aria-label="Scroll to top">
                       <FaArrowUp /> {/* Use the arrow icon */}
                    </button>
                 )}

              </main>
            )
          } />
          {/* Route for the Gallery page */}
          {/* This route renders the Gallery component when the path is "/gallery" */}
          <Route path="/gallery" element={<Gallery />} />
        </Routes>

        {/* Footer Section */}
        <footer className="footer">
          <p>&copy; 2025 Margie's. All rights reserved.</p>
          {/* Footer links */}
          <a href="/Privacy_Policy_Margies.pdf" download>Privacy Policy</a> |
          <a href="/Terms_Conditions_Margies.pdf" download>Terms & Conditions</a>
        </footer>
      </div>

  );
}

// Export the App component as the default export
export default App;
