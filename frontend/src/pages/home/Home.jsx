import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import Testimonials from "../../components/testimonials/Testimonials";
import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";
import TiltedCard from "../../components/TiltedCard";
import { CourseData } from "../../context/CourseContext";
import { server } from "../../main";

const Home = () => {
  const navigate = useNavigate();
  const { courses } = CourseData();
  const featuredCourses = courses.slice(0, 6);

  const partnerLogos = ["HubSpot", "Loom", "GitLab", "LiveChat", "monday.com"];
  const categories = [
    { name: "Digital Marketing", icon: <Code />, count: 25 },
    { name: "Graphic Design", icon: <Code />, count: 86 },
    { name: "Art & Humanities", icon: <BookOpen />, count: 76 },
    { name: "Personal Development", icon: <User />, count: 22 },
    { name: "IT and Software", icon: <Database />, count: 110 },
    { name: "Web Development", icon: <LayoutDashboard />, count: 91 },
  ];
  const newsTips = [
    {
      title: "5 Graphic Design Skills That Will Strengthen Your Creativity",
      img: image,
      subtitle: "Design Team",
      description: "Discover the top skills every graphic designer should master in 2024.",
      rating: 4.6,
      ratingCount: 1200,
      price: "Free",
      oldPrice: "",
      badge: "Hot"
    },
    {
      title: "3 Graphic Design Skills That Will Strengthen Your Creativity",
      img: image,
      subtitle: "Design Team",
      description: "Boost your creativity with these essential graphic design skills.",
      rating: 4.5,
      ratingCount: 900,
      price: "Free",
      oldPrice: "",
      badge: ""
    },
    {
      title: "6 Graphic Design Skills That Will Strengthen Your Creativity",
      img: image,
      subtitle: "Design Team",
      description: "Level up your design career with these must-have skills.",
      rating: 4.7,
      ratingCount: 1500,
      price: "Free",
      oldPrice: "",
      badge: "Hot"
    },
  ];

  return (
    <>
      
      <div className="home-main-wrapper">
        {/* Hero Section */}
        <section className="hero-section-modern hero-section-glow-bg">
          <div className="hero-content-modern">
            <h1 className="hero-title-modern hero-title-gradient">Good coaching is good <span className="hero-title-gradient-green">teaching</span></h1>
            <p className="hero-subtitle-modern">
              In a coaching role, you ask the questions and rely more on your staff, who become the experts, to provide the information.
            </p>
            <div className="hero-cta-row-modern">
              <button className="cta-btn cta-student">Join as Student</button>
              <button className="cta-btn cta-instructor">Join as Instructor</button>
            </div>
            <div className="hero-trusted-row">
              <span className="hero-trusted-text">Trusted by <b>1,000+</b> learners</span>
            </div>
          </div>
          <div className="hero-illustration-glow">
            <img src={image} alt="Hero" className="hero-img-glow" />
          </div>
        </section>

        {/* Partner Logos */}
        <section className="partner-logos-section">
          <div className="partner-logos-row">
            {partnerLogos.map((logo, idx) => (
              <div className="partner-logo" key={idx}>{logo}</div>
            ))}
          </div>
        </section>

        {/* Featured Courses */}
        <section className="featured-courses-section">
          <h2 className="section-title">Featured Courses</h2>
          <div className="featured-courses-grid">
            {featuredCourses.length === 0 ? (
              <div style={{ color: '#888', fontSize: '1.2rem', padding: '2rem' }}>No featured courses yet.</div>
            ) : (
              featuredCourses.map((course) => {
                // Use tagline if available, else trim description
                let summary = course.tagline && course.tagline.trim()
                  ? course.tagline.trim()
                  : (course.description ? course.description.split(" ").slice(0, 16).join(" ") + (course.description.split(" ").length > 16 ? "..." : "") : "");
                return (
                  <Link
                    to={`/course/${course._id}`}
                    key={course._id}
                    style={{ textDecoration: "none" }}
                  >
                    <TiltedCard
                      imageSrc={
                        course.image
                          ? `${server}/${course.image.replace(/\\/g, "/")}`
                          : "/default-course.png"
                      }
                      altText={course.title}
                      title={course.title}
                      subtitle={course.instructorName || course.createdBy || "Instructor"}
                      description={summary}
                      rating={course.rating || 0}
                      ratingCount={course.ratingCount || 0}
                      price={`₹${course.price}`}
                      oldPrice={course.price ? `₹${course.price + 100}` : ""}
                      badge={course.difficulty || ""}
                    />
                  </Link>
                );
              })
            )}
          </div>
        </section>

        {/* Categories */}
        <section className="categories-section">
          <h2 className="section-title">Top Categories</h2>
          <div className="categories-grid">
            {categories.map((cat, idx) => (
              <div className="category-card animated-card" key={idx}>
                <div className="category-icon">{cat.icon}</div>
                <div className="category-name">{cat.name}</div>
                <div className="category-count">{cat.count} Courses</div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="testimonials-section">
          <Testimonials />
        </section>

        {/* News/Tips */}
        <section className="news-tips-section">
          <h2 className="section-title">Latest Tips & News</h2>
          <div className="news-tips-row">
            {newsTips.map((tip, idx) => (
              <TiltedCard
                key={idx}
                imageSrc={tip.img}
                altText={tip.title}
                title={tip.title}
                subtitle={tip.subtitle}
                description={tip.description}
                rating={tip.rating}
                ratingCount={tip.ratingCount}
                price={tip.price}
                oldPrice={tip.oldPrice}
                badge={tip.badge}
              />
            ))}
          </div>
        </section>

        {/* Learn More Section */}
        <section className="learn-more-section">
          <div className="learn-more-content">
            <h2>Don't Miss Our Next Free Webinar!</h2>
            <p>
              Stay ahead with the latest trends in e-learning. Sign up for our upcoming webinar and get exclusive tips from industry experts.
            </p>
            <button className="cta-btn learn-more-btn" onClick={() => navigate('/events')}>Register for Webinar</button>
          </div>
        </section>
      </div>
      
    </>
  );
};

export default Home;
