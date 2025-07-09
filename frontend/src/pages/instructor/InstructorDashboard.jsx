import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { useNavigate } from "react-router-dom";
import "./instructorDashboard.css";
import { FaChalkboardTeacher } from "react-icons/fa";

const BACKEND_URL = "http://localhost:4000"; // Change to your backend URL if different

const InstructorDashboard = ({ user }) => {
  // Prefer user prop, fallback to localStorage
  let instructorName = "Instructor";
  if (user && user.name) {
    instructorName = user.name;
  } else {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        if (userObj && userObj.name) instructorName = userObj.name;
      } catch {}
    }
  }
  const [courseStats, setCourseStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalUsers, setModalUsers] = useState([]);
  const [modalCourseTitle, setModalCourseTitle] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [animatedChartData, setAnimatedChartData] = useState([]);
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(instructorName);
  const [editPhoto, setEditPhoto] = useState(null);
  const fileInputRef = useRef();

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

  // Animated bar chart effect
  useEffect(() => {
    if (!chartData.length) return;
    let progress = 0;
    const max = 30; // number of animation steps
    const interval = 18; // ms per step
    const target = chartData.map(d => d.Enrolled);
    let animFrame;
    function animate() {
      progress++;
      setAnimatedChartData(
        chartData.map((d, i) => ({
          ...d,
          Enrolled: Math.round(target[i] * Math.min(progress / max, 1)),
        }))
      );
      if (progress < max) {
        animFrame = setTimeout(animate, interval);
      }
    }
    setAnimatedChartData(chartData.map(d => ({ ...d, Enrolled: 0 })));
    animate();
    return () => clearTimeout(animFrame);
  }, [JSON.stringify(chartData)]);

  // Calculate chart width: 120px per bar, min 400px
  const chartWidth = Math.max(chartData.length * 120, 400);

  const handleManageLecture = (courseId) => {
    navigate(`/lectures/${courseId}`);
  };

  return (
    <div className="instructor-dashboard-wrapper" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Floating particles background */}
      <div className="floating-particles-bg">
        {[...Array(18)].map((_, i) => (
          <div key={i} className="floating-particle" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 6}s` }} />
        ))}
      </div>
      
      <h2 className="instructor-dashboard-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, fontSize: 36, fontWeight: 700, color: '#3ecf8e', margin: '0 auto 18px auto', textAlign: 'center', textShadow: '0 0 16px #3ecf8e55' }}>
        Instructor Dashboard
      </h2>
      <h3 className="instructor-greeting" style={{ color: '#3ecf8e', marginBottom: 32, fontWeight: 500, fontSize: 24, textShadow: '0 0 8px #3ecf8e55', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 28, color: '#3ecf8e', filter: 'drop-shadow(0 0 8px #3ecf8e88)' }}>👋</span>
        Welcome back, {instructorName}!
      </h3>
      {/* Bar Chart for Enrolled Users per Course */}
      {Array.isArray(chartData) && chartData.length > 1 && (
        <div className="dashboard-chart-scroll">
          <div className="dashboard-chart-container">
            <h3 className="dashboard-chart-title">Enrolled Users per Course</h3>
            <div style={{ width: "100%", overflowX: "auto" }}>
              <div style={{ minWidth: chartWidth }}>
                <BarChart width={chartWidth} height={300} data={animatedChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
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
                    <span className="stat-label">Total Lectures Viewed:</span>
                    <span className="stat-value">
                      {course.totalWatchTime} <span style={{ fontWeight: 400 }}> views</span>
                    </span>
                  </div>
                </div>
                <div className="instructor-course-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="instructor-btn" onClick={() => handleViewDetails(course._id, course.title)}>
                    View Details
                  </button>
                  <button className="instructor-btn" onClick={() => handleManageLecture(course._id)}>
                    Manage Lectures/Quizzes
                  </button>
                  <button className="instructor-btn" onClick={() => navigate(`/instructor/course/${course._id}/assessments`)}>
                    Manage Assessment
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
                    <th>Assessment Score</th>
                  </tr>
                </thead>
                <tbody>
                  {modalUsers.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.watchTime}</td>
                      <td>{user.assessmentScore !== null && user.assessmentScore !== undefined ? user.assessmentScore : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button className="close-modal-btn" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
      <style>{`
        .floating-particles-bg {
          position: absolute;
          top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 0;
        }
        .floating-particle {
          position: absolute;
          bottom: -40px;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: radial-gradient(circle, #3ecf8e 60%, #232a34 100%);
          opacity: 0.18;
          animation: floatUp 6s linear infinite;
        }
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 0.18; }
          60% { opacity: 0.32; }
          100% { transform: translateY(-90vh) scale(1.2); opacity: 0; }
        }
        @keyframes bounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-10px); }
        }
        .glassy-card:hover {
          box-shadow: 0 0 48px 0 #3ecf8e99, 0 2px 16px 0 #000a;
          border-color: #3ecf8e88;
          background: linear-gradient(135deg, #232a34ee 60%, #3ecf8e22 100%);
        }
      `}</style>
    </div>
  );
};

export default InstructorDashboard; 