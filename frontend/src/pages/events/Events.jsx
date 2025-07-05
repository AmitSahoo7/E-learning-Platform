import React, { useState } from 'react';
import './events.css';

const Events = () => {
  const [form, setForm] = useState({ name: '', email: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to a backend or API
    setSubmitted(true);
  };

  return (
    <div className="event-main-wrapper">
      <section className="event-section-glow-bg">
        <div className="event-content-modern">
          <div className="event-register-container">
            <h1 className="event-title-gradient">Register for Our Next Free Webinar!</h1>
            <p className="event-desc">
              Fill in your details below to reserve your spot. We'll send you a confirmation and all the details by email.
            </p>
            {submitted ? (
              <div className="event-success">
                <h2>Thank you for registering!</h2>
                <p>We've received your registration. Check your email for event details soon.</p>
              </div>
            ) : (
              <form className="event-form" onSubmit={handleSubmit}>
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Your Name"
                />
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                />
                <button type="submit" className="event-btn">Register</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events; 