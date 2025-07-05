import React from "react";
import "./courses.css";
import { CourseData } from "../../context/CourseContext";
import CourseCard from "../../components/coursecard/CourseCard";

const Courses = () => {
  const { courses } = CourseData();

  console.log(courses);
  return (
    <div className="courses-main-wrapper">
      <section className="courses-section-glow-bg">
        <div className="courses-content-modern">
          <h2 className="courses-title-gradient">All Courses</h2>
          <div className="course-container">
            {courses && courses.length > 0 ? (
              courses.map((e) => <CourseCard key={e._id} course={e} />)
            ) : (
              <p>No Courses Yet!</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Courses;
