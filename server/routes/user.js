import express from 'express';
import {
  register, 
  verifyUser, 
  loginUser, 
  myProfile,
  getDashboardStats,
  getUserRewards,
  getLearningAnalytics,
  getRecommendedCourses,
  updateStudyGoals,
  getStudyGoals,
  getUserRecentActivity,
  getUserWeeklyProgress,
  getTodayLectureMinutes,
  logLectureWatch
} from "../controllers/user.js";
import { isAuth } from '../middlewares/isAuth.js';
import { addProgress, getYourProgress } from '../controllers/course.js';

const router = express.Router();

router.post("/user/register", register);
router.post("/user/verify", verifyUser);
router.post("/user/login", loginUser);
router.get("/user/me", isAuth, myProfile);
router.post("/user/progress", isAuth, addProgress);
router.get("/user/progress", isAuth, getYourProgress);

// Dashboard routes
router.get("/user/dashboard-stats", isAuth, getDashboardStats);
router.get("/user/rewards", isAuth, getUserRewards);
router.get("/user/learning-analytics", isAuth, getLearningAnalytics);
router.get("/user/recommended-courses", isAuth, getRecommendedCourses);
router.put("/user/study-goals", isAuth, updateStudyGoals);
router.get("/user/study-goals", isAuth, getStudyGoals);

// Activity tracking routes
router.get("/user/recent-activity", isAuth, getUserRecentActivity);
router.get("/user/weekly-progress", isAuth, getUserWeeklyProgress);
router.get("/user/today-lecture-minutes", isAuth, getTodayLectureMinutes);
router.post("/user/log-lecture-watch", isAuth, logLectureWatch);

export default router;