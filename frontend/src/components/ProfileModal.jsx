import React, { useRef, useEffect } from "react";
import { MdDashboard } from "react-icons/md";
import { IoMdLogOut } from "react-icons/io";
import "../pages/account/account.css";

const ProfileModal = ({ open, onClose, user, logoutHandler, goToDashboard }) => {
  const modalRef = useRef();

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
          <p className="profile-role">Role: <span>{user.role}</span></p>
          <p className="profile-points">Total Points: <span className="points-value">🏆 {user.totalPoints || 0}</span></p>
          {joined && <p className="profile-joined">Joined: <span>{joined}</span></p>}
        </div>
        <div className="profile-actions">
          {user.role === "admin" ? (
            <>
              <div className="admin-actions-divider">Admin Actions</div>
              <button onClick={goToDashboard} className="common-btn profile-btn">
                <MdDashboard style={{ marginRight: 8 }} /> Admin Dashboard
              </button>
            </>
          ) : (
            <button onClick={goToDashboard} className="common-btn profile-btn">
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