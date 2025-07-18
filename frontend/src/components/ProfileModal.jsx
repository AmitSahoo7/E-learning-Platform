import React, { useRef, useEffect, useState } from "react";
import { MdDashboard } from "react-icons/md";
import { IoMdLogOut } from "react-icons/io";
import "../pages/account/account.css";
import axios from "axios";
import { server } from "../main";

const ProfileModal = ({ open, onClose, user, logoutHandler, goToDashboard, canEdit = false }) => {
  const modalRef = useRef();
  const [dashboardType, setDashboardType] = useState("admin");
  const [rewardsTotalPoints, setRewardsTotalPoints] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editMobile, setEditMobile] = useState(user?.mobile || "");
  const [editPhoto, setEditPhoto] = useState(null);
  const [saving, setSaving] = useState(false);

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
    if (open) {
      setEditMode(false);
      setEditName(user?.name || "");
      setEditMobile(user?.mobile || "");
      setEditPhoto(null);
    }
  }, [open, user]);

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

  useEffect(() => {
    if (!open || !user) return;
    const fetchPoints = async () => {
      try {
        const res = await axios.get(`${server}/api/reward/user/rewards`, {
          headers: { token: localStorage.getItem("token") }
        });
        setRewardsTotalPoints(res.data.totalPoints || 0);
      } catch {
        setRewardsTotalPoints(user.totalPoints || 0);
      }
    };
    fetchPoints();
  }, [open, user]);

  if (!open) return null;

  // Generate avatar URL using DiceBear (initials)
  const avatarUrl = user
    ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || user.email)}`
    : "";
  const joined = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : null;

  // Show user photo if available, else fallback to avatarUrl
  const photoUrl = user?.photo ? `${server}/${user.photo}` : avatarUrl;

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

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", editName);
      formData.append("mobile", editMobile);
      if (editPhoto) formData.append("photo", editPhoto);
      await axios.patch(`${server}/api/user/update-profile`, formData, {
        headers: { token: localStorage.getItem("token") }
      });
      setEditMode(false);
      window.location.reload();
    } catch (e) {
      alert("Failed to update profile");
    } finally {
      setSaving(false);
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
          <img src={editMode && editPhoto ? URL.createObjectURL(editPhoto) : photoUrl} alt="User Avatar" className="profile-avatar" />
        </div>
        <h2 className="profile-title">My Profile</h2>
        <div className="profile-info">
          {editMode ? (
            <>
              <label style={{ color: '#3ecf8e', fontWeight: 600 }}>Name:</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1.5px solid #3ecf8e', marginBottom: 12, fontSize: '1rem' }}
                disabled={saving}
              />
              <label style={{ color: '#3ecf8e', fontWeight: 600 }}>Mobile:</label>
              <input
                type="tel"
                value={editMobile}
                onChange={e => setEditMobile(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1.5px solid #3ecf8e', marginBottom: 12, fontSize: '1rem' }}
                disabled={saving}
              />
              <label style={{ color: '#3ecf8e', fontWeight: 600 }}>Photo:</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setEditPhoto(e.target.files[0])}
                style={{ marginBottom: 12 }}
                disabled={saving}
              />
            </>
          ) : (
            <>
              <p><strong>{user.name}</strong></p>
              {user.mobile && <p><strong>Mobile: {user.mobile}</strong></p>}
            </>
          )}
          <p><strong>{user.email}</strong></p>
          <p className="profile-role">Role: <span>{user.role === "user" ? "Student" : (user.role || (user.roles && user.roles.join(", ")))}</span></p> {/* 'user' role is displayed as 'Student' for clarity; see code comment for mapping. */}
          <p className="profile-points">Total Points: <span className="points-value">🏆 {rewardsTotalPoints !== null ? rewardsTotalPoints : (user.totalPoints || 0)}</span></p>
          {joined && <p className="profile-joined">Joined: <span>{joined}</span></p>}
        </div>
        <div className="profile-actions">
          {canEdit && !editMode && (
            <button className="common-btn profile-btn" style={{ background: '#3ecf8e', color: '#182848', marginBottom: 8 }} onClick={() => setEditMode(true)}>
              Edit Profile
            </button>
          )}
          {editMode && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <button className="common-btn profile-btn" style={{ background: '#3ecf8e', color: '#182848' }} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button className="common-btn profile-btn" style={{ background: '#232a34', color: '#fff' }} onClick={() => setEditMode(false)} disabled={saving}>
                Cancel
              </button>
            </div>
          )}
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