import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  CheckCircle,
  User,
  BookOpen,
  Code,
  Database,
  LayoutDashboard,
  ArrowRightCircle,
} from "lucide-react";
import "./home.css";
import image from "../../assets/image.png";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-yellow-bg">
      {/* Header/Navbar */}
      <header className="home-navbar-yellow">
        <div className="navbar-logo" onClick={() => navigate("/")}>Skill Nest</div>
        <nav className="navbar-links">
          <a href="/">Home</a>
          <a href="#apply">Apply</a>
          <a href="#video-gallery">Video Gallery</a>
          <a href="#blog">Blog</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="navbar-actions">
          <button className="navbar-signup">Sign Up</button>
          <button className="navbar-signin">Sign In</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-green-section">
        <div className="hero-green-left">
          <h1 className="hero-green-title">
            Education is The Best Way to <br />
            <span className="hero-green-highlight">
              <span className="grow-green">Grow Up</span> <span className="knowledge-green">Knowledge</span>
            </span>
          </h1>
          <p className="hero-green-desc">
            Explore Courses Led by Experts, Engage with Interactive Tools, Achieve Your Goals at Your Own Pace. Revolutionize Your Learning Journey With Flexible, On-Demand Courses.
          </p>
          <div className="hero-green-btns">
            <button className="hero-green-getstarted">Get Started</button>
            <button className="hero-green-play"><Play size={20} /> Play Video</button>
          </div>
          <div className="hero-green-features">
            <span className="feature-dot"></span> Experienced Mentors
            <span className="feature-dot"></span> Quality Videos
            <span className="feature-dot"></span> Affordable price
          </div>
        </div>
        <div className="hero-green-right">
          <div className="hero-green-img-bg">
            <div className="hero-green-img-container">
              <img src={image} alt="Student" className="hero-green-img" />
              <div className="laptop-label-on-img">Skill Nest</div>
            </div>
            <div className="hero-green-badge">98.99% <span>Positive Rate</span></div>
          </div>
          <div className="hero-green-members-card">
            <span>10k+</span>
            <div>Online Members</div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="yellow-stats-bar">
        <span>Rated Excellent ⭐⭐⭐⭐⭐</span>
        <span>20 Thousand+ Learners</span>
        <span>4 Thousand+ Graduates</span>
        <span>28 Countries</span>
      </section>

      {/* Benefits Section */}
      <section className="yellow-benefits-section">
        <div className="yellow-benefits-left">
          <div className="yellow-benefit-mentor-img mentor-img-1">[Mentor 1]</div>
          <div className="yellow-benefit-mentor-img mentor-img-2">[Mentor 2]</div>
        </div>
        <div className="yellow-benefits-right">
          <h2>Benefits From Our Online Learning</h2>
          <ul>
            <li><span className="benefit-icon">🎓</span> Online Degrees</li>
            <li><span className="benefit-icon">⚡</span> Short Courses</li>
            <li><span className="benefit-icon">👨‍🏫</span> Training From Experts</li>
            <li><span className="benefit-icon">🎥</span> 1.2k Video Courses</li>
          </ul>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="yellow-popular-courses">
        <h2>Popular Course</h2>
        <div className="yellow-courses-grid">
          {[...Array(8)].map((_, i) => (
            <div className="yellow-course-card" key={i}>
              <div className="yellow-course-img">[Image]</div>
              <div className="yellow-course-title">Course Title {i + 1}</div>
              <div className="yellow-course-meta">$XX.XX <span>⭐ 5.0</span></div>
              <button className="yellow-course-details">All Details →</button>
            </div>
          ))}
        </div>
      </section>

      {/* Meet Our Mentors */}
      <section className="yellow-mentors-section">
        <h2>Meet Our Mentors</h2>
        <div className="yellow-mentors-grid">
          {[...Array(5)].map((_, i) => (
            <div className="yellow-mentor-card" key={i}>
              <div className="yellow-mentor-img">[Mentor]</div>
              <div className="yellow-mentor-title">Mastering Socially</div>
              <div className="yellow-mentor-meta">4.8 ⭐ (3,287)</div>
              <button className="yellow-mentor-details">All Details →</button>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="yellow-testimonials-section">
        <h2>Testimonials</h2>
        <div className="yellow-testimonials-grid">
          {[...Array(4)].map((_, i) => (
            <div className="yellow-testimonial-card" key={i}>
              <div className="yellow-testimonial-user">[User]</div>
              <div className="yellow-testimonial-text">"This is a sample testimonial from a user. The platform is amazing!"</div>
              <div className="yellow-testimonial-meta">⭐⭐⭐⭐⭐</div>
            </div>
          ))}
        </div>
      </section>

      {/* Blog Section */}
      <section className="yellow-blogs-section">
        <h2>Read Our Daily Blogs</h2>
        <div className="yellow-blogs-grid">
          {[...Array(5)].map((_, i) => (
            <div className="yellow-blog-card" key={i}>
              <div className="yellow-blog-img">[Blog Img]</div>
              <div className="yellow-blog-title">Blog Title {i + 1}</div>
              <div className="yellow-blog-date">01/01/2023</div>
              <button className="yellow-blog-read">Read More →</button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="yellow-footer">
        <div className="yellow-footer-main">
          <div className="yellow-footer-logo">Skill Nest</div>
          <div className="yellow-footer-menus">
            <div className="yellow-footer-menu">
              <h4>Menu</h4>
              <a href="#">Categories</a>
              <a href="#">Courses</a>
              <a href="#">Deals</a>
              <a href="#">New</a>
            </div>
            <div className="yellow-footer-menu">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Our Mentors</a>
              <a href="#">Blog</a>
              <a href="#">Contact</a>
            </div>
            <div className="yellow-footer-menu">
              <h4>Support</h4>
              <a href="#">Terms & Condition</a>
              <a href="#">Courses</a>
              <a href="#">Community</a>
            </div>
            <div className="yellow-footer-menu">
              <h4>Subscribe to Our Newsletter</h4>
              <input type="email" placeholder="Enter Your Email" />
              <button className="yellow-footer-subscribe">Subscribe Now</button>
            </div>
          </div>
        </div>
        <div className="yellow-footer-bottom">
          <span>© 2024 Skill Nest. All rights reserved.</span>
          <div className="yellow-footer-socials">
            <a href="#">[FB]</a>
            <a href="#">[TW]</a>
            <a href="#">[IN]</a>
            <a href="#">[YT]</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
