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
    <div className="home-main-wrapper">
      {/* Hero Section */}
      <section className="hero-section-custom">
        <div className="hero-content-custom">
          <div className="hero-left-custom">
            <h1 className="hero-title-custom">
              <span style={{ color: "#FFA500", fontWeight: 700 }}>
                Studying
              </span>{" "}
              Online is now
              <br />
              <span style={{ color: "#3ecf8e", fontWeight: 700 }}>
                much easier
              </span>
            </h1>
            <p className="hero-subtitle-custom">
              LOTS of interesting platform that will teach you in more an
              interactive way
            </p>
            <div className="hero-cta-row">
              <button
                className="join-btn"
                onClick={() => navigate("/courses")}
              >
                Get Started
              </button>
              
            </div>
          </div>
          <div className="hero-right-custom">
            <div className="hero-img-outer">
              <div className="hero-img-dotted">
                <div className="hero-img-green"></div>
                <img
                  src={image}
                  alt="Student"
                  className="hero-student-img"
                />
                <div className="hero-laptop-label">Skill Nest</div>
                <div className="active-students-bubble">
                  <span className="active-students-number">10k+</span>
                  <br />
                  <span className="active-students-label">Active Students</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h2 className="section-title">How It Works?</h2>
        <div className="how-steps-row">
          <div className="how-step-card">
            <span className="how-step-icon">
              <BookOpen size={32} />
            </span>
            <h3>Get Started</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
          <div className="how-step-card">
            <span className="how-step-icon">
              <User size={32} />
            </span>
            <h3>Enroll Course</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
          <div className="how-step-card">
            <span className="how-step-icon">
              <CheckCircle size={32} color="#3ecf8e" />
            </span>
            <h3>Get Certified</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </div>
      </section>

      {/* Browse Top Essential Career Courses */}
      <section className="browse-courses-section">
        <h2 className="section-title">
          Browse Top Essential
          <br />
          Career Courses
        </h2>
        <div className="courses-row">
          <div className="course-card web-dev">
            <span className="course-icon">
              <Code size={32} />
            </span>
            <div className="course-title">Web Development</div>
          </div>
          <div className="course-card data-structure">
            <span className="course-icon">
              <Database size={32} />
            </span>
            <div className="course-title">Data Structure</div>
          </div>
          <div className="course-card uiux-design">
            <span className="course-icon">
              <LayoutDashboard size={32} />
            </span>
            <div className="course-title">UI UX Design</div>
          </div>
          <div
            className="course-card browse-all"
            onClick={() => navigate("/courses")}
          >
            <span className="course-icon">
              <ArrowRightCircle size={32} />
            </span>
            <div className="course-title">Browse All</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
