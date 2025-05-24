import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { FaWhatsapp, FaMapMarkerAlt } from "react-icons/fa";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";
import CheckAvailability from "./CheckAvailability";
import Gallery from "./Gallery";
import HERO from "./assets/HERO.MOV";
import logo from "./assets/margies logo.jpg";
import "./App.css";

function App() {
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setIsAdmin(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  const handleSubmitContact = async (e) => {
    e.preventDefault();
    setContactStatus("Sending message...");
    try {
      await addDoc(collection(db, "messages"), {
        name: contactName,
        email: contactEmail,
        message: contactMessage,
        created: Timestamp.now()
      });
      setContactStatus("Message sent successfully!");
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (err) {
      setContactStatus("Error sending message.");
      console.error(err);
    }
  };

  const whatsappUrl = 'https://wa.me/+2348035350455?text=I will like to get information about Margies.';
  const mapsUrl = 'https://maps.app.goo.gl/Qb78GZHA61tEyM7XA?g_st=com.google.maps.preview.copy';

  return (
    
      <div className="App">
        <header className="header">
          <div className="brand-container">
            <img src={logo} alt="margies logo" className="logo" />
          </div>
          <nav>
            <ul className="nav-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#check">Book Now</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact Us</a></li>
              <li><Link to="/gallery">Gallery</Link></li>
              {!isAdmin && (
                <li><button onClick={() => setIsAdmin(true)} className="admin-button-link">Admin Login</button></li>
              )}
              {isAdmin && isLoggedIn && (
                <li><button onClick={handleLogout} className="admin-button-link">Logout</button></li>
              )}
            </ul>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={
            isAdmin ? (
              isLoggedIn ? <AdminDashboard /> : <AdminLogin onLogin={handleLogin} />
            ) : (
              <main>
                <section id="home" className="hero-section">
                  <video className="hero-video" autoPlay muted loop>
                    <source src={HERO} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <Link to="/gallery" className="gallery-button">View Full Gallery</Link>
                </section>

                <section id="check" className="section">
                  <h2>Check Room Availability</h2>
                  <CheckAvailability />
                </section>

                <section id="about" className="section">
                  <h2>Discover Margies</h2>
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
                  <form className="contact-form" onSubmit={handleSubmitContact}>
                    <input type="text" name="name" placeholder="Full Name"
                      value={contactName} onChange={(e) => setContactName(e.target.value)} required />
                    <input type="email" name="email" placeholder="Email Address"
                      value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
                    <textarea name="message" placeholder="Your Message" rows="5"
                      value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} required />
                    <button type="submit">Send Message</button>
                  </form>
                  {contactStatus && <p>{contactStatus}</p>}
                </section>

                {/* Floating Icons */}
                <a href={mapsUrl} className="map-float" target="_blank" rel="noopener noreferrer">
                  <FaMapMarkerAlt className="map-icon" />
                </a>
                <a href={whatsappUrl} className="whatsapp-float" target="_blank" rel="noopener noreferrer">
                  <FaWhatsapp className="whatsapp-icon" />
                </a>
              </main>
            )
          } />
          <Route path="/gallery" element={<Gallery />} />
        </Routes>

        <footer className="footer">
          <p>&copy; 2025 Margie's. All rights reserved.</p>
          <a href="/Privacy_Policy_Margies.pdf" download>Privacy Policy</a> | 
          <a href="/Terms_Conditions_Margies.pdf" download>Terms & Conditions</a>
        </footer>
      </div>
    
  );
}

export default App;