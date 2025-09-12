import React from "react";
import ReactDOM from "react-dom/client";
import LandingPage from "./LandingPage";
import { BrowserRouter } from "react-router-dom";
import 'normalize.css';
import emailjs from "emailjs-com";
import "./firebase"; // <-- Import your firebase initialization file

emailjs.init("5Pr-FJ_TWj0vvjJmP");

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);