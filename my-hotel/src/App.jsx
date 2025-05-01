import { useState } from "react";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";
import './App.css';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';
import { db } from './firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

function App() {
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const message = form.message.value;
  
    try {
      await addDoc(collection(db, "messages"), {
        name,
        email,
        message,
        created: Timestamp.now()
      });
      alert("Message sent successfully!");
      form.reset();
    } catch (err) {
      alert("Error sending message");
      console.error(err);
    }
  };
  return (
    <div className="App">
      <header className="header">
        <div className="logo">Margie's</div>
        <nav>
          <ul className="nav-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
        </nav>
        {/* Show login/logout button based on the current mode */}
        {!isAdmin ? (
          <button onClick={() => setIsAdmin(true)} className="admin-button">Admin Login</button>
        ) : (
          <button onClick={handleLogout} className="admin-button">Logout</button>
        )}
      </header>

       {/* Render public content or dashboard based on the state */}
       {!isAdmin ? (
        <main>
      <section id="home">
        <Carousel
          autoPlay
          infiniteLoop
          showThumbs={false}
          showStatus={false}
          interval={4000}
        >
          <div>
            <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c" alt="Lobby" />
            <p className="legend">Elegant Lobby</p>
          </div>
          <div>
            <img src="https://images.unsplash.com/photo-1604147706283-5d618e1c0372" alt="Room" />
            <p className="legend">Luxury Rooms</p>
          </div>
          <div>
            <img src="https://images.unsplash.com/photo-1571508601931-5b67c8aebd4f" alt="Pool" />
            <p className="legend">Relaxing Pool</p>
          </div>
        </Carousel>
      </section>

      <section id="about" className="section">
        <h2>About Us</h2>
        <p>We provide top-notch hospitality services with luxury amenities and a personalized guest experience.</p>
      </section>

      <section id="contact" className="section">
  <h2>Contact Us</h2>
  <form className="contact-form" onSubmit={handleSubmit}>
  <input type="text" name="name" placeholder="Full Name" required />
  <input type="email" name="email" placeholder="Email Address" required />
  <textarea name="message" placeholder="Your Message" rows="5" required></textarea>
  <button type="submit">Send Message</button>
</form>

</section>

</main>

) : isLoggedIn ? (
        <AdminDashboard />
      ) : (
        <AdminLogin onLogin={handleLogin} />
      )}


      <footer className="footer">
        <p>&copy; 2025 Margie's. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
