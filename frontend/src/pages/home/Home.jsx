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
import Testimonials from "../../components/testimonials/Testimonials";
import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";
import TiltedCard from "../../components/TiltedCard";

const Home = () => {
  const navigate = useNavigate();

  const partnerLogos = ["HubSpot", "Loom", "GitLab", "LiveChat", "monday.com"];
  const featuredCourses = [
    {
      title: "Web Development",
      img: image,
      subtitle: "Amit Kumar",
      description: "Learn to build modern, responsive websites and web apps using HTML, CSS, JavaScript, and React.",
      rating: 4.7,
      ratingCount: 25145,
      price: "₹1299",
      oldPrice: "₹3999",
      badge: "Bestseller"
    },
    {
      title: "Data Structure",
      img: image,
      subtitle: "Subham Kiran",
      description: "Master data structures for coding interviews and real-world software engineering.",
      rating: 4.5,
      ratingCount: 16741,
      price: "₹1199",
      oldPrice: "₹2999",
      badge: ""
    },
    {
      title: "UI UX Design",
      img: image,
      subtitle: "Jane Smith",
      description: "Design beautiful, user-friendly interfaces and experiences with Figma and modern tools.",
      rating: 4.8,
      ratingCount: 146,
      price: "₹1499",
      oldPrice: "₹2499",
      badge: "Bestseller"
    },
    {
      title: "AI & ML",
      img: image,
      subtitle: "John Doe",
      description: "Dive into Artificial Intelligence and Machine Learning with hands-on projects.",
      rating: 4.6,
      ratingCount: 1146,
      price: "₹1799",
      oldPrice: "₹3999",
      badge: ""
    },
    {
      title: "Cloud Computing",
      img: image,
      subtitle: "Priya Singh",
      description: "Understand cloud platforms, deployment, and DevOps essentials.",
      rating: 4.4,
      ratingCount: 856,
      price: "₹1399",
      oldPrice: "₹2999",
      badge: ""
    },
    {
      title: "Cyber Security",
      img: image,
      subtitle: "Ravi Patel",
      description: "Protect systems and data with practical cyber security skills.",
      rating: 4.3,
      ratingCount: 642,
      price: "₹1599",
      oldPrice: "₹2999",
      badge: ""
    },
  ];
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
          <h2 className="section-title" >Featured Courses</h2>
          <div className="featured-courses-grid">
            {featuredCourses.map((course, idx) => (
              <TiltedCard
                key={idx}
                imageSrc={course.img}
                altText={course.title}
                title={course.title}
                subtitle={course.subtitle}
                description={course.description}
                rating={course.rating}
                ratingCount={course.ratingCount}
                price={course.price}
                oldPrice={course.oldPrice}
                badge={course.badge}
              />
            ))}
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
            <h2>The number one factor in relevance drives out resistance.</h2>
            <p>
              Suas aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.
            </p>
            <button className="cta-btn learn-more-btn">Learn More</button>
          </div>
        </section>
      </div>
      
    </>
  );
};

export default Home;
