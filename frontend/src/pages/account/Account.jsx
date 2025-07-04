import React from "react";
import { MdDashboard } from "react-icons/md";
import "./account.css";
import { IoMdLogOut } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { UserData } from "../../context/UserContext";
import toast from "react-hot-toast";

const Account = ({ user }) => {
  const { setIsAuth, setUser } = UserData();
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.clear();
    setUser([]);
    setIsAuth(false);
    toast.success("Logout Successfully");
    navigate("/login");
  };

  // Generate avatar URL using DiceBear (initials)
  const avatarUrl = user
    ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || user.email)}`
    : "";

  // Format joined date if available
  const joined = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : null;
  
  return (
    <div className="account-bg">
      {user && (
        <div className="profile">
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
            <p className="profile-points">Total Points: <span className="points-value">🏆 {(user.role === 'admin' || user.role === 'instructor') ? 'Not Applicable' : (user.totalPoints || 0)}</span></p>
            {joined && <p className="profile-joined">Joined: <span>{joined}</span></p>}
          </div>
          <div className="profile-actions">
            {user.role === "admin" || user.role === "superadmin" ? (
              <>
                <div className="admin-actions-divider">Admin Actions</div>
                <button
                  onClick={() => navigate(`/admin/dashboard`)}
                  className="common-btn profile-btn"
                >
                  <MdDashboard style={{ marginRight: 8 }} /> Admin Dashboard
                </button>
                <button
                  onClick={() => navigate(`/instructor/dashboard`)}
                  className="common-btn profile-btn"
                >
                  <MdDashboard style={{ marginRight: 8 }} /> Instructor Dashboard
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate(`/${user._id}/dashboard`)}
                className="common-btn profile-btn"
              >
                <MdDashboard style={{ marginRight: 8 }} /> Dashboard
              </button>
            )}
            <button
              onClick={logoutHandler}
              className="common-btn profile-btn logout-btn"
            >
              <IoMdLogOut style={{ marginRight: 8 }} /> Logout
            </button>
          </div>
        </div>
  )}
    </div>
  );
};

export default Account;