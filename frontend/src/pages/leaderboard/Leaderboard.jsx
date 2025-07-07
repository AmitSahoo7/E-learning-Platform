import React, { useEffect, useState, useRef } from "react";
import "./leaderboard.css";
import axios from "axios";
import { server } from "../../main";
import Loading from "../../components/loading/Loading";
import { toast } from "react-toastify";

// Simple Confetti burst component (CSS-based)
const Confetti = () => (
  <div className="confetti-container">
    {[...Array(48)].map((_, i) => (
      <div key={i} className={`confetti confetti-${i % 8}`}></div>
    ))}
  </div>
);

const Leaderboard = ({ user }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRanking, setUserRanking] = useState(null);
  const [userRewards, setUserRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);
  const particlesRef = useRef(null);

  useEffect(() => {
    fetchLeaderboard();
    if (user) {
      fetchUserRanking();
      fetchUserRewards();
    }
    // Confetti burst on load
    setShowConfetti(true);
    const confettiTimeout = setTimeout(() => setShowConfetti(false), 2200);
    // Parallax effect for particles
    const handleMouseMove = (e) => {
      if (!particlesRef.current) return;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 30; // max 15px left/right
      const y = (e.clientY / innerHeight - 0.5) * 30; // max 15px up/down
      particlesRef.current.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      clearTimeout(confettiTimeout);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [user]);

  const fetchLeaderboard = async () => {
    try {
      const { data } = await axios.get(`${server}/api/reward/leaderboard`);
      setLeaderboard(data.leaderboard);
    } catch (error) {
      toast.error("Failed to fetch leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRanking = async () => {
    try {
      const { data } = await axios.get(`${server}/api/reward/user/ranking`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setUserRanking(data);
    } catch (error) {
      console.log("Failed to fetch user ranking");
    }
  };

  const fetchUserRewards = async () => {
    try {
      const { data } = await axios.get(`${server}/api/reward/user/rewards`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setUserRewards(data.rewards);
    } catch (error) {
      console.log("Failed to fetch user rewards");
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    if (rank === 'Not Applicable' || rank === 'NA') return 'NA';
    return `#${rank}`;
  };

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case "video":
        return "📹";
      case "quiz":
        return "📝";
      case "assessment":
        return "🎯";
      default:
        return "⭐";
    }
  };

  const getRewardDisplay = (reward) => {
    if (reward.isQuizAttempt) {
      return {
        icon: reward.isSuccessful ? "✅" : "❌",
        description: reward.description,
        points: reward.isSuccessful ? `+${reward.points} pts` : "0 pts",
        className: reward.isSuccessful ? "reward-points" : "reward-points failed"
      };
    }
    return {
      icon: getActivityIcon(reward.activityType),
      description: reward.description,
      points: `+${reward.points} pts`,
      className: "reward-points"
    };
  };

  if (loading) return <Loading />;

  return (
    <div className="leaderboard-bg-wrapper">
      {/* Floating Particles */}
      <div className="floating-particles" ref={particlesRef}>
        {[...Array(18)].map((_, i) => (
          <div key={i} className={`particle particle-${i % 6}`}></div>
        ))}
      </div>
      {/* Floating Ornaments (orbs and sparkles) */}
      <div className="floating-ornaments">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="orb orb-4"></div>
        <div className="sparkle sparkle-1"></div>
        <div className="sparkle sparkle-2"></div>
        <div className="sparkle sparkle-3"></div>
      </div>
      {/* Confetti burst on load */}
      {showConfetti && <Confetti />}
      <div className="leaderboard-container">
        <div className="leaderboard-header">
          <h1>🏆 Leaderboard</h1>
          <p>Compete with other learners and earn points!</p>
        </div>

        <div className="leaderboard-content">
          {/* User Stats Section */}
          {user && userRanking && user.role !== 'admin' && user.role !== 'instructor' && (
            <div className="user-stats-section">
              <div className="user-stats-card">
                <div className="user-stats-header">
                  <h3>Your Progress</h3>
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="user-stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Rank</span>
                    <span className="stat-value rank-value">
                      {getRankIcon(userRanking.ranking)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Points</span>
                    <span className={`stat-value points-value`}>
                      {userRanking.totalPoints}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Out of</span>
                    <span className="stat-value">
                      {userRanking.totalUsers} users
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Section */}
          <div className="leaderboard-section">
            <h2>Top Learners</h2>
            <div className="leaderboard-list">
              {leaderboard.map((lbUser, index) => (
                <div
                  key={lbUser._id}
                  className={`leaderboard-item ${
                    user && lbUser._id === user._id ? "current-user" : ""
                  }`}
                >
                  <div className="rank-position">
                    {getRankIcon(index + 1)}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{lbUser.name}</div>
                    <div className={`user-points${(lbUser.role === 'admin' || lbUser.role === 'instructor') ? ' na' : ''}`}>
                      {(lbUser.role === 'admin' || lbUser.role === 'instructor') ? 'NA' : lbUser.totalPoints + ' points'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Rewards History */}
          {user && userRewards.length > 0 && user.role !== 'admin' && user.role !== 'instructor' && (
            <div className="rewards-section">
              <h2>Your Achievement History</h2>
              <div className="rewards-list">
                {userRewards.slice(0, 10).map((reward) => {
                  const display = getRewardDisplay(reward);
                  return (
                    <div key={reward._id} className="reward-item">
                      <div className="reward-icon">
                        {display.icon}
                      </div>
                      <div className="reward-details">
                        <div className="reward-description">
                          {display.description}
                        </div>
                        <div className="reward-meta">
                          <span className={display.className}>{display.points}</span>
                          <span className="reward-date">
                            {new Date(reward.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Points System Info */}
          <div className="points-info-section">
            <h2>How to Earn Points</h2>
            <div className="points-grid">
              <div className="point-item">
                <div className="point-icon">📹</div>
                <div className="point-details">
                  <h4>Video Completion</h4>
                  <p>1 point per video</p>
                </div>
              </div>
              <div className="point-item">
                <div className="point-icon">📝</div>
                <div className="point-details">
                  <h4>Quiz Success</h4>
                  <p>5 points per successful attempt (&gt;50%)</p>
                </div>
              </div>
              <div className="point-item">
                <div className="point-icon">🎯</div>
                <div className="point-details">
                  <h4>Final Assessment</h4>
                  <p>100 points per assessment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard; 