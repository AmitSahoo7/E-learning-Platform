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
    <footer className="footer-custom glassy-footer">
      <div className="footer-columns">
        <div className="footer-col">
          <div className="footer-logo">SkillNest</div>
          <p className="footer-about">Skill Nest is your modern e-learning platform for interactive, engaging, and career-focused courses. Learn, grow, and achieve your goals with us!</p>
        </div>
        <div className="footer-col">
          <div className="footer-title">Quick Links</div>
          <nav className="footer-nav">
            <a href="/">Home</a>
            <a href="/courses">Courses</a>
            <a href="/about">About Us</a>
            <a href="/leaderboard">Leaderboard</a>
          </nav>
        </div>
        <div className="footer-col">
          <div className="footer-title">Contact Us</div>
          <div className="footer-contact">
            <div>Email: <a href="mailto:info@skillnest.com">info@skillnest.com</a></div>
            <div>Phone: +91 12345 67890</div>
            <div>Address: 123, Learning Lane, India</div>
          </div>
          <div className="footer-socials">
            <a href="#" aria-label="facebook"><AiFillFacebook /></a>
            <a href="#" aria-label="twitter"><AiFillTwitterSquare /></a>
            <a href="#" aria-label="mail"><AiFillMail /></a>
            <a href="#" aria-label="youtube"><AiFillYoutube /></a>
            <a href="#" aria-label="instagram"><AiFillInstagram /></a>
          </div>
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
