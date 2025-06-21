import React from "react";
import "./footer.css";
import {
  AiFillFacebook,
  AiFillTwitterSquare,
  AiFillInstagram,
  AiFillYoutube,
  AiFillMail,
} from "react-icons/ai";

const Footer = () => {
  return (
    <footer className="footer-custom">
      <div className="footer-main">
        <div className="footer-logo">Skill Nest</div>
        <nav className="footer-nav">
          <a href="/">Home</a>
          <a href="/courses">Courses</a>
          <a href="#">Resources</a>
          <a href="/about">About Us</a>
          <a href="#">Contact Us</a>
        </nav>
        <div className="footer-socials">
          <a href="#" aria-label="facebook"><AiFillFacebook /></a>
          <a href="#" aria-label="twitter"><AiFillTwitterSquare /></a>
          <a href="#" aria-label="mail"><AiFillMail /></a>
          <a href="#" aria-label="youtube"><AiFillYoutube /></a>
          <a href="#" aria-label="instagram"><AiFillInstagram /></a>
        </div>
      </div>
      <div className="footer-bottom">
        <div>Skill Nest 2025, All rights reserved</div>
        <div>Made with <span style={{ color: 'red' }}>❤</span> for NPTEL in India</div>
      </div>
    </footer>
  );
};

export default Footer;
