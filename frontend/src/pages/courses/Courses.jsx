import React from 'react';
import "./courses.css";
import CourseCard from '../../components/coursecard/CourseCard';
import { CourseData } from '../../context/CourseContext';

const Courses = () => {
    const { courses } = CourseData();
    
    return (
        <div className="courses">
            <h2>Available Courses</h2>
            <div className="course-container">
                {courses && courses.length > 0 ? (
                    courses.map((course) => (
                        <CourseCard key={course._id} course={course} />
                    ))
                ) : (
                    <div className="placeholder-container">
                        <h3>Coming Soon!</h3>
                        <p>We're currently preparing some amazing courses for you.</p>
                        <p>Check back soon to explore our learning materials.</p>
                        <div className="placeholder-features">
                            <div className="feature">
                                <span>📚</span>
                                <p>Comprehensive Content</p>
                            </div>
                            <div className="feature">
                                <span>🎯</span>
                                <p>Practical Projects</p>
                            </div>
                            <div className="feature">
                                <span>👨‍🏫</span>
                                <p>Expert Instructors</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Courses;
