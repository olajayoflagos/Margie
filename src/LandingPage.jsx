import { useState } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

// Images — update paths if yours differ
import logo from "./assets/margies logo.jpg";
import heroImg from "./assets/Aapartment3.jpg";
import roomDiamond from "./assets/Aadiamond1.jpg";
import roomEmerald from "./assets/Aaemerald1.jpg";
import roomOnyx from "./assets/Aronyx3.jpg";
import roomBronzite from "./assets/Arbronzite1.jpg";
import apt2 from "./assets/Aapartment5.jpg";

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const whatsappUrl =
    "https://wa.me/+2348035350455?text=I will like to get information about Margies.";
  const mapsUrl =
    "https://maps.app.goo.gl/Qb78GZHA61tEyM7XA?g_st=com.google.maps.preview.copy";

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
      {/* ====== NAVBAR ====== */}
      <header className="nav">
        <div className="nav__inner container">
          <Link to="/" className="brand">
            <img src={logo} alt="Margie's logo" />
            <span>Margie’s</span>
          </Link>

          <nav className={`nav__links ${mobileOpen ? "is-open" : ""}`}>
            <a href="#about">About</a>
            <a href="#rooms">Rooms</a>
            <a href="#amenities">Amenities</a>
            <a href="#location">Location</a>
            <Link to="/gallery">Gallery</Link>
            <Link to="/check" className="btn btn--sm">Book Now</Link>
          </nav>

          <button
            className={`hamburger ${mobileOpen ? "is-open" : ""}`}
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
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
            <Link to="/check" className="btn btn--primary">Check Availability</Link>
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
            blends comfort with the authentic rhythm of Lagos life. By day, soak in the
            bustle; by night, stroll to sizzling suya spots and unwind above a popular
            local restaurant—just opposite a well-stocked supermarket.
          </p>
          <p>
            Whether for business or leisure, our rooms and apartment deliver convenience,
            security, and the true Lagos vibe—at a budget that makes sense.
          </p>
          <div className="about__cta">
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn btn--ghost">
              View on Google Maps
            </a>
            <Link to="/check" className="btn btn--primary">Book Your Stay</Link>
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
                  <Link to="/check" className="btn btn--sm btn--primary">Reserve</Link>
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
          <Link to="/gallery" className="btn btn--ghost">See More Photos</Link>
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
  src="https://www.google.com/maps?q=43%20Oguntona%20Crescent%2C%20Gbagada%20Phase%201%2C%20Lagos&output=embed"
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
            <Link to="/check" className="btn btn--primary">Check Availability</Link>
            <a className="btn btn--ghost" href={whatsappUrl} target="_blank" rel="noreferrer">
              Ask a Question
            </a>
          </div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="footer">
        <div className="container footer__grid">
          <div className="footer__brand">
            <img src={logo} alt="Margie's logo" />
            <p>Stay comfortable. Live Lagos.</p>
          </div>
          <div>
            <h5>Explore</h5>
            <ul>
              <li><a href="#rooms">Rooms</a></li>
              <li><a href="#amenities">Amenities</a></li>
              <li><Link to="/gallery">Gallery</Link></li>
              <li><Link to="/check">Book Now</Link></li>
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