import React, { useState } from "react";
import "./about.css";
import axios from "axios";
import { server } from "../../main";

const About = () => {
  // Feedback form state
  const [feedback, setFeedback] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState("");

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${server}/api/feedback`, { message: feedback }, {
        headers: { token: localStorage.getItem("token") }
      });
      setFeedbackStatus("Feedback submitted!");
      setFeedback("");
    } catch (err) {
      setFeedbackStatus("Failed to submit feedback. You must be logged in.");
    }
  };

  return (
    <div className="about-main-wrapper">
      <section className="about-section-glow-bg">
        <div className="about-content-modern">
          <div className="about-left">
            <h2 className="about-title-gradient">About Us</h2>
            <h3 className="about-subtitle">
              <span className="highlight">SkillNest</span> provides the best opportunities to the students around the Globe.
            </h3>
            <p className="about-description">
              We are dedicated to providing high quality online courses to help individuals learn and grow in their desired fields. Our experienced instruction ensure that each course is tailored for effective learning and practical application.
            </p>
            <button className="join-btn">
              Join Us
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <form className="about-feedback-card" onSubmit={handleFeedbackSubmit}>
              <label htmlFor="feedback">Your Feedback</label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts, suggestions, or issues..."
                rows={4}
                required
              />
              <button type="submit" className="about-feedback-btn">Submit Feedback</button>
              {feedbackStatus && (
                <div className={feedbackStatus.includes("submitted") ? "feedback-success" : "feedback-error"}>
                  {feedbackStatus}
                </div>
              )}
            </form>
          </div>
          <div className="about-images">
            <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" alt="Office" className="about-img" />
            <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80" alt="Teamwork" className="about-img" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;