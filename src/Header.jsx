// src/Header.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaSun, FaMoon } from "react-icons/fa";
import "./Header.css"; // optional: create/extend to style header specific things

export default function Header({ currentUser, onLogout, theme, toggleTheme }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const goHome = () => {
    setOpen(false);
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navLink = (to, label, extraClass = "") => (
    <Link
      to={to}
      className={`${location.pathname === to ? "active" : ""} ${extraClass}`}
      onClick={() => setOpen(false)}
    >
      {label}
    </Link>
  );

  return (
    <header className="header header--site">
      <div className="brand-container" onClick={goHome} role="button" tabIndex={0}>
        <img src="/assets/margies logo.jpg" alt="Margie's" className="logo" />
        <span className="brand-title">Margie's</span>
      </div>

      <button
        className={`hamburger ${open ? "is-open" : ""}`}
        aria-label="Toggle navigation"
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav className={`nav-links ${open ? "is-open" : ""}`}>
        <div className="nav-left">
          <a href="#about" onClick={() => setOpen(false)}>About</a>
          <a href="#rooms" onClick={() => setOpen(false)}>Rooms</a>
          <a href="#amenities" onClick={() => setOpen(false)}>Amenities</a>
          <Link to="/gallery" onClick={() => setOpen(false)}>Gallery</Link>
          <Link to="/check" onClick={() => setOpen(false)}>Book Now</Link>
        </div>

        <div className="nav-right">
          <button
            className="theme-toggle-button"
            onClick={() => {
              toggleTheme();
              setOpen(false);
            }}
            aria-label="Toggle theme"
          >
            {theme === "light" ? <FaMoon /> : <FaSun />}
          </button>

          {!currentUser ? (
            <>
              <Link to="/login" className="btn btn--yellow" onClick={() => setOpen(false)}>
                Log In
              </Link>
              <Link to="/signup" className="btn btn--grey" onClick={() => setOpen(false)}>
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link to="/my-bookings" onClick={() => setOpen(false)}>My Bookings</Link>
              <button className="btn btn--logout" onClick={() => { setOpen(false); onLogout(); }}>
                Logout
              </button>
              <span className="nav-welcome">Hi, {currentUser.email}</span>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}