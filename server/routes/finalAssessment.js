import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import {
  getFinalAssessmentInfo,
  startFinalAssessmentAttempt,
  submitFinalAssessmentAttempt,
} from '../controllers/finalAssessmentController.js';

const router = express.Router();

router.get('/final-assessment/:courseId', isAuth, getFinalAssessmentInfo);
router.post('/final-assessment/:courseId/start', isAuth, startFinalAssessmentAttempt);
router.post('/final-assessment/attempt/:attemptId/submit', isAuth, submitFinalAssessmentAttempt);

export default router; 