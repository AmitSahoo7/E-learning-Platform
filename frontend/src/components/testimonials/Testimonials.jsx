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
  const [slideDirection, setSlideDirection] = useState('');
  const timeoutRef = useRef(null);
  const animationTimeoutRef = useRef(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      handleNext('right');
    }, AUTO_SLIDE_INTERVAL);
    return () => clearTimeout(timeoutRef.current);
  }, [current]);

  // Clean up animation class after animation
  useEffect(() => {
    if (slideDirection) {
      animationTimeoutRef.current = setTimeout(() => {
        setSlideDirection('');
      }, 400); // match CSS animation duration
    }
    return () => clearTimeout(animationTimeoutRef.current);
  }, [slideDirection]);

  const goTo = (idx) => {
    setSlideDirection(idx > current ? 'slide-right' : 'slide-left');
    setCurrent(idx);
  };
  const handlePrev = () => {
    setSlideDirection('slide-left');
    setCurrent((prev) => (prev - 1 + testimonialsData.length) % testimonialsData.length);
  };
  const handleNext = (dir = 'right') => {
    setSlideDirection(dir === 'left' ? 'slide-left' : 'slide-right');
    setCurrent((prev) => (prev + 1) % testimonialsData.length);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={`testimonial-star${i < rating ? " filled" : ""}`}>★</span>
    ));
  };

  return (
    <section className="testimonials-carousel speech-bubble-bg">
      <div className="testimonial-carousel-header">
        {/* <span className="testimonial-client-script">Client</span> */}
        <h2 className="testimonial-main-heading">TESTIMONIAL</h2>
      </div>
      <div className="testimonial-carousel-container">
        <button className="testimonial-arrow left" onClick={handlePrev} aria-label="Previous testimonial"><ChevronLeft /></button>
        {/* Peek carousel: previous, current, next */}
        <div className="testimonial-peek-carousel">
          {/* Previous card */}
          <div
            className="testimonial-carousel-card speech-bubble-card testimonial-peek-card testimonial-peek-left"
            aria-hidden="true"
            style={{
              zIndex: 1,
              pointerEvents: 'none',
              opacity: 0.5,
              transform: 'scale(0.85) translateX(-60%)',
              display: window.innerWidth < 700 ? 'none' : 'block',
            }}
          >
            <div className="testimonial-avatar-overlap">
              <img src={testimonialsData[(current - 1 + testimonialsData.length) % testimonialsData.length].image} alt={testimonialsData[(current - 1 + testimonialsData.length) % testimonialsData.length].name} />
            </div>
            <div className="testimonial-card-content">
              <div className="testimonial-card-header">
                <span className="testimonial-card-name">{testimonialsData[(current - 1 + testimonialsData.length) % testimonialsData.length].name}</span>
                <span className="testimonial-card-tagline">{testimonialsData[(current - 1 + testimonialsData.length) % testimonialsData.length].tagline}</span>
                <div className="testimonial-card-stars">{renderStars(testimonialsData[(current - 1 + testimonialsData.length) % testimonialsData.length].rating)}</div>
              </div>
              <div className="testimonial-card-quote-row">
                <span className="testimonial-quote-icon">“</span>
                <span className="testimonial-carousel-message">{testimonialsData[(current - 1 + testimonialsData.length) % testimonialsData.length].message}</span>
              </div>
            </div>
          </div>
          {/* Main card */}
          <div className={`testimonial-carousel-card speech-bubble-card testimonial-peek-main ${slideDirection}`}>
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
          {/* Next card */}
          <div
            className="testimonial-carousel-card speech-bubble-card testimonial-peek-card testimonial-peek-right"
            aria-hidden="true"
            style={{
              zIndex: 1,
              pointerEvents: 'none',
              opacity: 0.5,
              transform: 'scale(0.85) translateX(60%)',
              display: window.innerWidth < 700 ? 'none' : 'block',
            }}
          >
            <div className="testimonial-avatar-overlap">
              <img src={testimonialsData[(current + 1) % testimonialsData.length].image} alt={testimonialsData[(current + 1) % testimonialsData.length].name} />
            </div>
            <div className="testimonial-card-content">
              <div className="testimonial-card-header">
                <span className="testimonial-card-name">{testimonialsData[(current + 1) % testimonialsData.length].name}</span>
                <span className="testimonial-card-tagline">{testimonialsData[(current + 1) % testimonialsData.length].tagline}</span>
                <div className="testimonial-card-stars">{renderStars(testimonialsData[(current + 1) % testimonialsData.length].rating)}</div>
              </div>
              <div className="testimonial-card-quote-row">
                <span className="testimonial-quote-icon">“</span>
                <span className="testimonial-carousel-message">{testimonialsData[(current + 1) % testimonialsData.length].message}</span>
              </div>
            </div>
          </div>
        </div>
        <button className="testimonial-arrow right" onClick={handleNext} aria-label="Next testimonial"><ChevronRight /></button>
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
