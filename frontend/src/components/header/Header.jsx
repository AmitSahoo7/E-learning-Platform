import React from "react";
import "./header.css";
import { Link } from "react-router-dom";
const Header = ({ isAuth }) => {
  return (
    <header className="hero-header-bar">
      <Link to="/" className="logo">
        Skill Nest
      </Link>
      <nav className="hero-nav">
        <Link to="/">Home</Link>
        <Link to="/courses">Courses</Link>
        <Link to="/about">About</Link>
        {isAuth ? (
          <Link to="/account">Account</Link>
        ) : (
          <Link to="/login" className="login-btn" id="login">Login</Link>
        )}
      </nav>
    </header>
  );
};
export default Header;
