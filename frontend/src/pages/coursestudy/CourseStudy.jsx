import React, { useEffect } from "react";
import "./coursestudy.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import { server } from "../../main";

const CourseStudy = ({ user }) => {
  const params = useParams();
  const { fetchCourse, course } = CourseData();
  const navigate = useNavigate();

  if (user && user.role !== "admin" && !user.subscription.includes(params.id))
    return navigate("/");

  useEffect(() => {
    fetchCourse(params.id);
    // eslint-disable-next-line
  }, []);

  if (!course) return null;

  return (
    <div className="course-study-page">
      <div className="course-study-content">
        <img
          src={`${server}/${course.image}`}
          alt={course.title}
          className="course-study-image"
        />
        <h2 className="course-study-title">{course.title}</h2>
        <p className="course-study-description">{course.description}</p>
        <div className="course-study-meta">
          <span>by - {course.createdBy}</span>
          <span>Duration - {course.duration} weeks</span>
        </div>
        <Link to={`/lectures/${course._id}`}>
          <button className="course-study-lectures-btn">Lectures</button>
        </Link>
      </div>
    </div>
  );
};

export default CourseStudy;