import React, { useState, useEffect, useRef } from "react";
import "./testimonials.css";

const ChevronLeft = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3ecf8e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
);
const ChevronRight = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3ecf8e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18"/></svg>
);

const testimonialsData = [
  {
    id: 1,
    name: "John Doe",
    tagline: "Aspiring Developer",
    position: "Student",
    message:
      "This platform helped me learn so effectively. The courses are amazing and the instructors are top-notch.",
    image:
      "https://th.bing.com/th?q=Current+Bachelor&w=120&h=120&c=1&rs=1&qlt=90&cb=1&dpr=1.3&pid=InlineBlock&mkt=en-IN&cc=IN&setlang=en&adlt=moderate&t=1&mw=247",
    rating: 5,
  },
  {
    id: 2,
    name: "Jane Smith",
    tagline: "UI/UX Enthusiast",
    position: "Student",
    message:
      "I've learned more here than in any other place. The interactive lessons and quizzes make learning enjoyable.",
    image:
      "https://th.bing.com/th/id/OIP.GKAiW3oc2TWXVEeZAzrWOAHaJF?w=135&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7",
    rating: 4,
  },
  {
    id: 3,
    name: "John Doe",
    position: "Student",
    message:
      "This platform helped me learn so effectively. The courses are amazing and the instructors are top-notch.",
    image:
      "https://th.bing.com/th?q=Current+Bachelor&w=120&h=120&c=1&rs=1&qlt=90&cb=1&dpr=1.3&pid=InlineBlock&mkt=en-IN&cc=IN&setlang=en&adlt=moderate&t=1&mw=247",
  },
  {
    id: 4,
    name: "Jane Smith",
    position: "Student",
    message:
      "I've learned more here than in any other place. The interactive lessons and quizzes make learning enjoyable.",
    image:
      "https://th.bing.com/th/id/OIP.GKAiW3oc2TWXVEeZAzrWOAHaJF?w=135&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7",
  },
];

const AUTO_SLIDE_INTERVAL = 4000;

const Testimonials = () => {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % testimonialsData.length);
    }, AUTO_SLIDE_INTERVAL);
    return () => clearTimeout(timeoutRef.current);
  }, [current]);

  const goTo = (idx) => setCurrent(idx);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonialsData.length) % testimonialsData.length);
  const next = () => setCurrent((prev) => (prev + 1) % testimonialsData.length);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={`testimonial-star${i < rating ? " filled" : ""}`}>★</span>
    ));
  };

  return (
    <section className="testimonials-carousel speech-bubble-bg">
      <div className="testimonial-carousel-header">
        <span className="testimonial-client-script">Client</span>
        <h2 className="testimonial-main-heading">TESTIMONIAL</h2>
      </div>
      <div className="testimonial-carousel-container">
        <button className="testimonial-arrow left" onClick={prev} aria-label="Previous testimonial"><ChevronLeft /></button>
        <div className="testimonial-carousel-card speech-bubble-card fade-in">
          <div className="testimonial-avatar-overlap">
            <img src={testimonialsData[current].image} alt={testimonialsData[current].name} />
          </div>
          <div className="testimonial-card-content">
            <div className="testimonial-card-header">
              <span className="testimonial-card-name">{testimonialsData[current].name}</span>
              <span className="testimonial-card-tagline">{testimonialsData[current].tagline}</span>
              <div className="testimonial-card-stars">{renderStars(testimonialsData[current].rating)}</div>
            </div>
            <div className="testimonial-card-quote-row">
              <span className="testimonial-quote-icon">“</span>
              <span className="testimonial-carousel-message">{testimonialsData[current].message}</span>
            </div>
            <button className="testimonial-learn-btn">Learn More</button>
          </div>
        </div>
        <button className="testimonial-arrow right" onClick={next} aria-label="Next testimonial"><ChevronRight /></button>
      </div>
      <div className="testimonial-carousel-dots">
        {testimonialsData.map((_, idx) => (
          <span
            key={idx}
            className={`testimonial-dot${idx === current ? " active" : ""}`}
            onClick={() => goTo(idx)}
          />
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
