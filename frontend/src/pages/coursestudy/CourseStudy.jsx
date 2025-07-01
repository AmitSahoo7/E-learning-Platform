import React, { useEffect, useState } from "react";
import "../coursedescription/coursedescription.css";
import { useNavigate, useParams } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import axios from "axios";
import { server } from "../../main";

const CourseStudy = ({ user }) => {
  const params = useParams();
  const { fetchCourse, course } = CourseData();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState();

  // Fetch quiz data when component mounts or when course ID changes
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await axios.get(`${server}/api/quiz/${course._id}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });
        setQuiz(data); // Set quiz if available
      } catch (err) {
        console.log("No quiz or user not enrolled");
        setQuiz(null);
      }
    };

    fetchQuiz();
  }, [course._id]);

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

  // Progress state
  const [completed, setCompleted] = useState(0);
  const [completedLec, setCompletedLec] = useState(0);
  const [lectLength, setLectLength] = useState(1);
  const [enrolling, setEnrolling] = useState(false);

  const isEnrolled = user && course && user.subscription.includes(course._id);
  const isAdmin = user && user.role === "admin";

  // Fetch course and progress data
  useEffect(() => {
    fetchCourse(params.id);

    async function fetchProgress() {
      try {
        const { data } = await axios.get(
          `${server}/api/user/progress?course=${params.id}`,
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          }
        );
        // Clamp values
        const safeLectLength = data.allLectures > 0 ? data.allLectures : 1;
        const safeCompletedLec = Math.min(data.completedLectures || 0, safeLectLength);
        let percent = Math.round((safeCompletedLec / safeLectLength) * 100);
        percent = Math.min(percent, 100);
        setCompleted(percent);
        setCompletedLec(safeCompletedLec);
        setLectLength(safeLectLength);
      } catch (err) {
        setCompleted(0);
        setCompletedLec(0);
        setLectLength(1);
      }
    }

    if (user && course && isEnrolled) {
      fetchProgress();
    }
    // eslint-disable-next-line
  }, [params.id, user, course]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      // Example enroll request to backend (adjust endpoint and payload as needed)
      await axios.post(
        `${server}/api/course/enroll`, 
        { courseId: course._id },
        { headers: { token: localStorage.getItem("token") } }
      );
      // After successful enrollment, navigate to lectures
      navigate(`/lectures/${course._id}`);
    } catch (error) {
      console.error("Enrollment failed:", error);
    }
    setEnrolling(false);
  };

  if (!course) return null;

  return (
    <div className="cd-root">
      {/* Top: Course Image Banner with Overlay */}
      <div className="cd-image-banner">
        <img src={`${server}/${course.image}`} alt={course.title} className="cd-banner-img" />
        <div className="cd-banner-overlay">
          <h1 className="cd-title">{course.title}</h1>
          <span className="cd-category-badge">Medium</span>
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
                  <li key={i}>
                    <span className="cd-list-icon">✔️</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="cd-section">
              <h3>What you'll learn</h3>
              <ul className="cd-list">
                {whatYouLearn.map((item, i) => (
                  <li key={i}>
                    <span className="cd-list-icon">✔️</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="cd-section">
              <h3>Course Outcome</h3>
              <ul className="cd-list">
                {courseOutcome.map((item, i) => (
                  <li key={i}>
                    <span className="cd-list-icon">✔️</span>
                    {item}
                  </li>
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

            {/* Progress tracker for admins and enrolled users */}
            {isAdmin ? (
              <div className="lecture-progress-bar" style={{ margin: "12px 0", textAlign: "center" }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  All lectures available for management
                </div>
              </div>
            ) : isEnrolled ? (
              lectLength === 0 ? (
                <div className="lecture-progress-bar" style={{ margin: "12px 0", textAlign: "center" }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>
                    No lectures available yet.
                  </div>
                </div>
              ) : completed === 0 ? (
                <div className="lecture-progress-bar" style={{ margin: "12px 0" }}>
                  <div style={{ fontWeight: 600, marginBottom: 8, textAlign: "center" }}>
                    Course Progress: 0% (No lectures completed yet)
                  </div>
                  <div className="lecture-progress-bar-track">
                    <div className="lecture-progress-bar-fill" style={{ width: `0%` }}></div>
                  </div>
                  <span className="lecture-progress-bar-percent" style={{ color: "#34c759", fontWeight: 700, fontSize: "1.1rem" }}>
                    Start your first lecture!
                  </span>
                </div>
              ) : (
                <div className="lecture-progress-bar" style={{ margin: "12px 0" }}>
                  <div style={{ fontWeight: 600, marginBottom: 8, textAlign: "center" }}>
                    Course Progress - {completedLec} out of {lectLength}
                  </div>
                  <div className="lecture-progress-bar-track">
                    <div className="lecture-progress-bar-fill" style={{ width: `${completed}%` }}></div>
                  </div>
                  <span className="lecture-progress-bar-percent" style={{ color: "#34c759", fontWeight: 700, fontSize: "1.1rem" }}>
                    {completed}%
                  </span>
                </div>
              )
            ) : null}

            {isAdmin || isEnrolled ? (
              <button
                className="cd-btn-primary cd-enroll-btn"
                onClick={() => navigate(`/lectures/${course._id}`)}
                disabled={enrolling}
              >
                Lectures
              </button>
            ) : (
              <button
                className="cd-btn-primary cd-enroll-btn"
                onClick={handleEnroll}
                disabled={enrolling}
              >
                {enrolling ? "Processing..." : "Enroll"}
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

      {/* Quiz Section Button */}
      <div className="quiz-section">
  <h3 style={{ marginTop: "2rem", color: "#007aff" }}>📋 Take Quiz</h3>
  {quiz ? (
    <>
      <p>This course contains a quiz with {quiz.questions.length} questions.</p>
      <button onClick={() => navigate(`/quiz/${course._id}`)}>
  Take Quiz
</button>
    </>
  ) : (
    <>
      <p>No quiz has been added yet. Stay tuned!</p>
      {(isAdmin || isEnrolled) && (
        <button
          className="cd-btn-primary"
          onClick={() => navigate(`/quiz/${course._id}`)}
        >
          Go to Quiz
        </button>
      )}
    </>
  )}
</div>

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
  );
};

export default CourseStudy;
