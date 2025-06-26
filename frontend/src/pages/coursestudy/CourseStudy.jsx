import React, { useEffect, useState } from "react";
import "./coursestudy.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import { server } from "../../main";
import axios from "axios";

const placeholderAvatar = "https://ui-avatars.com/api/?name=Instructor&background=6c63ff&color=fff&rounded=true&size=64";
const placeholderIcon = (
  <span style={{ display: 'inline-block', width: 20, height: 20, background: '#ececec', borderRadius: '5px', marginRight: 6, verticalAlign: 'middle' }}></span>
);

const CourseStudy = ({ user }) => {
  const params = useParams();
  const { fetchCourse, course } = CourseData();
  const navigate = useNavigate();

  // Progress state
  const [completed, setCompleted] = useState(0);
  const [completedLec, setCompletedLec] = useState(0);
  const [lectLength, setLectLength] = useState(1);

  if (user && user.role !== "admin" && !user.subscription.includes(params.id))
    return navigate("/");

  useEffect(() => {
    fetchCourse(params.id);
    // Fetch course progress
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
      } catch (error) {
        setCompleted(0);
        setCompletedLec(0);
        setLectLength(1);
      }
    }
    fetchProgress();
    // eslint-disable-next-line
  }, [params.id]);

  if (!course) return null;

  return (
    <div className="modern-course-study-root">
      <div className="modern-course-image-section">
        <img
          src={`${server}/${course.image}`}
          alt={course.title}
          className="modern-course-image"
        />
      </div>
      <div className="modern-course-content-section">
        <h1 className="modern-course-title">{course.title}</h1>
        <div className="modern-course-meta">
          <span className="modern-course-meta-item">{placeholderIcon} Design</span>
          <span className="modern-course-meta-item">{placeholderIcon} {course.duration || '3'} Month</span>
        </div>
        <p className="modern-course-description">
          {course.description || 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor'}
        </p>
        <div className="modern-course-instructor-section">
          <div className="modern-course-instructor-label">Course Instructor</div>
          <div className="modern-course-instructor-info">
            <img src={placeholderAvatar} alt="Instructor" className="modern-course-instructor-avatar" />
            <span className="modern-course-instructor-name">{course.createdBy || 'Instructor'}</span>
          </div>
        </div>
        <div className="modern-course-progress-section">
          <span className="modern-course-progress-label">Course Progress</span>
          <span className="modern-course-progress-value">( {completed}% )</span>
          <div className="modern-course-progress-bar">
            <div className="modern-course-progress-bar-fill" style={{ width: `${completed}%` }}></div>
          </div>
          <span className="modern-course-progress-details">{completedLec} out of {lectLength} lectures completed</span>
        </div>
        <div className="modern-course-lectures-scroll">
          {[1,2,3,4,5].map((num) => (
            <div className="modern-course-lecture-card" key={num}>
              <div className="modern-course-lecture-title">Task {num}</div>
              <div className="modern-course-lecture-desc">Aws Introduction Fundamentals</div>
            </div>
          ))}
        </div>
        <div className="modern-course-actions">
          <Link to={`/lectures/${course._id}`}>
            <button className="modern-btn">Lectures</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseStudy;