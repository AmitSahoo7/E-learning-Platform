import React, { useRef, useEffect, useState } from "react";
import { MdDashboard } from "react-icons/md";
import { IoMdLogOut } from "react-icons/io";
import "../pages/account/account.css";

const ProfileModal = ({ open, onClose, user, logoutHandler, goToDashboard }) => {
  const modalRef = useRef();
  const [dashboardType, setDashboardType] = useState("admin");

  // Support both user.role (string) and user.roles (array)
  const isAdmin = user && (user.role === "admin" || (Array.isArray(user.roles) && user.roles.includes("admin")));
  const isInstructor = user && (user.role === "instructor" || (Array.isArray(user.roles) && user.roles.includes("instructor")));

  useEffect(() => {
    // Reset dashboardType when modal opens or user changes
    if (user) {
      if (isAdmin && !isInstructor) setDashboardType("admin");
      else if (!isAdmin && isInstructor) setDashboardType("instructor");
      else if (isAdmin && isInstructor) setDashboardType("admin");
      else setDashboardType(null);
    }
    // eslint-disable-next-line
  }, [user, open]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  if (!open) return null;

  // Generate avatar URL using DiceBear (initials)
  const avatarUrl = user
    ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || user.email)}`
    : "";
  const joined = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : null;

  // Custom goToDashboard for switch
  const handleDashboardClick = () => {
    if (dashboardType === "admin") {
      window.location.href = "/admin/dashboard";
    } else if (dashboardType === "instructor") {
      window.location.href = "/instructor/dashboard";
    } else if (user?._id) {
      window.location.href = `/${user._id}/dashboard`;
    }
  };

  return (
    <div className="profile-modal-bg">
      <div className="profile-modal-card" ref={modalRef}>
        <span className="profile-modal-pointer">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <polygon points="0,9 18,0 18,18" fill="#122036" stroke="#3ecf8e33" strokeWidth="1.5" />
          </svg>
        </span>
        <div className="avatar-container">
          <img src={avatarUrl} alt="User Avatar" className="profile-avatar" />
        </div>
        <h2 className="profile-title">My Profile</h2>
        <div className="profile-info">
          <p>
            <strong>{user.name}</strong>
          </p>
          <p>
            <strong>{user.email}</strong>
          </p>
          <p className="profile-role">Role: <span>{user.role || (user.roles && user.roles.join(", "))}</span></p>
          <p className="profile-points">Total Points: <span className="points-value">🏆 {user.totalPoints || 0}</span></p>
          {joined && <p className="profile-joined">Joined: <span>{joined}</span></p>}
        </div>
        <div className="profile-actions">
          {isAdmin && isInstructor ? (
            <>
              <div className="admin-actions-divider">Switch Dashboard</div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', justifyContent: 'center' }}>
                <button
                  className={`common-btn profile-btn${dashboardType === "admin" ? " active" : ""}`}
                  style={{ minWidth: 120, background: dashboardType === "admin" ? "#3ecf8e" : "#232a34", color: dashboardType === "admin" ? "#182848" : "#fff" }}
                  onClick={() => setDashboardType("admin")}
                >
                  Admin
                </button>
                <button
                  className={`common-btn profile-btn${dashboardType === "instructor" ? " active" : ""}`}
                  style={{ minWidth: 120, background: dashboardType === "instructor" ? "#3ecf8e" : "#232a34", color: dashboardType === "instructor" ? "#182848" : "#fff" }}
                  onClick={() => setDashboardType("instructor")}
                >
                  Instructor
                </button>
              </div>
              <button onClick={handleDashboardClick} className="common-btn profile-btn">
                <MdDashboard style={{ marginRight: 8 }} />
                {dashboardType === "admin" ? "Admin Dashboard" : "Instructor Dashboard"}
              </button>
            </>
          ) : isAdmin ? (
            <>
              <div className="admin-actions-divider">Admin Actions</div>
              <button onClick={handleDashboardClick} className="common-btn profile-btn">
                <MdDashboard style={{ marginRight: 8 }} /> Admin Dashboard
              </button>
            </>
          ) : isInstructor ? (
            <>
              <div className="admin-actions-divider">Instructor Actions</div>
              <button onClick={handleDashboardClick} className="common-btn profile-btn">
                <MdDashboard style={{ marginRight: 8 }} /> Instructor Dashboard
              </button>
            </>
          ) : (
            <button onClick={handleDashboardClick} className="common-btn profile-btn">
              <MdDashboard style={{ marginRight: 8 }} /> Dashboard
            </button>
          )}
          <button onClick={logoutHandler} className="common-btn profile-btn logout-btn">
            <IoMdLogOut style={{ marginRight: 8 }} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
// CSS will be added to match the floating, glassy, top-right modal style. 