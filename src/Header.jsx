// src/Header.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaMoon, FaSun } from "react-icons/fa";
import "./Header.css";
import logo from "./assets/margies logo.jpg"; // adjust path if needed

export default function Header({ currentUser, onLogout, theme, toggleTheme }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="site-header" role="banner">
      <div className="site-header__inner">
        <Link to="/" className="brand" aria-label="Margie's home">
          <img src={logo} alt="Margie's logo" className="brand__logo" />
          <span className="brand__text">Margie's</span>
        </Link>

        <button
          className={`hamburger ${open ? "is-open" : ""}`}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`site-nav ${open ? "is-open" : ""}`} role="navigation" aria-label="Main navigation">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><a href="#check">Book Now</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><Link to="/gallery">Gallery</Link></li>
            <li className="nav-theme">
              <button
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                title="Toggle theme"
              >
                {theme === "light" ? <FaMoon /> : <FaSun />}
              </button>
            </li>

            {!currentUser && (
              <>
                <li className="nav-cta"><Link to="/login" className="btn btn--yellow">Log In</Link></li>
                <li className="nav-cta"><Link to="/signup" className="btn btn--grey">Sign Up</Link></li>
              </>
            )}

            {currentUser && (
              <>
                <li><Link to="/my-bookings">My Bookings</Link></li>
                <li><button onClick={onLogout} className="btn btn--outline">Logout</button></li>
                <li className="nav-welcome">Hello, {currentUser.email?.split("@")[0]}</li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}