import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import "./header.css";
import { Link, useLocation } from "react-router-dom";
import { Bell, Trophy, User, ChevronUp, ChevronDown, Menu, X } from "lucide-react";
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
  { name: "Webinars", path: "/webinar" },
  { name: "About", path: "/about" },
  { name: "Leaderboard", path: "/leaderboard", icon: <Trophy size={18} style={{ marginLeft: 4, color: '#FFD700' }} /> },
];

const Header = ({ isAuth, announcements = [], markAnnouncementRead, markAnnouncementCleared }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [modal, setModal] = useState(null); // { message, timestamp }
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [liveAnnouncements, setLiveAnnouncements] = useState(announcements);
  const dropdownRef = useRef(null);
  const dropdownContentRef = useRef(null);
  const { user, setIsAuth, setUser } = UserData ? UserData() : { user: null, setIsAuth: () => {}, setUser: () => {} };
  const bellRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 60, right: 20 });
  // Only show announcements that are not cleared
  const validAnnouncements = liveAnnouncements.filter(a => a && typeof a === 'object' && typeof a.message === 'string' && !a.isCleared);
  const unreadCount = validAnnouncements.filter(a => !a.isRead).length;
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Close mobile menu on Escape or outside click
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    const handleClick = (e) => {
      if (e.target.classList.contains("mobile-menu-overlay")) setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [mobileMenuOpen]);

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
    if (markAnnouncementCleared) markAnnouncementCleared("__all__");
  };
  const handleReadAll = () => {
    if (markAnnouncementRead) markAnnouncementRead("__all__");
  };
  const handleReadOne = (id) => {
    if (markAnnouncementRead) markAnnouncementRead(id);
  };
  const handleClearOne = (id) => {
    if (markAnnouncementCleared) markAnnouncementCleared(id);
  };
  // Poll for new announcements every 10 seconds
  useEffect(() => {
    setLiveAnnouncements(announcements);
    const interval = setInterval(() => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [announcements]);

  // Update dropdown position when opened
  useEffect(() => {
    if (showDropdown && bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8, // 8px below the bell
        right: window.innerWidth - rect.right
      });
    }
  }, [showDropdown]);

  // Dropdown JSX
  const dropdownJSX = (
    <div
      className="notification-dropdown"
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: dropdownPos.top,
        right: dropdownPos.right,
        left: 'auto',
        zIndex: 9999
      }}
    >
      <div className="dropdown-title">Announcements</div>
      {validAnnouncements.length > 0 && (
        <div className="dropdown-actions-row">
          <button className="dropdown-action-btn" onClick={handleClearAll}>Clear All</button>
          {unreadCount > 0 && (
            <button className="dropdown-action-btn" onClick={handleReadAll}>Read All</button>
          )}
        </div>
      )}
      {validAnnouncements.length === 0 ? (
        <div className="dropdown-empty">No announcements yet.</div>
      ) : (
        <div className="dropdown-content" ref={dropdownContentRef}>
          {validAnnouncements.map((a, i) => (
            <div
              className={`dropdown-announcement${a.isRead ? '' : ' unread'}`}
              key={a._id || i}
              onClick={() => handleAnnouncementClick(a)}
            >
              <div className="dropdown-announcement-msg">{a.message ? (a.message.length > 40 ? a.message.slice(0, 40) + '...' : a.message) : 'No message'}</div>
              <div className="dropdown-announcement-time">{a.createdAt ? timeAgo(a.createdAt) : (a.timestamp ? timeAgo(a.timestamp) : '')}</div>
              <div style={{display:'flex',gap:'6px',marginTop:'4px'}}>
                {!a.isRead && (
                  <button className="clear-all-btn" style={{background:'#10b981',color:'#fff',border:'none',borderRadius:'4px',padding:'2px 8px',fontSize:'0.85em',cursor:'pointer'}} onClick={e => {e.stopPropagation(); handleReadOne(a._id);}}>Read</button>
                )}
                <button className="clear-all-btn" style={{background:'#10b981',color:'#fff',border:'none',borderRadius:'4px',padding:'2px 8px',fontSize:'0.85em',cursor:'pointer'}} onClick={e => {e.stopPropagation(); handleClearOne(a._id);}}>Clear</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <header className="modern-header glassy-header">
      {/* Hamburger for mobile */}
      <button
        className="header-hamburger"
        aria-label="Open menu"
        onClick={() => setMobileMenuOpen(true)}
      >
        <Menu size={28} />
      </button>
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
          <button
            type="button"
            className="notification-bell"
            ref={bellRef}
            onClick={() => setShowDropdown((v) => !v)}
            aria-label="Notifications"
          >
            <BellIcon />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
        </div>
      </div>
      {/* Mobile Side Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.18)', zIndex: 99999 }}>
          <aside className="mobile-menu-drawer">
            <button className="mobile-menu-close" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)}>
              <X size={28} />
            </button>
            <div className="mobile-menu-logo">SkillNest</div>
            <nav className="mobile-menu-nav">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`mobile-menu-link${location.pathname === link.path ? " active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name} {link.icon && link.icon}
                </Link>
              ))}
            </nav>
            <div className="mobile-menu-actions">
              {isAuth ? (
                <button
                  className="mobile-menu-profile"
                  onClick={() => { setShowProfileModal(true); setMobileMenuOpen(false); }}
                >
                  <User size={20} style={{ marginBottom: '-2px' }} /> Profile
                </button>
              ) : (
                <Link to="/login" className="mobile-menu-login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              )}
              <button
                type="button"
                className="mobile-menu-bell"
                onClick={() => { setShowDropdown((v) => !v); setMobileMenuOpen(false); }}
                aria-label="Notifications"
              >
                <BellIcon />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>
            </div>
          </aside>
        </div>
      )}
      {showDropdown && ReactDOM.createPortal(dropdownJSX, document.body)}
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
