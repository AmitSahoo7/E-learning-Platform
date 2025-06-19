import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserData } from '../../context/UserContext';
import axios from 'axios';
import "./courseCard.css";

const server = "http://localhost:5000";

const CourseCard = ({course}) => {
  const navigate = useNavigate();
  const { user, isAuth } = UserData();

  const deleteHandler = async (id) => {
    try {
      const { data } = await axios.delete(`${server}/api/course/${id}`);
      if (data.success) {
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="course-card">
      <img src={`${server}/${course.image}`} alt="" className="course-image" />
      <h3>{course.title}</h3>
      <p>Instructor- {course.createdBy}</p>
      <p>Duration- {course.duration} weeks</p>
      <p>Price- ₹{course.price}</p>
      {isAuth ? (
        <>
          {user && user.role !== "admin" ? (
            <>
              {user.subscription.includes(course._id) ? (
                <button
                  onClick={() => navigate(`/course/study/${course._id}`)}
                  className="common-btn"
                >
                  Study
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/course/${course._id}`)}
                  className="common-btn"
                >
                  Get Started
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => navigate(`/course/study/${course._id}`)}
              className="common-btn"
            >
              Study
            </button>
          )}
        </>
      ) : (
        <button onClick={() => navigate("/login")} className="common-btn">
          Get Started
        </button>
      )}

      <br />

      {user && user.role === "admin" && (
        <button
          onClick={() => deleteHandler(course._id)}
          className="common-btn"
          style={{ background: "red" }}
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default CourseCard;
