import React, { useEffect, useState } from "react";
import "../coursedescription/coursedescription.css";
import "./coursestudy.css";
import { useNavigate, useParams } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import axios from "axios";
import { server } from "../../main";
import AddQuiz from "../../admin/Courses/AddQuiz.jsx";

import CourseReviewBox from "../../components/reviews/CourseReviewBox";
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const placeholderAvatar =
  "https://ui-avatars.com/api/?name=Instructor&background=6c63ff&color=fff&rounded=true&size=64";
const placeholderIcon = (
  <span
    style={{
      display: "inline-block",
      width: 20,
      height: 20,
      background: "#ececec",
      borderRadius: "5px",
      marginRight: 6,
      verticalAlign: "middle",
    }}
  ></span>
);

const CourseStudy = ({ user }) => {
  const params = useParams();
  const { fetchCourse, course } = CourseData();
  const navigate = useNavigate();


  const [quizCount, setQuizCount] = useState(0);
  const [contentList, setContentList] = useState([]);
  const [loadingContent, setLoadingContent] = useState(true);

  // Fetch quiz data when component mounts or when course ID changes
  useEffect(() => {
    if (!course || !course._id) return;
    const fetchQuiz = async () => {
      try {
        const { data } = await axios.get(`${server}/api/quiz/${course._id}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });
        setQuizCount(Array.isArray(data) ? data.length : 0);
      } catch {
        console.log("No quiz or user not enrolled");
        setQuizCount(0);
      }
    };

    fetchQuiz();
  }, [course, course?._id]);

  

  // Helper function to convert string to array (for prerequisites, whatYouLearn, courseOutcomes)
  const stringToArray = (str) => {
    if (!str) return [];
    return str.split("\n").filter((item) => item.trim() !== "");
  };

  // Get dynamic data from course object
  const prerequisites = stringToArray(course?.prerequisites);
  const whatYouLearn = stringToArray(course?.whatYouLearn);
  const courseOutcome = stringToArray(course?.courseOutcomes);


  // Progress state
  const [completed, setCompleted] = useState(0);
  const [completedLec, setCompletedLec] = useState(0);
  const [lectLength, setLectLength] = useState(1);
  const [enrolling, setEnrolling] = useState(false);

  // Add quiz progress state
  const [quizProgress, setQuizProgress] = useState(0);
  const [completedQuizCount, setCompletedQuizCount] = useState(0);
  const [totalQuizCount, setTotalQuizCount] = useState(0);

  const [showAssessment, setShowAssessment] = useState(false);

  const isEnrolled = user && course && Array.isArray(user.subscription) && user.subscription.includes(course._id);
  const isAdmin = user && user.role === "admin";
  const isCourseInstructor = user && (
    user.role === 'admin' ||
    (Array.isArray(course?.instructors) && course.instructors.map(String).includes(String(user._id)))
  );

  // Fetch course and progress data
  useEffect(() => {
    fetchCourse(params.id);
    // Fetch course progress only for non-admin users who are enrolled

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
        const safeCompletedLec = Math.min(
          data.completedLectures || 0,
          safeLectLength
        );
        let percent = Math.round((safeCompletedLec / safeLectLength) * 100);
        percent = Math.min(percent, 100);
        setCompleted(percent);
        setCompletedLec(safeCompletedLec);
        setLectLength(safeLectLength);
        // Quiz progress
        const safeQuizCount = data.allQuizzes || 0;
        const safeCompletedQuiz = Math.min(data.completedQuizzes || 0, safeQuizCount);
        let quizPercent = safeQuizCount > 0 ? Math.round((safeCompletedQuiz / safeQuizCount) * 100) : 0;
        quizPercent = Math.min(quizPercent, 100);
        setQuizProgress(quizPercent);
        setCompletedQuizCount(safeCompletedQuiz);
        setTotalQuizCount(safeQuizCount);
      } catch {
        setCompleted(0);
        setCompletedLec(0);
        setLectLength(1);
        setQuizProgress(0);
        setCompletedQuizCount(0);
        setTotalQuizCount(0);
      }
    }



    
    if (user && course && user.subscription.includes(course._id))
      fetchProgress();


    // eslint-disable-next-line
  }, [params.id, user, course]);

  // Fetch lectures and quizzes, merge and sort by order
  useEffect(() => {
    if (!course || !course._id) return;
    const fetchContent = async () => {
      setLoadingContent(true);
      try {
        const [lecturesRes, quizzesRes] = await Promise.all([
          axios.get(`${server}/api/lectures/${course._id}`, { headers: { token: localStorage.getItem('token') } }),
          axios.get(`${server}/api/quiz/${course._id}`, { headers: { token: localStorage.getItem('token') } })
        ]);
        const lectures = Array.isArray(lecturesRes.data) ? lecturesRes.data : lecturesRes.data.lectures || [];
        const quizzes = Array.isArray(quizzesRes.data) ? quizzesRes.data : [];
        const merged = [
          ...lectures.map(l => ({ ...l, type: 'lecture', id: l._id })),
          ...quizzes.map(q => ({ ...q, type: 'quiz', id: q._id }))
        ];
        merged.sort((a, b) => (a.order || 0) - (b.order || 0));
        setContentList(merged);
      } catch (err) {
        setContentList([]);
      }
      setLoadingContent(false);
    };
    fetchContent();
  }, [course, course?._id]);

  // Drag-and-drop handlers
  function DraggableItem(props) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.item.id });
    return (
      <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, border: '1px solid #eee', borderRadius: 8, margin: '8px 0', background: '#fff', padding: 16, display: 'flex', alignItems: 'center', cursor: props.isDraggable ? 'grab' : 'default' }}>
        {props.isDraggable && <span {...attributes} {...listeners} style={{ marginRight: 12, fontWeight: 700, cursor: 'grab' }}>≡</span>}
        {props.item.type === 'lecture' ? (
          <span>Lecture: {props.item.title}</span>
        ) : (
          <span>Quiz: {props.item.title}</span>
        )}
      </div>
    );
  }

  const isInstructor = user && (user.role === 'admin' || user.role === 'superadmin' || user.role === 'instructor');

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = contentList.findIndex(i => i.id === active.id);
    const newIndex = contentList.findIndex(i => i.id === over.id);
    const newList = arrayMove(contentList, oldIndex, newIndex);
    setContentList(newList);
    // Prepare payload for backend
    const items = newList.map((item, idx) => ({ type: item.type, id: item.id, order: idx + 1 }));
    try {
      await axios.post(`${server}/api/course/update-content-order`, { courseId: course._id, items }, { headers: { token: localStorage.getItem('token') } });
    } catch {}
  };

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
      <div className="cd-content-container">
        {/* Top: Course Image Banner with Overlay */}
        <div className="cd-image-banner">
          <img
            src={`${server}/${course.image}`}
            alt={course.title}
            className="cd-banner-img"
          />
          <div className="cd-banner-overlay">
            <h1 className="cd-title">{course.title}</h1>
            {course.tagline && <p className="cd-tagline">{course.tagline}</p>}
            {course.difficulty && (
              <span className="cd-category-badge">{course.difficulty}</span>
            )}
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

              {course.difficulty && (
                <div className="cd-info-row">
                  <span className="cd-info-label">Difficulty:</span>
                  <span className="cd-info-value">{course.difficulty}</span>
                </div>
              )}

              {/* Progress tracker for admins and enrolled users */}
              {isAdmin ? (
                <div
                  className="lecture-progress-bar"
                  style={{ margin: "12px 0", textAlign: "center" }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>
                    All lectures available for management
                  </div>
                </div>
              ) : (isCourseInstructor || isEnrolled) ? (
                lectLength === 0 ? (
                  <div className="lecture-progress-bar" style={{ margin: "12px 0", textAlign: "center" }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>
                      No lectures available yet.
                    </div>
                  </div>
                ) : completed === 0 ? (
                  <div className="lecture-progress-bar" style={{ margin: "12px 0" }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, textAlign: "center" }}>
                      Lecture Progress: 0% (No lectures completed yet)
                    </div>
                    <div className="lecture-progress-bar-track">
                      <div className="lecture-progress-bar-fill" style={{ width: `0%`, background: '#1cc524' }}></div>
                    </div>
                    <span className="lecture-progress-bar-percent" style={{ color: "#1cc524", fontWeight: 700, fontSize: "1.1rem" }}>
                      Start your first lecture!
                    </span>
                  </div>
                ) : (
                  <div className="lecture-progress-bar" style={{ margin: "12px 0" }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, textAlign: "center" }}>
                      Lecture Progress - {completedLec} out of {lectLength}
                    </div>
                    <div className="lecture-progress-bar-track">
                      <div className="lecture-progress-bar-fill" style={{ width: `${completed}%`, background: '#1cc524' }}></div>
                    </div>
                    <span className="lecture-progress-bar-percent" style={{ color: "#1cc524", fontWeight: 700, fontSize: "1.1rem" }}>
                      {completed}%
                    </span>
                  </div>
                )
              ) : null}

              

              {isAdmin ? null : (isCourseInstructor || isEnrolled) ? (
                totalQuizCount === 0 ? (
                  <div className="lecture-progress-bar" style={{ margin: "12px 0", textAlign: "center" }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: '#000' }}>
                      Quiz Progress: 0%
                    </div>
                  </div>
                ) : quizProgress === 0 ? (
                  <div className="lecture-progress-bar" style={{ margin: "12px 0" }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, textAlign: "center", color: '#000' }}>
                      Quiz Progress: 0% (No quizzes attempted yet)
                    </div>
                    <div className="lecture-progress-bar-track">
                      <div className="lecture-progress-bar-fill" style={{ width: `0%`, background: '#1cc524' }}></div>
                    </div>
                    <span className="lecture-progress-bar-percent" style={{ color: "#1cc524", fontWeight: 700, fontSize: "1.1rem" }}>
                      Start your first quiz!
                    </span>
                  </div>
                ) : (
                  <div className="lecture-progress-bar" style={{ margin: "12px 0" }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, textAlign: "center", color: '#000' }}>
                      Quiz Progress - {completedQuizCount} out of {totalQuizCount}
                    </div>
                    <div className="lecture-progress-bar-track">
                      <div className="lecture-progress-bar-fill" style={{ width: `${quizProgress}%`, background: '#1cc524' }}></div>
                    </div>
                    <span className="lecture-progress-bar-percent" style={{ color: "#1cc524", fontWeight: 700, fontSize: "1.1rem" }}>
                      {quizProgress}%
                    </span>
                  </div>
                )
              ) : quizCount > 0 ? (
                <div className="lecture-progress-bar" style={{ margin: "12px 0", textAlign: "center" }}>
                  <div style={{ fontWeight: 600, marginBottom: 8, color: '#000' }}>
                    Quiz Progress: 0%
                  </div>
                </div>
              ) : null}
              
              {/* Show total lectures and quizzes count above the buttons */}
              {lectLength > 0 && (
                <div style={{ fontWeight: 500, color: '#007aff', margin: '10px 0 2px 0', textAlign: 'center' }}>
                  Total Lectures: {lectLength}
                </div>
              )}
              

              {(isAdmin || isCourseInstructor || (user && Array.isArray(user.subscription) && user.subscription.includes(course._id))) ? (
                <button
                  className="cd-btn-primary cd-enroll-btn"
                  onClick={() => {
                    if (course && course._id && /^[a-fA-F0-9]{24}$/.test(course._id)) {
                      navigate(`/lectures/${course._id}`);
                    } else {
                      alert("Invalid course ID");
                    }
                  }}
                  disabled={enrolling}
                >
                  Start Learning
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

              
              {quizCount > 0 && (
                <div style={{ fontWeight: 500, color: '#007aff', margin: '2px 0 14px 0', textAlign: 'center' }}>
                  Total Quizzes: {quizCount}
                </div>
              )}
              
              {/* Final Assessment Button */}
              {(isAdmin || isCourseInstructor || isEnrolled) && (
                <button
                  className="cd-btn-primary cd-enroll-btn"
                  style={{ marginTop: 8, background: '#34d399' }}
                  onClick={() => {
                    if (isAdmin) {
                      navigate(`/admin/course/${course._id}/assessments`);
                    } else if (isCourseInstructor) {
                      navigate(`/instructor/course/${course._id}/assessments`);
                    } else {
                      navigate(`/course/${course._id}/assessment`);
                    }
                  }}
                >
                  Final Assessment
                </button>
              )}
              {/* Certificate Button */}
              {(isAdmin || isCourseInstructor || isEnrolled) && (
                <button
                  className="cd-btn-primary cd-enroll-btn"
                  style={{ marginTop: 8, background: '#f59e0b' }}
                  onClick={() => navigate(`/course/${course._id}/certificate`)}
                >
                  🎓 Get Certificate
                </button>
              )}

              {/* Preview Video */}
              {course.previewVideo && (
                <div className="cd-preview-video">
                  <video
                    width="100%"
                    height="160"
                    controls
                    style={{ borderRadius: 12, marginTop: 12 }}
                  >
                    <source
                      src={`${server}/${course.previewVideo}`}
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructor and Review Section Side by Side */}
        <div className="cd-side-by-side-row">
          <div className="cd-instructor-card" data-aos="fade-up">
            <img
              src={
                course.instructorAvatar
                  ? `${server}/${course.instructorAvatar}`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      course.instructorName || course.createdBy || "Instructor"
                    )}&background=34c759&color=fff&rounded=true&size=64`
              }
              alt="Instructor"
              className="cd-instructor-avatar"
            />
            <div>
              <div className="cd-instructor-name">
                {course.instructorName || course.createdBy || "Instructor"}
              </div>
              <div className="cd-instructor-bio">
                {course.instructorBio ||
                  "Experienced software engineer and educator with a passion for teaching data structures and algorithms."}
              </div>
            </div>
          </div>
          <div className="cd-review-box-wrapper" data-aos="fade-up">
            <CourseReviewBox courseId={course._id} user={user} />
          </div>
        </div>
        {/* Removed Course Content section here */}
      </div>
    </div>
  );
};

export default CourseStudy;
