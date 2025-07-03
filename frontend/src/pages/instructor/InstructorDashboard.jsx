import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { useNavigate } from "react-router-dom";
import "./instructorDashboard.css";

const BACKEND_URL = "http://localhost:4000"; // Change to your backend URL if different

const InstructorDashboard = () => {
  const [courseStats, setCourseStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalUsers, setModalUsers] = useState([]);
  const [modalCourseTitle, setModalCourseTitle] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourseStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/instructor/course-stats", {
          headers: { token },
        });
        console.log("API response:", res.data);
        // Accepts either { courseStats: [...] } or { courses: [...] }
        if (Array.isArray(res.data.courseStats)) {
          setCourseStats(res.data.courseStats);
        } else if (Array.isArray(res.data.courses)) {
          setCourseStats(res.data.courses);
        } else {
          setCourseStats([]);
        }
      } catch (err) {
        setError("Failed to load course statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseStats();
  }, []);

  const handleViewDetails = async (courseId, courseTitle) => {
    setShowModal(true);
    setModalCourseTitle(courseTitle);
    setModalLoading(true);
    setModalError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/instructor/course/${courseId}/users`, {
        headers: { token },
      });
      setModalUsers(res.data.userStats || []);
    } catch (err) {
      setModalError("Failed to load user details");
      setModalUsers([]);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalUsers([]);
    setModalCourseTitle("");
    setModalError(null);
  };

  // Prepare data for the bar chart
  const chartData = Array.isArray(courseStats)
    ? courseStats.map((course) => ({
        name: course.title,
        Enrolled: course.enrolledUsers || 0,
      }))
    : [];

  // Calculate chart width: 120px per bar, min 400px
  const chartWidth = Math.max(chartData.length * 120, 400);

  const handleEditCourse = (courseId) => {
    navigate('/admin/course');
  };

  return (
    <div className="instructor-dashboard-wrapper">
      <h2 className="instructor-dashboard-title">Instructor Dashboard</h2>
      {/* Bar Chart for Enrolled Users per Course */}
      {Array.isArray(chartData) && chartData.length > 1 && (
        <div className="dashboard-chart-scroll">
          <div className="dashboard-chart-container">
            <h3 className="dashboard-chart-title">Enrolled Users per Course</h3>
            <div style={{ width: "100%", overflowX: "auto" }}>
              <div style={{ minWidth: chartWidth }}>
                <BarChart width={chartWidth} height={300} data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 14 }} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Enrolled" fill="#34c759" radius={[8, 8, 0, 0]} />
                </BarChart>
              </div>
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <div className="loading">Loading course statistics...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : Array.isArray(courseStats) && courseStats.length === 0 ? (
        <div className="no-courses">No courses found.</div>
      ) : (
        <div className="instructor-courses-list">
          {Array.isArray(courseStats) &&
            courseStats.map((course) => (
              <div className="instructor-course-card" key={course._id}>
                {course.image && (
                  <div className="course-image-container">
                    <img
                      src={course.image.startsWith('http') ? course.image : `${BACKEND_URL}/${course.image}`}
                      alt={course.title}
                      className="course-image-thumb"
                    />
                    <div className="lecture-count-badge">
                      {course.totalLectures} Lectures
                    </div>
                  </div>
                )}
                <div className="instructor-course-title">{course.title}</div>
                <div className="instructor-course-stats">
                  <div className="stat-item">
                    <span className="stat-label">Enrolled Users:</span>
                    <span className="stat-value">{course.enrolledUsers}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Watch Time:</span>
                    <span className="stat-value">
                      {course.totalWatchTime} <span style={{ fontWeight: 400 }}>lecture views</span>
                    </span>
                  </div>
                </div>
                <div className="instructor-course-actions">
                  <button className="instructor-btn" onClick={() => handleViewDetails(course._id, course.title)}>
                    View Details
                  </button>
                  <button className="instructor-btn" onClick={() => handleEditCourse(course._id)}>
                    Edit Course
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Enrolled Users for {modalCourseTitle}</h3>
            {modalLoading ? (
              <div className="loading">Loading user details...</div>
            ) : modalError ? (
              <div className="error">{modalError}</div>
            ) : modalUsers.length === 0 ? (
              <div className="no-courses">No users enrolled.</div>
            ) : (
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Lectures Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {modalUsers.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.watchTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button className="close-modal-btn" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard; 