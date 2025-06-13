import React from "react";
import { useNavigate } from "react-router-dom";
import { Search, Play, MessageSquare, Target, Lightbulb, Users } from "lucide-react";
import "./home.css";
import Testimonials from "../../components/testimonials/Testimonials";

const Home = () => {
  const navigate = useNavigate();

  const skills = [
    { icon: <MessageSquare className="skill-icon" />, label: "Public Speaking" },
    { icon: <Target className="skill-icon" />, label: "Career-Oriented" },
    { icon: <Lightbulb className="skill-icon" />, label: "Creative Thinking" }
  ];

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="header-content">
            {/* Logo */}
            <div className="logo">
              <div className="logo-icon">
                <span>W</span>
              </div>
              <span className="logo-text">WEEKEND</span>
            </div>

            {/* Search Bar */}
            <div className="search-container">
              <div className="search-bar">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Want to learn?"
                  className="search-input"
                />
                <button className="search-btn">Explore</button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="navigation">
              <a href="#" className="nav-link active">Home</a>
              <a href="#" className="nav-link">About us</a>
              <a href="#" className="nav-link">Courses</a>
              <a href="#" className="nav-link">Contact us</a>
              <a href="#" className="nav-link">FAQ's</a>
              <a href="#" className="nav-link">Sign in</a>
              <button className="create-account-btn">
                Create free account
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="hero-section">
        {/* Decorative circles */}
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
        <div className="circle circle-4"></div>

        <div className="hero-container">
          <div className="hero-content">
            {/* Left Content */}
            <div className="hero-left">
              <h1 className="hero-title">
                Up Your <span className="text-green">Skills</span><br />
                To <span className="text-green">Advance</span> Your<br />
                <span className="text-green">Career</span> Path
              </h1>
              
              <p className="hero-description">
                Learn UI-UX Design skills with weekend UX. The latest online learning 
                system and material that help your knowledge growing.
              </p>
              
              <div className="hero-buttons">
                <button 
                  onClick={() => navigate("/courses")}
                  className="btn-primary"
                >
                  Get Started
                </button>
                
                <button className="btn-secondary">
                  <Play className="play-icon" />
                  Get free trial
                </button>
              </div>
              
              {/* Skills */}
              <div className="skills-list">
                {skills.map((skill, index) => (
                  <div key={index} className="skill-item">
                    <div className="skill-icon-container">
                      {skill.icon}
                    </div>
                    <span className="skill-label">{skill.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right Content - Hero Image */}
            <div className="hero-right">
              <div className="hero-image-container">
                {/* Main circle background */}
                <div className="main-circle">
                  <div className="student-placeholder">
                    <Users className="student-icon" />
                  </div>
                </div>
                
                {/* Floating stats cards */}
                <div className="stat-card stat-card-1">
                  <div className="stat-content">
                    <div className="stat-icon-container">
                      <div className="stat-icon-circle"></div>
                    </div>
                    <div className="stat-info">
                      <div className="stat-number">5K+</div>
                      <div className="stat-label">Online Courses</div>
                    </div>
                  </div>
                </div>
                
                <div className="stat-card stat-card-2">
                  <div className="stat-content">
                    <div className="stat-icon-container">
                      <Play className="stat-play-icon" />
                    </div>
                    <div className="stat-info">
                      <div className="stat-number">2K+</div>
                      <div className="stat-label">Video Courses</div>
                    </div>
                  </div>
                </div>
                
                <div className="stat-card stat-card-3">
                  <div className="stat-content">
                    <div className="stat-icon-container">
                      <Users className="stat-users-icon" />
                    </div>
                    <div className="stat-info">
                      <div className="stat-title">Tutors</div>
                      <div className="stat-number">250+</div>
                    </div>
                  </div>
                </div>
                
                {/* Small decorative circle */}
                <div className="decorative-circle"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Testimonials />
    </div>
  );
};

export default Home;