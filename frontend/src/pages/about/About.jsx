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
    <div className="about">
      <div className="about-container">
        <div className="about-left">
          <h2 className="about-title">About Us</h2>
          <h3 className="about-subtitle">
            <span className="highlight">E-learning</span> Providing The Best Opportunities To The Students Around The Globe.
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

          {/* Feedback Form - now inside left column */}
          <div className="feedback-green-card">
            <h3 className="feedback-title">We Value Your Feedback</h3>
            <form onSubmit={handleFeedbackSubmit}>
              <label htmlFor="feedback-textarea" className="feedback-label">Your Feedback</label>
              <textarea
                id="feedback-textarea"
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Share your thoughts, suggestions, or issues..."
                required
                rows={4}
                className="feedback-textarea"
              />
              <button type="submit" className="feedback-btn-green">
                Submit Feedback
              </button>
            </form>
            {feedbackStatus && <div className={feedbackStatus.includes('submitted') ? 'feedback-success' : 'feedback-error'}>{feedbackStatus}</div>}
          </div>
        </div>
        <div className="about-right">
          <div className="image-container top-image">
            <img src="https://t4.ftcdn.net/jpg/03/84/55/29/360_F_384552930_zPoe9zgmCF7qgt8fqSedcyJ6C6Ye3dFs.jpg" alt="Modern office space" />
          </div>
          <div className="image-container bottom-image">
            <img src="https://img.freepik.com/free-photo/side-view-cropped-unrecognizable-business-people-working-common-desk_1098-20474.jpg?semt=ais_hybrid&w=740" alt="People working on laptops" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;