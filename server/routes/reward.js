import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import {
  awardVideoPoints,
  awardQuizPoints,
  awardAssessmentPoints,
  getUserRewards,
  getLeaderboard,
  getUserRanking
} from '../controllers/reward.js';

const router = express.Router();

// Award points for activities
router.post("/award/video", isAuth, awardVideoPoints);
router.post("/award/quiz", isAuth, awardQuizPoints);
router.post("/award/assessment", isAuth, awardAssessmentPoints);

// Get user rewards and ranking
router.get("/user/rewards", isAuth, getUserRewards);
router.get("/user/ranking", isAuth, getUserRanking);

// Get leaderboard (public)
router.get("/leaderboard", getLeaderboard);

export default router; 