import React from 'react';
import "./courses.css";
import CourseCard from '../../components/coursecard/CourseCard';
import { CourseData } from '../../context/CourseContext';

const Courses = () => {
    const { courses, loading } = CourseData();

    if (loading) {
        return (
            <div className="courses">
                <h2>Loading Courses...</h2>
            </div>
        );
    }

    // Always show the placeholder if there are no courses (including error case)
    if (!courses || courses.length === 0) {
        return (
            <div className="courses">
                <h2>Available Courses</h2>
                <div className="course-container">
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
                </div>
            </div>
        );
    }

    return (
        <div className="courses">
            <h2>Available Courses</h2>
            <div className="course-container">
                {courses.map((course) => (
                    <CourseCard key={course._id} course={course} />
                ))}
            </div>
        </div>
    );
};

export default Courses;
