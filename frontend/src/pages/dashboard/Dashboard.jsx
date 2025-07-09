import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { server } from '../../main';
import CourseCard from '../../components/coursecard/CourseCard';
import { CourseData } from '../../context/CourseContext';
import { UserData } from '../../context/UserContext';
import Loading from '../../components/loading/Loading';
import "./dashboard.css";
import { 
  FaTrophy, 
  FaFire, 
  FaClock, 
  FaBookOpen, 
  FaCheckCircle, 
  FaChartLine,
  FaMedal,
  FaPlay,
  FaBullseye,
  FaCalendarAlt,
  FaCog,
  FaEdit,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import { BiBook } from 'react-icons/bi';
import { MdTrendingUp } from 'react-icons/md';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Modal from '../../components/Modal';
import ProfileModal from '../../components/ProfileModal';

const Dashboard = () => {
  const { mycourse } = CourseData();
  const { user } = UserData();
  const navigate = useNavigate();
  
  // State for dashboard data
  const [dashboardStats, setDashboardStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalPoints: 0,
    learningStreak: 0,
    totalTimeSpent: 0,
    currentRank: 0,
    totalUsers: 0
  });
  
  const [courseProgress, setCourseProgress] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [learningAnalytics, setLearningAnalytics] = useState({
    weeklyProgress: [],
    quizScores: [],
    videoCompletion: []
  });
  const [loading, setLoading] = useState(true);
  const [userRewards, setUserRewards] = useState([]);
  const [rewardsTotalPoints, setRewardsTotalPoints] = useState(0);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [studyGoals, setStudyGoals] = useState({
    dailyGoal: 30, // minutes
    weeklyGoal: 5, // courses to work on
    monthlyGoal: 2 // courses to complete
  });
  const [todayLectureMinutes, setTodayLectureMinutes] = useState(0);
  const [editingDailyGoal, setEditingDailyGoal] = useState(false);
  const [newDailyGoal, setNewDailyGoal] = useState(studyGoals.dailyGoal);
  const [savingGoal, setSavingGoal] = useState(false);
  const [calendarActivityDates, setCalendarActivityDates] = useState([]); // ISO strings
  const [calendarGoalDates, setCalendarGoalDates] = useState([]); // ISO strings
  const [calendarEventDates, setCalendarEventDates] = useState([]); // ISO strings
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayDetails, setSelectedDayDetails] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Calculate quiz points from userRewards
  const quizPoints = userRewards
    .filter(r => r.activityType === 'quiz')
    .reduce((sum, r) => sum + (r.points || 0), 0);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch user stats
        try {
          const statsRes = await axios.get(`${server}/api/user/dashboard-stats`, {
            headers: { token: localStorage.getItem("token") }
          });
          setDashboardStats(statsRes.data);
        } catch (error) {
          console.log("Using fallback stats data");
          setDashboardStats({
            totalCourses: mycourse?.length || 0,
            completedCourses: 0,
            totalPoints: user?.totalPoints || 0,
            learningStreak: 3,
            totalTimeSpent: 45,
            currentRank: 42,
            totalUsers: 100
          });
        }

        // Fetch course progress for each enrolled course
        if (mycourse && mycourse.length > 0) {
          const progressPromises = mycourse.map(async (course) => {
            try {
              const progressRes = await axios.get(`${server}/api/user/progress?course=${course._id}`, {
                headers: { token: localStorage.getItem("token") }
              });
              return {
                course,
                progress: progressRes.data
              };
            } catch (error) {
              return {
                course,
                progress: {
                  courseProgressPercentage: 0,
                  completedLectures: 0,
                  allLectures: 0,
                  quizProgressPercentage: 0,
                  completedQuizzes: 0,
                  allQuizzes: 0
                }
              };
            }
          });
          
          const progressData = await Promise.all(progressPromises);
          setCourseProgress(progressData);
        }

        // Fetch user rewards/achievements
        try {
          const rewardsRes = await axios.get(`${server}/api/reward/user/rewards`, {
            headers: { token: localStorage.getItem("token") }
          });
          setUserRewards(rewardsRes.data.rewards || []);
          setRewardsTotalPoints(rewardsRes.data.totalPoints || 0);
        } catch (error) {
          console.log("No rewards data available");
          setUserRewards([]);
          setRewardsTotalPoints(0);
        }

        // Fetch real recent activity
        try {
          const activityRes = await axios.get(`${server}/api/user/recent-activity`, {
            headers: { token: localStorage.getItem("token") }
          });
          setRecentActivity(activityRes.data.activities || []);
        } catch (error) {
          setRecentActivity([]);
        }

        // Fetch real weekly progress
        try {
          const weeklyRes = await axios.get(`${server}/api/user/weekly-progress`, {
            headers: { token: localStorage.getItem("token") }
          });
          setLearningAnalytics((prev) => ({
            ...prev,
            weeklyProgress: weeklyRes.data.weeklyProgress || []
          }));
        } catch (error) {
          setLearningAnalytics((prev) => ({ ...prev, weeklyProgress: [] }));
        }

        // Fetch study goals
        try {
          const goalsRes = await axios.get(`${server}/api/user/study-goals`, {
            headers: { token: localStorage.getItem("token") }
          });
          setStudyGoals(goalsRes.data.studyGoals || { dailyGoal: 30, weeklyGoal: 5, monthlyGoal: 2 });
        } catch (error) {
          // fallback already set
        }

        // Fetch today's lecture minutes
        try {
          const lectureRes = await axios.get(`${server}/api/user/today-lecture-minutes`, {
            headers: { token: localStorage.getItem("token") }
          });
          setTodayLectureMinutes(lectureRes.data.minutesStudied || 0);
        } catch (error) {
          setTodayLectureMinutes(0);
        }

        // Mock achievements data
        setAchievements([
          { id: 1, name: 'First Steps', description: 'Complete your first video', icon: '🎯', earned: true, progress: 100 },
          { id: 2, name: 'Quiz Master', description: 'Score 90%+ on 5 quizzes', icon: '🧠', earned: false, progress: 60 },
          { id: 3, name: 'Course Champion', description: 'Complete 3 courses', icon: '🏆', earned: false, progress: 33 },
          { id: 4, name: 'Learning Streak', description: 'Learn for 7 consecutive days', icon: '🔥', earned: false, progress: 85 },
          { id: 5, name: 'Point Collector', description: 'Earn 100 total points', icon: '⭐', earned: false, progress: 75 }
        ]);

        // Mock quizScores and videoCompletion for now
        setLearningAnalytics((prev) => ({
          ...prev,
          quizScores: [85, 92, 78, 95, 88, 90, 87],
          videoCompletion: [12, 15, 18, 22, 25, 28, 30]
        }));

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [mycourse]);

  // Fetch activity and events for the current month
  useEffect(() => {
    const fetchCalendarData = async () => {
      setCalendarLoading(true);
      try {
        // Fetch user activity for the month
        const activityRes = await axios.get(`${server}/api/user/recent-activity`, {
          headers: { token: localStorage.getItem("token") }
        });
        // Convert activity timestamps to ISO date strings
        const activityDates = (activityRes.data.activities || []).map(a => new Date(a.timestamp).toISOString().slice(0, 10));
        setCalendarActivityDates([...new Set(activityDates)]);
        // For demo: treat all activity days as goal days if daily goal met (customize as needed)
        setCalendarGoalDates([...new Set(activityDates)]);
        // Fetch events (if you have an endpoint)
        try {
          const eventsRes = await axios.get(`${server}/api/events`, {
            headers: { token: localStorage.getItem("token") }
          });
          const eventDates = (eventsRes.data.events || []).map(e => new Date(e.date).toISOString().slice(0, 10));
          setCalendarEventDates([...new Set(eventDates)]);
        } catch {
          setCalendarEventDates([]);
        }
      } catch {
        setCalendarActivityDates([]);
        setCalendarGoalDates([]);
        setCalendarEventDates([]);
      } finally {
        setCalendarLoading(false);
      }
    };
    fetchCalendarData();
  }, []);

  // Calculate overall progress
  const overallProgress = courseProgress.length > 0 
    ? Math.round(courseProgress.reduce((sum, cp) => sum + (cp.progress.courseProgressPercentage || 0), 0) / courseProgress.length)
    : 0;

  // Get current learning streak
  const currentStreak = dashboardStats.learningStreak || 0;

  // Format time spent
  const formatTimeSpent = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Get achievement progress
  const getAchievementProgress = (achievement) => {
    switch (achievement.name) {
      case 'First Steps':
        return courseProgress.length > 0 ? 100 : 0;
      case 'Quiz Master':
        const highScores = userRewards.filter(r => r.activityType === 'quiz' && r.points >= 9).length;
        return Math.min((highScores / 5) * 100, 100);
      case 'Course Champion':
        const completedCourses = courseProgress.filter(cp => cp.progress.courseProgressPercentage >= 100).length;
        return Math.min((completedCourses / 3) * 100, 100);
      case 'Learning Streak':
        return Math.min((currentStreak / 7) * 100, 100);
      case 'Point Collector':
        return Math.min((dashboardStats.totalPoints / 100) * 100, 100);
      default:
        return achievement.progress;
    }
  };

  // Calculate daily learning progress
  const dailyGoal = studyGoals.dailyGoal || 30;
  const dailyProgress = Math.min(Math.round((todayLectureMinutes / dailyGoal) * 100), 100);

  // Handler to start editing
  const handleEditDailyGoal = () => {
    setNewDailyGoal(studyGoals.dailyGoal);
    setEditingDailyGoal(true);
  };

  // Handler to save new goal
  const handleSaveDailyGoal = async () => {
    setSavingGoal(true);
    try {
      await axios.put(`${server}/api/user/study-goals`, {
        dailyGoal: newDailyGoal,
        weeklyGoal: studyGoals.weeklyGoal,
        monthlyGoal: studyGoals.monthlyGoal
      }, {
        headers: { token: localStorage.getItem("token") }
      });
      setStudyGoals(prev => ({ ...prev, dailyGoal: newDailyGoal }));
      setEditingDailyGoal(false);
    } catch (error) {
      alert('Failed to update daily goal');
    } finally {
      setSavingGoal(false);
    }
  };

  // Handler to cancel editing
  const handleCancelEdit = () => {
    setEditingDailyGoal(false);
  };

  // Handle day click
  const handleCalendarDayClick = (date) => {
    setSelectedDate(date);
    // For demo: show all activities/events for this day
    const iso = date.toISOString().slice(0, 10);
    const activities = recentActivity.filter(a => new Date(a.timestamp).toISOString().slice(0, 10) === iso);
    setSelectedDayDetails(activities);
  };

  // Helper: get most recent activity timestamp for a course
  const getRecentTimestampForCourse = (courseId) => {
    const activities = recentActivity.filter(a => a.course === courseId || a.course?._id === courseId);
    if (activities.length === 0) return 0;
    return Math.max(...activities.map(a => new Date(a.timestamp).getTime()));
  };

  if (loading) {
    return <Loading message="Loading your learning dashboard..." />;
  }

  return (
    <div className="user-dashboard">
      {/* Welcome Section */}
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <div className="welcome-text">
            <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '2.5rem', marginBottom: '0.5rem' }}>
              Welcome back, <span className="gradient-title">{user?.name || 'Learner'}</span>! 👋
            </h1>
            <p>Ready to continue your learning journey?</p>
          </div>
          <div className="welcome-avatar">
            <div className="avatar-circle">
              {user?.photo ? (
                <img
                  src={`${server}/${user.photo}`}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-courses">
          <div className="stat-icon">
            <BiBook />
          </div>
          <div className="stat-content">
            <span className="stat-number">{dashboardStats.totalCourses}</span>
            <span className="stat-label">Enrolled Courses</span>
          </div>
        </div>
        
        <div className="stat-card stat-progress">
          <div className="stat-icon">
            <MdTrendingUp />
          </div>
          <div className="stat-content">
            <span className="stat-number">{overallProgress}%</span>
            <span className="stat-label">Overall Progress</span>
          </div>
        </div>
        
        <div className="stat-card stat-streak">
          <div className="stat-icon">
            <FaFire />
          </div>
          <div className="stat-content">
            <span className="stat-number">{currentStreak}</span>
            <span className="stat-label">Day Streak</span>
          </div>
        </div>
        
        <div className="stat-card stat-points">
          <div className="stat-icon">
            <FaTrophy />
          </div>
          <div className="stat-content">
            <span className="stat-number">{rewardsTotalPoints}</span>
            <span className="stat-label">Total Points</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-main">
        {/* Left Column */}
        <div className="dashboard-left">
          {/* Continue Learning */}
          <div className="dashboard-section continue-learning">
            <div className="section-header">
              <h2 className="gradient-title"><FaPlay /> Continue Learning</h2>
              <button className="see-all-btn" onClick={() => navigate('/courses')}>
                Browse All
              </button>
            </div>
            <div className="continue-learning-content">
              {courseProgress.length > 0 ? (
                [...courseProgress]
                  .filter(cp => cp.progress.courseProgressPercentage < 100)
                  .sort((a, b) => getRecentTimestampForCourse(b.course._id) - getRecentTimestampForCourse(a.course._id))
                  .slice(0, 3)
                  .map((cp, index) => (
                    <div key={cp.course._id} className="continue-course-card">
                      <div className="course-info">
                        <h4>{cp.course.title}</h4>
                        <p>{cp.course.category}</p>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${cp.progress.courseProgressPercentage || 0}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">
                          {cp.progress.completedLectures || 0} of {cp.progress.allLectures || 0} lectures
                        </span>
                      </div>
                      <button 
                        className="resume-btn"
                        onClick={() => navigate(`/lectures/${cp.course._id}`)}
                      >
                        Resume
                      </button>
                    </div>
                  ))
              ) : (
                <div className="no-courses">
                  <p>No courses in progress. Start learning!</p>
                  <button className="primary-btn" onClick={() => navigate('/courses')}>
                    Explore Courses
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-section recent-activity">
            <div className="section-header">
              <h2 className="gradient-title"><FaClock /> Recent Activity</h2>
            </div>
            <div className="activity-list">
              {recentActivity.length === 0 ? (
                <div className="no-courses">
                  <p>No recent activity yet.</p>
                </div>
              ) : (
                recentActivity.map(activity => (
                  <div key={activity._id} className="activity-item">
                    <div className="activity-icon">
                      {activity.activityType === 'video' && <FaPlay />}
                      {activity.activityType === 'quiz' && <FaCheckCircle />}
                      {activity.activityType === 'course_enrollment' && <BiBook />}
                      {activity.activityType === 'course_completion' && <FaTrophy />}
                      {activity.activityType === 'achievement' && <FaMedal />}
                    </div>
                    <div className="activity-content">
                      <h4>{activity.title}</h4>
                      <p>{activity.courseName || (activity.course && activity.course.title) || ''}</p>
                      <span className="activity-time">
                        {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : ''}
                      </span>
                    </div>
                    {activity.points > 0 && (
                      <div className="activity-points">
                        {activity.activityType === 'quiz' ? '+5' : `+${activity.points}`}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Learning Analytics */}
          <div className="dashboard-section learning-analytics">
            <div className="section-header">
              <h2 className="gradient-title"><FaChartLine /> This Week's Progress</h2>
            </div>
            <div className="analytics-chart">
              {learningAnalytics.weeklyProgress && learningAnalytics.weeklyProgress.length > 0 ? (
                <div className="chart-bars">
                  {learningAnalytics.weeklyProgress.map((day, index) => (
                    <div key={index} className="chart-bar">
                      <div 
                        className="bar-fill" 
                        style={{ height: `${day.progress}%` }}
                      >
                      </div>
                      <span className="bar-percentage">{day.progress}%</span>
                      <span className="bar-label">{day.day}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-courses">
                  <p>No weekly progress data yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-right">
          {/* Achievements */}
          <div className="dashboard-section achievements">
            <div className="section-header">
              <h2 className="gradient-title"><FaMedal /> Achievements</h2>
            </div>
            <div className="achievements-grid">
              {achievements.map(achievement => {
                const progress = getAchievementProgress(achievement);
                return (
                  <div 
                    key={achievement.id} 
                    className={`achievement-card ${achievement.earned ? 'earned' : ''}`}
                  >
                    <div className="achievement-icon">
                      {achievement.icon}
                    </div>
                    <div className="achievement-content">
                      <h4>{achievement.name}</h4>
                      <p>{achievement.description}</p>
                      <div className="achievement-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span>{Math.round(progress)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-section quick-actions">
            <div className="section-header">
              <h2 className="gradient-title"><FaBullseye /> Quick Actions</h2>
            </div>
            <div className="actions-grid">
              <button className="action-btn" onClick={() => navigate('/courses')}>
                <FaBookOpen />
                <span>Browse Courses</span>
              </button>
              <button className="action-btn" onClick={() => navigate('/leaderboard')}>
                <FaTrophy />
                <span>Leaderboard</span>
              </button>
              <button className="action-btn" onClick={() => navigate('/events')}>
                <FaCalendarAlt />
                <span>Events</span>
              </button>
              <button className="action-btn" onClick={() => setProfileModalOpen(true)}>
                <FaCog />
                <span>Settings</span>
              </button>
            </div>
          </div>

          {/* Study Goals */}
          <div className="dashboard-section study-goals">
            <div className="section-header">
              <h2 className="gradient-title"><FaBullseye /> Study Goals</h2>
            </div>
            <div className="goals-list">
              <div className="goal-item">
                <div className="goal-info">
                  <h4>Daily Learning</h4>
                  {editingDailyGoal ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="number"
                        min={1}
                        value={newDailyGoal}
                        onChange={e => setNewDailyGoal(Number(e.target.value))}
                        style={{ width: 70, padding: '0.2rem 0.5rem', borderRadius: 4, border: '1px solid #3ecf8e', fontSize: '1rem' }}
                        disabled={savingGoal}
                      />
                      <span>minutes</span>
                      <button onClick={handleSaveDailyGoal} disabled={savingGoal} style={{ background: 'none', border: 'none', color: '#3ecf8e', cursor: 'pointer' }}>
                        {savingGoal ? '...' : <FaCheck />}
                      </button>
                      <button onClick={handleCancelEdit} disabled={savingGoal} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}>
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <p style={{ margin: 0 }}>{studyGoals.dailyGoal} minutes</p>
                      <button onClick={handleEditDailyGoal} style={{ background: 'none', border: 'none', color: '#3ecf8e', cursor: 'pointer' }}>
                        <FaEdit />
                      </button>
                    </div>
                  )}
                </div>
                <div className="goal-progress">
                  <div className="progress-circle">
                    <svg width="56" height="56" viewBox="0 0 56 56">
                      <circle
                        cx="28"
                        cy="28"
                        r="24"
                        fill="none"
                        stroke="#232a36"
                        strokeWidth="6"
                      />
                      {dailyProgress > 0 && (
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          fill="none"
                          stroke="#3ecf8e"
                          strokeWidth="6"
                          strokeDasharray={2 * Math.PI * 24}
                          strokeDashoffset={2 * Math.PI * 24 * (1 - dailyProgress / 100)}
                          style={{ transition: 'stroke-dashoffset 0.5s' }}
                        />
                      )}
                    </svg>
                    <span className="progress-text">{dailyProgress}%</span>
                  </div>
                </div>
              </div>
              <div className="goal-item">
                <div className="goal-info">
                  <h4>Weekly Courses</h4>
                  <p>{studyGoals.weeklyGoal} courses</p>
                </div>
                <div className="goal-progress">
                  <div className="progress-circle">
                    <span>60%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Section */}
          <div className="dashboard-section calendar-section">
            <div className="section-header">
              <h2 className="gradient-title">Learning Calendar</h2>
            </div>
            <Calendar
              tileClassName={({ date, view }) => {
                // Remove all highlight classes, keep all days white
                return null;
              }}
              tileContent={({ date, view }) => {
                const iso = date.toISOString().slice(0, 10);
                if (calendarActivityDates.includes(iso)) {
                  return (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#232a36',
                      border: '2px solid #3ecf8e',
                      color: '#3ecf8e',
                      fontWeight: 700,
                      fontSize: 18,
                      margin: '0 auto',
                      boxShadow: '0 0 8px #3ecf8e44',
                    }}>
                      ✓
                    </span>
                  );
                }
                return null;
              }}
            />
          </div>
        </div>
      </div>
      
      {/* All Enrolled Courses Section */}
      <div className="dashboard-section all-courses">
        <div className="section-header">
          <h2 className="gradient-title"><BiBook /> All Enrolled Courses</h2>
        </div>
        <div className="courses-grid">
          {mycourse && mycourse.length > 0 ? (
            mycourse.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))
          ) : (
            <div className="no-courses">
              <p>No courses enrolled yet</p>
              <button className="primary-btn" onClick={() => navigate('/courses')}>
                Start Learning
              </button>
            </div>
          )}
        </div>
      </div>
      <ProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
        logoutHandler={() => {}}
        goToDashboard={() => {}}
        canEdit={true}
      />
    </div>
  );
};

export default Dashboard;
