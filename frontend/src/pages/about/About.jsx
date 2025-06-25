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

      {/* Feedback Form */}
      <div className="feedback-section" style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 6px 24px #8a4baf22', padding: '2rem' }}>
          <h3 style={{ color: '#8a4baf', marginBottom: '1rem', textAlign: 'center', fontSize: '1.8rem' }}>We Value Your Feedback</h3>
          <form onSubmit={handleFeedbackSubmit}>
            <label htmlFor="feedback-textarea" style={{ fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Your Feedback</label>
            <textarea
              id="feedback-textarea"
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Share your thoughts, suggestions, or issues..."
              required
              rows={5}
              style={{ width: "100%", borderRadius: 8, padding: 12, border: '1px solid #ccc', fontSize: 16, marginBottom: '1rem' }}
            />
            <button type="submit" className="common-btn" style={{ width: '100%', marginTop: '0.5rem', background: '#8a4baf', color: '#fff', fontWeight: 600, borderRadius: 8, padding: '12px 24px', fontSize: 16, cursor: 'pointer' }}>
              Submit Feedback
            </button>
          </form>
          {feedbackStatus && <div style={{ marginTop: '1rem', textAlign: 'center', color: feedbackStatus.includes('submitted') ? '#34c759' : '#ff3b30', fontWeight: 500, fontSize: 15 }}>{feedbackStatus}</div>}
        </div>
      </div>
    </div>
  );
};

export default About;