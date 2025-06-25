import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../Utils/Layout";
import axios from "axios";
import { server } from "../../main";
import CourseCard from "../../components/coursecard/CourseCard";
import "./dashboard.css";

const AdminDashbord = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalCourses: 0, totalLectures: 0, totalUsers: 0 });
  const [recentCourses, setRecentCourses] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [revenue, setRevenue] = useState({ today: 0, week: 0, month: 0 });
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState("Checking...");
  const [notes, setNotes] = useState(() => localStorage.getItem("adminNotes") || "");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const statsRes = await axios.get(`${server}/api/admin/stats`, {
          headers: { token: localStorage.getItem("token") },
        });
        setStats(statsRes.data.stats);
        // Fetch courses from admin endpoint
        let coursesRes = await axios.get(`${server}/api/admin/course`, {
          headers: { token: localStorage.getItem("token") },
        });
        let courses = coursesRes.data.courses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentCourses(courses);
        // Fetch users from admin endpoint
        let usersRes = await axios.get(`${server}/api/admin/users`, {
          headers: { token: localStorage.getItem("token") },
        });
        let users = usersRes.data.users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentUsers(users);
        // Payments & Revenue
        const paymentsRes = await axios.get(`${server}/api/admin/payments`, {
          headers: { token: localStorage.getItem("token") },
        });
        setRecentPayments(paymentsRes.data.payments);
        // Calculate revenue
        const now = new Date();
        let today = 0, week = 0, month = 0;
        paymentsRes.data.payments.forEach(p => {
          const d = new Date(p.createdAt);
          if (d.toDateString() === now.toDateString()) today += p.amount;
          if ((now - d) / (1000 * 60 * 60 * 24) < 7) week += p.amount;
          if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) month += p.amount;
        });
        setRevenue({ today, week, month });
        // Feedback/Support Tickets (fetch real feedback)
        const feedbackRes = await axios.get(`${server}/api/feedback`, {
          headers: { token: localStorage.getItem("token") },
        });
        setFeedbacks(feedbackRes.data.feedbacks);
        // System status
        await axios.get(`${server}/api/admin/stats`);
        setSystemStatus("Online");
      } catch (error) {
        setSystemStatus("Offline");
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Admin Notes (local only)
  const handleNotesChange = (e) => {
    setNotes(e.target.value);
    localStorage.setItem("adminNotes", e.target.value);
  };

  // Quick Actions
  const handleExport = () => {
    alert("Exporting data... (feature coming soon)");
  };
  const handleAnnouncement = () => {
    alert("Send announcement feature coming soon!");
  };

  // Send Announcement (mocked)
  const handleSendAnnouncement = async () => {
    alert("Announcement sent: " + announcement);
    setShowAnnouncement(false);
    setAnnouncement("");
    // You can POST to your backend here
  };

  return (
    <Layout>
      <div className="admin-dashboard-modern">
        {/* System Status */}
        <div className={`system-status ${systemStatus === "Online" ? "online" : "offline"}`}>System Status: {systemStatus}</div>
        {/* Welcome Section */}
        <div className="admin-welcome">
          <h1>Welcome, {user?.name || "Admin"}!</h1>
          <p>Manage your platform efficiently with the modern admin dashboard.</p>
        </div>

        {/* Stats Cards */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card stat-courses">
            <h3>Total Courses</h3>
            <p>{stats.totalCourses}</p>
          </div>
          <div className="admin-stat-card stat-lectures">
            <h3>Total Lectures</h3>
            <p>{stats.totalLectures}</p>
          </div>
          <div className="admin-stat-card stat-users">
            <h3>Total Users</h3>
            <p>{stats.totalUsers}</p>
          </div>
          <div className="admin-stat-card stat-revenue">
            <h3>Revenue</h3>
            <p>₹ --</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-quick-actions">
          <button className="quick-action-btn" onClick={() => navigate("/admin/course?add=true")}>Add New Course</button>
          <button className="quick-action-btn" onClick={() => setShowAnnouncement(true)}>Send Announcement</button>
          <button className="quick-action-btn" onClick={handleExport}>Export Data</button>
        </div>

        {/* Quick Links */}
        <div className="admin-quick-links">
          <Link to="/admin/dashboard" className="quick-link">Dashboard Home</Link>
          <Link to="/admin/course" className="quick-link">Manage Courses</Link>
          <Link to="/admin/users" className="quick-link">Manage Users</Link>
          <Link to="/account" className="quick-link">Account</Link>
        </div>

        {/* Main Widgets Row */}
        <div className="admin-main-widgets">
          {/* Recent Courses */}
          <div className="admin-widget recent-courses">
            <div className="widget-header">
              <h2>Recent Courses</h2>
              <Link to="/admin/course" className="see-all-link">See all</Link>
            </div>
            <div className="widget-content-cards">
              {recentCourses.length === 0 ? (
                <p>No courses yet.</p>
              ) : (
                <>
                  {recentCourses.slice(0, 2).map(course => (
                    <CourseCard key={course._id} course={course} />
                  ))}
                  {recentCourses.length > 2 && (
                    <button
                      className="show-more-btn"
                      onClick={() => navigate("/admin/course")}
                    >
                      Show More...
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          {/* Recent Users */}
          <div className="admin-widget recent-users">
            <div className="widget-header">
              <h2>Recent Users</h2>
              <Link to="/admin/users" className="see-all-link">See all</Link>
            </div>
            <div className="widget-content-users">
              {recentUsers.length === 0 ? (
                <p>No users yet.</p>
              ) : (
                <>
                  {recentUsers.slice(0, 2).map(u => (
                    <div key={u._id} className="user-list-item">
                      <span className="user-avatar">{u.name[0]}</span>
                      <span className="user-name">{u.name}</span>
                      <span className="user-email">{u.email}</span>
                    </div>
                  ))}
                  {recentUsers.length > 2 && (
                    <button
                      className="show-more-btn"
                      onClick={() => navigate("/admin/users")}
                    >
                      Show More...
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          {/* Recent Payments */}
          <div className="admin-widget recent-payments">
            <div className="widget-header">
              <h2>Recent Payments</h2>
              <Link to="/admin/payments" className="see-all-link">See all</Link>
            </div>
            <div className="widget-content-payments">
              {loading ? <p>Loading...</p> : recentPayments.length === 0 ? <p>No payments yet.</p> : recentPayments.map(p => (
                <div key={p._id} className="payment-list-item">
                  <span className="payment-user">{p.user?.name || "-"}</span>
                  <span className="payment-course">{p.course?.title || "-"}</span>
                  <span className="payment-amount">₹{p.amount || "-"}</span>
                  <span className="payment-date">{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Send Announcement */}
          <div className="admin-widget announcement-widget">
            <h2>Send Announcement</h2>
            <button className="quick-action-btn" onClick={() => setShowAnnouncement(true)}>
              Send Announcement
            </button>
            {showAnnouncement && (
              <div className="announcement-modal">
                <textarea
                  value={announcement}
                  onChange={e => setAnnouncement(e.target.value)}
                  placeholder="Write your announcement here..."
                  rows={5}
                />
                <button className="quick-action-btn" onClick={handleSendAnnouncement}>Send</button>
                <button className="quick-action-btn" onClick={() => setShowAnnouncement(false)}>Cancel</button>
              </div>
            )}
          </div>
          {/* Feedback/Support Tickets */}
          <div className="admin-widget feedback-widget">
            <h2>Latest Feedback / Support Tickets</h2>
            <div className="widget-content-feedbacks">
              {loading ? <p>Loading...</p> : feedbacks.length === 0 ? <p>No feedback yet.</p> : feedbacks.slice(0, 5).map(f => (
                <div key={f._id} className="feedback-list-item">
                  <span className="feedback-user">{f.user?.name || "-"}</span>
                  <span className="feedback-message">{f.message}</span>
                  <span className="feedback-date">{new Date(f.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashbord;
