import React from 'react';
import './Navbar.css';
import logo from "../assets/logo3.png";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="/" className="navbar-logo">
          <img src={logo} alt="College Logo" className="college-logo" />
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
