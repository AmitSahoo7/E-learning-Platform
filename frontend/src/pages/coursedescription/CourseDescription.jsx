import React, { useEffect, useState } from "react";
import "./coursedescription.css";
import { useNavigate, useParams } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import { UserData } from "../../context/UserContext";
import axios from "axios";
import { server } from "../../main";
import { toast } from "react-toastify";
import Loading from "../../components/loading/Loading";

const CourseDescription = ({ user }) => {
  const params = useParams();
  const { fetchCourse, course, fetchCourses, fetchMyCourse } = CourseData();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { fetchUser } = UserData();

  // Placeholder data for demo
  const prerequisites = [
    "Basic math skills",
    "Logical thinking",
    "No prior coding experience required"
  ];
  const whatYouLearn = [
    "Software development fundamentals",
    "Algorithms and data structures",
    "Artificial intelligence basics",
    "Computer networks overview"
  ];
  const courseOutcome = [
    "Be job-ready for software engineering roles",
    "Understand core CS concepts",
    "Build real-world projects"
  ];

  useEffect(() => {
    fetchCourse(params.id);
  }, []);

  const [enrolling, setEnrolling] = useState(false);

  const checkoutHandler = async () => {
    const token = localStorage.getItem("token");
    setEnrolling(true);
    const {
      data: { order, key },
    } = await axios.post(
      `${server}/api/course/checkout/${params.id}`,
      {},
      {
        headers: {
          token,
        },
      }
    );
    const options = {
      key,
      amount: order.amount,
      currency: "INR",
      name: "E learning",
      description: "Learn with us",
      order_id: order.id,
      handler: async function (response) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;
        try {
          const { data } = await axios.post(
            `${server}/api/verification/${course._id}`,
            { razorpay_order_id, razorpay_payment_id, razorpay_signature },
            { headers: { token } }
          );
          await fetchUser();
          await fetchCourses();
          await fetchMyCourse();
          toast.success(data.message);
          setEnrolling(false);
          navigate(`/payment-success/${razorpay_payment_id}`);
        } catch (error) {
          toast.error(error.response?.data?.message || "Payment verification failed");
          setEnrolling(false);
        }
      },
      theme: {
        color: "#34c759",
      },
    };
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  // Button logic
  const isEnrolled = user && course && Array.isArray(user.subscription) && user.subscription.includes(course._id);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        course && (
          <div className="cd-root">
            {/* Top: Course Image Banner with Overlay */}
            <div className="cd-image-banner">
              <img src={`${server}/${course.image}`} alt={course.title} className="cd-banner-img" />
              <div className="cd-banner-overlay">
                <h1 className="cd-title">{course.title}</h1>
                <button
                  className="cd-btn-primary"
                  onClick={() => isEnrolled ? navigate(`/course/study/${course._id}`) : checkoutHandler()}
                  disabled={enrolling}
                >
                  {isEnrolled ? "Lectures" : "Get Started"}
                </button>
              </div>
            </div>
            {/* Main Content */}
            <div className="cd-main">
              {/* Left Side */}
              <div className="cd-main-left">
                <div className="cd-main-left-card" data-aos="fade-up">
                  <div className="cd-section">
                    <h3>Prerequisites</h3>
                    <ul className="cd-list">
                      {prerequisites.map((item, i) => (
                        <li key={i}><span className="cd-list-icon">✔️</span>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="cd-section">
                    <h3>What you'll learn</h3>
                    <ul className="cd-list">
                      {whatYouLearn.map((item, i) => (
                        <li key={i}><span className="cd-list-icon">✔️</span>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="cd-section">
                    <h3>Course Outcome</h3>
                    <ul className="cd-list">
                      {courseOutcome.map((item, i) => (
                        <li key={i}><span className="cd-list-icon">✔️</span>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              {/* Right Side */}
              <div className="cd-main-right">
                <div className="cd-card cd-info-card" data-aos="fade-up">
                  <div className="cd-info-row">
                    <span className="cd-info-label">Price:</span>
                    <span className="cd-info-value">₹{course.price}</span>
                  </div>
                  <div className="cd-info-row">
                    <span className="cd-info-label">Duration:</span>
                    <span className="cd-info-value">{course.duration} weeks</span>
                  </div>
                  {!isEnrolled && (
                    <button
                      className="cd-btn-primary cd-enroll-btn"
                      onClick={checkoutHandler}
                      disabled={enrolling}
                    >
                      {enrolling ? "Processing..." : "Enroll"}
                    </button>
                  )}
                  {isEnrolled && (
                    <button
                      className="cd-btn-primary cd-enroll-btn"
                      onClick={() => navigate(`/course/study/${course._id}`)}
                    >
                      Lectures
                    </button>
                  )}
                  {/* Preview Video Placeholder */}
                  <div className="cd-preview-video">
                    <video width="100%" height="160" controls style={{ borderRadius: 12, marginTop: 12 }}>
                      <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              </div>
            </div>
            {/* Instructor Card at Bottom */}
            <div className="cd-instructor-card" data-aos="fade-up">
              <img
                src={"https://ui-avatars.com/api/?name=" + encodeURIComponent(course.createdBy || "Instructor") + "&background=34c759&color=fff&rounded=true&size=64"}
                alt="Instructor"
                className="cd-instructor-avatar"
              />
              <div>
                <div className="cd-instructor-name">{course.createdBy || "Instructor"}</div>
                <div className="cd-instructor-bio">Experienced educator and subject matter expert.</div>
              </div>
            </div>
          </div>
        )
      )}
    </>
  );
};

export default CourseDescription;
