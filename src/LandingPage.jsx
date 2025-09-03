import { Link } from "react-router-dom";
import "./LandingPage.css";

// Images (swap to your own if you like)
import heroImg from "./assets/Aapartment3.jpg";
import room1 from "./assets/Aadiamond1.jpg";
import room2 from "./assets/Aaemerald1.jpg";
import room3 from "./assets/Aronyx3.jpg";
import logo from "./assets/margies logo.jpg";

/**
 * Props:
 *  - currentUser: Firebase user or null
 */
export default function LandingPage({ currentUser }) {
  return (
    <div className="lp">
      {/* HERO */}
      <section className="lp-hero">
        <img src={heroImg} alt="Margies hero" className="lp-hero-bg" />
        <div className="lp-hero-overlay" />

        <header className="lp-hero-header">
          <div className="lp-brand">
            <img src={logo} alt="Margies logo" className="lp-logo" />
            <span className="lp-brand-text">Margie’s</span>
          </div>

          <nav className="lp-topnav">
            <a href="#check">Book Now</a>
            <Link to="/gallery">Gallery</Link>
            <a href="#contact">Contact</a>

            {!currentUser ? (
              <>
                <Link to="/login" className="lp-auth">Log In</Link>
                <Link to="/signup" className="lp-auth lp-auth-primary">Sign Up</Link>
              </>
            ) : (
              <>
                <Link to="/my-bookings" className="lp-auth">My Bookings</Link>
              </>
            )}
          </nav>
        </header>

        <div className="lp-hero-content">
          <h1>Live Lagos. Stay at Margie’s.</h1>
          <p>
            Cozy, budget-smart rooms in Gbagada Phase 1—steps from food, nightlife,
            and transit. Self check-in, fast Wi-Fi, and great vibes.
          </p>
          <div className="lp-cta-wrap">
            <a href="#check" className="lp-btn lp-btn-primary">Check Availability</a>
            <Link to="/gallery" className="lp-btn lp-btn-ghost">View Gallery</Link>
          </div>

          {!currentUser && (
            <div className="lp-auth-cta">
              <Link to="/login" className="lp-chip">Log In</Link>
              <Link to="/signup" className="lp-chip lp-chip-primary">Create Account</Link>
            </div>
          )}
        </div>

        <div className="lp-badges">
          <span>Free Wi-Fi</span>
          <span>Central Location</span>
          <span>Self Check-in</span>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="lp-grid">
        <article className="lp-card">
          <h3>Prime Mainland Spot</h3>
          <p>
            43 Oguntona Crescent, Gbagada Phase 1. Walk to supermarkets, street food,
            and quick links into the city.
          </p>
        </article>
        <article className="lp-card">
          <h3>Simple Comfort</h3>
          <p>
            Clean rooms with essentials and quiet hours for great sleep.
          </p>
        </article>
        <article className="lp-card">
          <h3>Guest-First</h3>
          <p>
            Clear rules, responsive host, and smooth smart-lock self check-in.
          </p>
        </article>
      </section>

      {/* ROOMS TEASER */}
      <section className="lp-rooms">
        <h2>Pick Your Space</h2>
        <div className="lp-room-grid">
          <figure className="lp-room">
            <img src={room1} alt="Room Diamond" />
            <figcaption>
              <h4>Room Diamond</h4>
              <p>Bright, comfy, convenient.</p>
            </figcaption>
          </figure>
          <figure className="lp-room">
            <img src={room2} alt="Room Emerald" />
            <figcaption>
              <h4>Room Emerald</h4>
              <p>Cozy retreat with essentials.</p>
            </figcaption>
          </figure>
          <figure className="lp-room">
            <img src={room3} alt="Room Onyx" />
            <figcaption>
              <h4>Room Onyx</h4>
              <p>Quiet corner for solid rest.</p>
            </figcaption>
          </figure>
        </div>
        <div className="lp-rooms-cta">
          <a href="#check" className="lp-btn lp-btn-primary">Book Now</a>
          <Link to="/gallery" className="lp-btn lp-btn-ghost">See More Photos</Link>
        </div>
      </section>

      {/* ABOUT TEASER */}
      <section className="lp-about">
        <div>
          <h2>Why Margie’s?</h2>
          <p>
            We’re your friendly, authentic base to experience Lagos like a local.
            Clean rooms, great location, and quick support when you need it.
          </p>
          <a href="#contact" className="lp-link">Have questions? Contact us →</a>
        </div>
      </section>
    </div>
  );
}
