import React, { useState, useEffect } from "react";
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
  { name: "Webinar", path: "/webinar" },
  { name: "About", path: "/about" },
  { name: "Leaderboard", path: "/leaderboard", icon: <Trophy size={18} style={{ marginLeft: 4, color: '#FFD700' }} /> },
];

const Header = ({ isAuth, announcements = [], readAnnouncements = [], markAnnouncementRead }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [modal, setModal] = useState(null); // { message, timestamp }
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [clearedIds, setClearedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('clearedAnnouncements') || '[]');
    } catch {
      return [];
    }
  });
  const [liveAnnouncements, setLiveAnnouncements] = useState(announcements);
  const { user, setIsAuth, setUser } = UserData ? UserData() : { user: null, setIsAuth: () => {}, setUser: () => {} };
  // Filter out invalid announcements
  const validAnnouncements = liveAnnouncements.filter(a => a && typeof a === 'object' && typeof a.message === 'string' && !clearedIds.includes(a._id));
  const unreadCount = validAnnouncements.filter(a => !readAnnouncements.includes(a._id)).length;
  const location = useLocation();

  const handleAnnouncementClick = (a) => {
    setModal(a);
    if (markAnnouncementRead) markAnnouncementRead(a._id);
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
    } else if (user?.role === "instructor") {
      window.location.href = "/instructor/dashboard";
    } else if (user?._id) {
      window.location.href = `/${user._id}/dashboard`;
    }
  };
  const handleClearAll = () => {
    const allIds = validAnnouncements.map(a => a._id);
    localStorage.setItem('readAnnouncements', JSON.stringify(allIds));
    localStorage.setItem('clearedAnnouncements', JSON.stringify([...clearedIds, ...allIds]));
    setClearedIds(prev => [...prev, ...allIds]);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }
    if (typeof markAnnouncementRead === 'function') {
      markAnnouncementRead('__all__');
    }
  };
  // Add read all handler
  const handleReadAll = () => {
    const unreadIds = validAnnouncements.filter(a => !readAnnouncements.includes(a._id)).map(a => a._id);
    const updated = [...readAnnouncements, ...unreadIds];
    localStorage.setItem('readAnnouncements', JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }
    if (typeof markAnnouncementRead === 'function') {
      markAnnouncementRead('__all__');
    }
  };
  // Add per-announcement read and clear handlers
  const handleReadOne = (id) => {
    if (!readAnnouncements.includes(id)) {
      const updated = [...readAnnouncements, id];
      localStorage.setItem('readAnnouncements', JSON.stringify(updated));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
      }
      if (typeof markAnnouncementRead === 'function') {
        markAnnouncementRead(id);
      }
    }
  };
  const handleClearOne = (id) => {
    if (!clearedIds.includes(id)) {
      const updated = [...clearedIds, id];
      localStorage.setItem('clearedAnnouncements', JSON.stringify(updated));
      setClearedIds(updated);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
      }
    }
  };
  // Poll for new announcements every 10 seconds
  useEffect(() => {
    setLiveAnnouncements(announcements);
    const interval = setInterval(() => {
      // Optionally, fetch announcements from backend here if not passed as prop
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [announcements]);
  return (
    <header className="modern-header glassy-header">
      <div className="header-logo">SkillNest</div>
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
              {validAnnouncements.length > 0 && (
                <>
                  <button className="clear-all-btn" onClick={handleClearAll} style={{marginBottom:'8px',float:'right',background:'#10b981',color:'#fff',border:'none',borderRadius:'4px',padding:'4px 10px',cursor:'pointer'}}>Clear All</button>
                  {unreadCount > 0 && (
                    <button className="clear-all-btn" onClick={handleReadAll} style={{marginBottom:'8px',marginRight:'8px',float:'right',background:'#3b82f6',color:'#fff',border:'none',borderRadius:'4px',padding:'4px 10px',cursor:'pointer'}}>Read All</button>
                  )}
                </>
              )}
              {validAnnouncements.length === 0 ? (
                <div className="dropdown-empty">No announcements yet.</div>
              ) : (
                validAnnouncements.map((a, i) => (
                  <div
                    className={`dropdown-announcement${readAnnouncements.includes(a._id) ? '' : ' unread'}`}
                    key={a._id || i}
                    onClick={() => handleAnnouncementClick(a)}
                  >
                    <div className="dropdown-announcement-msg">{a.message ? (a.message.length > 40 ? a.message.slice(0, 40) + '...' : a.message) : 'No message'}</div>
                    <div className="dropdown-announcement-time">{a.createdAt ? timeAgo(a.createdAt) : (a.timestamp ? timeAgo(a.timestamp) : '')}</div>
                    <div style={{display:'flex',gap:'6px',marginTop:'4px'}}>
                      {!readAnnouncements.includes(a._id) && (
                        <button className="clear-all-btn" style={{background:'#10b981',color:'#fff',border:'none',borderRadius:'4px',padding:'2px 8px',fontSize:'0.85em',cursor:'pointer'}} onClick={e => {e.stopPropagation(); handleReadOne(a._id);}}>Read</button>
                      )}
                      <button className="clear-all-btn" style={{background:'#10b981',color:'#fff',border:'none',borderRadius:'4px',padding:'2px 8px',fontSize:'0.85em',cursor:'pointer'}} onClick={e => {e.stopPropagation(); handleClearOne(a._id);}}>Clear</button>
                    </div>
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
