import React, { useState } from "react";
import "./header.css";
import { Link, useLocation } from "react-router-dom";
import { Bell, Trophy, User } from "lucide-react";
import ProfileModal from "../ProfileModal";
import { UserData } from "../../context/UserContext";

// Simple bell SVG icon
const BellIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
);

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleString();
}

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Courses", path: "/courses" },
  { name: "About", path: "/about" },
  { name: "Leaderboard", path: "/leaderboard", icon: <Trophy size={18} style={{ marginLeft: 4, color: '#FFD700' }} /> },
];

const Header = ({ isAuth, announcements = [], readAnnouncements = [], markAnnouncementRead }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [modal, setModal] = useState(null); // { message, timestamp }
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { user, setIsAuth, setUser } = UserData ? UserData() : { user: null, setIsAuth: () => {}, setUser: () => {} };
  // Filter out invalid announcements
  const validAnnouncements = announcements.filter(a => a && typeof a === 'object' && typeof a.message === 'string');
  const unreadCount = validAnnouncements.filter(a => !readAnnouncements.includes(a.id)).length;
  const location = useLocation();
  const handleAnnouncementClick = (a) => {
    setModal(a);
    if (markAnnouncementRead) markAnnouncementRead(a.id);
  };
  const logoutHandler = () => {
    localStorage.clear();
    setUser([]);
    setIsAuth(false);
    setShowProfileModal(false);
    window.location.href = "/login";
  };
  const goToDashboard = () => {
    setShowProfileModal(false);
    if (user?.role === "admin") {
      window.location.href = "/admin/dashboard";
    } else if (user?._id) {
      window.location.href = `/${user._id}/dashboard`;
    }
  };
  return (
    <header className="modern-header glassy-header">
      <div className="header-logo">Skill Nest</div>
      <nav className="header-nav">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`header-link${location.pathname === link.path ? " active" : ""}`}
          >
            {link.name} {link.icon && link.icon}
          </Link>
        ))}
      </nav>
      <div className="header-left-actions">
        {isAuth ? (
          <button
            className="header-profile-link"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4em', marginRight: '1.2em', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setShowProfileModal((v) => !v)}
          >
            <User size={20} style={{ marginBottom: '-2px' }} />
            Profile
          </button>
        ) : (
          <Link to="/login" className="header-login-btn" id="login">Login</Link>
        )}
        <div className="notification-bell-wrapper">
          <button type="button" className="notification-bell" onClick={() => setShowDropdown((v) => !v)} aria-label="Notifications">
            <BellIcon />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
          {showDropdown && (
            <div className="notification-dropdown">
              <div className="dropdown-title">Announcements</div>
              {validAnnouncements.length === 0 ? (
                <div className="dropdown-empty">No announcements yet.</div>
              ) : (
                validAnnouncements.map((a, i) => (
                  <div
                    className={`dropdown-announcement${readAnnouncements.includes(a.id) ? '' : ' unread'}`}
                    key={a.id || a._id || i}
                    onClick={() => handleAnnouncementClick(a)}
                  >
                    <div className="dropdown-announcement-msg">{a.message ? (a.message.length > 40 ? a.message.slice(0, 40) + '...' : a.message) : 'No message'}</div>
                    <div className="dropdown-announcement-time">{a.createdAt ? timeAgo(a.createdAt) : (a.timestamp ? timeAgo(a.timestamp) : '')}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      {modal && (
        <div className="announcement-modal-bg" onClick={() => setModal(null)}>
          <div className="announcement-modal-content" onClick={e => e.stopPropagation()}>
            <div className="announcement-modal-title">Announcement</div>
            <div className="announcement-modal-message">{modal.message}</div>
            <div className="announcement-modal-time">{modal.createdAt ? new Date(modal.createdAt).toLocaleString() : (modal.timestamp ? new Date(modal.timestamp).toLocaleString() : '')}</div>
            <button className="announcement-modal-close" onClick={() => setModal(null)}>Close</button>
          </div>
        </div>
      )}
      <ProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        logoutHandler={logoutHandler}
        goToDashboard={goToDashboard}
      />
    </header>
  );
};

export default Header;
