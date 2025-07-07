import React from "react";
import "./courseCard.css";
import { server } from "../../main";
import { UserData } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { CourseData } from "../../context/CourseContext";
import { BiTime } from "react-icons/bi";
import { FaLayerGroup, FaUserCircle } from "react-icons/fa";

//const server = "http://localhost:5000";

const CourseCard = ({ course, hideDescription = false }) => {
  const navigate = useNavigate();
  const { user } = UserData();
  const { fetchCourses } = CourseData();

  const deleteHandler = async (id) => {
    if (confirm("Are you sure you want to delete this course")) {
      try {
        const { data } = await axios.delete(
          `${server}/api/admin/course/${id}`,
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          }
        );

        toast.success(data.message);
        fetchCourses();
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  return (
    <div className="course-card-new">
      <div className="course-image-container">
        <img
          src={
            course.image
              ? `${server}/${course.image.replace(/\\/g, "/")}`
              : "/default-course.png"
          }
          alt={course.title}
          className="course-image-new"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/default-course.png";
          }}
        />
      </div>

      <div className="course-info-new">
        <div className="course-meta">
          <span className="course-category">
            <FaLayerGroup /> {course.category}
          </span>
          <span className="course-duration-new">
            <BiTime /> {course.duration} weeks
          </span>
        </div>

        <h3 className="course-title-new">{course.title}</h3>
        {!hideDescription && (
          <p className="course-description-new">{course.description}</p>
        )}
        <div className="course-instructor-price">
          <div className="instructor-info">
            <FaUserCircle className="instructor-avatar" />
            <span>{course.instructorName || course.createdBy}</span>
          </div>
          <div className="price-info">
            <span className="original-price">₹{course.price + 100}</span>
            <span className="current-price">₹{course.price}</span>
          </div>
        </div>
      </div>

      {user && user.role === "admin" ? (
        <div className="admin-actions">
          <button
            onClick={() => navigate(`/course/study/${course._id}`)}
            className="common-btn-new study-btn"
          >
            Study
          </button>
          <button
            onClick={() => deleteHandler(course._id)}
            className="common-btn-new delete-btn"
          >
            Delete
          </button>
        </div>
      ) : (
        (() => {
          const isEnrolled = user && Array.isArray(user?.subscription) && user.subscription.includes(course._id);
          const isCourseInstructor = user && (
            user.role === 'admin' ||
            user.role === 'superadmin' ||
            (Array.isArray(course?.instructors) && course.instructors.map(String).includes(String(user._id)))
          );
          return (
            <button
              onClick={() => {
                if (user) {
                  if (isEnrolled || isCourseInstructor) {
                    if (course && course._id && /^[a-fA-F0-9]{24}$/.test(course._id)) {
                      navigate(`/course/study/${course._id}`);
                    } else {
                      toast.error("Invalid course ID");
                    }
                  } else {
                    if (course && course._id && /^[a-fA-F0-9]{24}$/.test(course._id)) {
                      navigate(`/course/${course._id}`);
                    } else {
                      toast.error("Invalid course ID");
                    }
                  }
                } else {
                  navigate("/login");
                }
              }}
              className="common-btn-new"
            >
              {(isEnrolled || isCourseInstructor)
                ? "Study Now"
                : "Get Started"}
            </button>
          );
        })()
      )}
    </div>
  );
};

export default CourseCard;
