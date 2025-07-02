import React, { useEffect, useState } from "react";
import "./leaderboard.css";
import axios from "axios";
import { server } from "../../main";
import Loading from "../../components/loading/Loading";
import { toast } from "react-toastify";

const Leaderboard = ({ user }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRanking, setUserRanking] = useState(null);
  const [userRewards, setUserRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    if (user) {
      fetchUserRanking();
      fetchUserRewards();
    }
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

  if (loading) return <Loading />;

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1>🏆 Leaderboard</h1>
        <p>Compete with other learners and earn points!</p>
      </div>

      <div className="leaderboard-content">
        {/* User Stats Section */}
        {user && userRanking && (
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
                  <span className="stat-value points-value">
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
            {leaderboard.map((user, index) => (
              <div
                key={user._id}
                className={`leaderboard-item ${
                  user._id === user?._id ? "current-user" : ""
                }`}
              >
                <div className="rank-position">
                  {getRankIcon(index + 1)}
                </div>
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <div className="user-points">
                    {user.totalPoints} points
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Rewards History */}
        {user && userRewards.length > 0 && (
          <div className="rewards-section">
            <h2>Your Achievement History</h2>
            <div className="rewards-list">
              {userRewards.slice(0, 10).map((reward) => (
                <div key={reward._id} className="reward-item">
                  <div className="reward-icon">
                    {getActivityIcon(reward.activityType)}
                  </div>
                  <div className="reward-details">
                    <div className="reward-description">
                      {reward.description}
                    </div>
                    <div className="reward-meta">
                      <span className="reward-points">+{reward.points} pts</span>
                      <span className="reward-date">
                        {new Date(reward.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
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
                <h4>Quiz Completion</h4>
                <p>10 points per quiz</p>
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
  );
};

export default Leaderboard; 