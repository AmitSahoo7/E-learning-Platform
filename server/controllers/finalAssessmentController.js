import FinalAssessment from '../models/FinalAssessment.js';
import FinalAssessmentAttempt from '../models/FinalAssessmentAttempt.js';
import { Progress } from '../models/Progress.js';
import { Lecture } from '../models/Lecture.js';

// GET /api/final-assessment/:courseId
export const getFinalAssessmentInfo = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  // Check eligibility
  const progress = await Progress.findOne({ user: userId, course: courseId });
  const totalLectures = await Lecture.countDocuments({ course: courseId });
  const completed = progress?.completedLectures?.length || 0;
  const lectureProgressPercentage = totalLectures > 0 ? (completed / totalLectures) * 100 : 0;
  const requiredPercentage = 80;

  if (lectureProgressPercentage < requiredPercentage) {
    return res.status(403).json({
      message: `Complete at least ${requiredPercentage}% of lectures to unlock the final assessment.`,
      lectureProgressPercentage,
      completedLectures: completed,
      totalLectures,
      requiredPercentage,
    });
  }

  // Get active assessment
  const finalAssessment = await FinalAssessment.findOne({ courseId, isActive: true });
  if (!finalAssessment) return res.status(404).json({ message: 'No active assessment found.' });

  // Get attempts
  const attempts = await FinalAssessmentAttempt.find({
    user: userId,
    courseId,
    assessmentId: finalAssessment._id,
  }).sort({ createdAt: 1 });

  const attemptsUsed = attempts.length;
  const attemptsAllowed = finalAssessment.attemptsAllowed;
  const canTakeAssessment = attemptsUsed < attemptsAllowed;

  // Best attempt
  let bestAttempt = null;
  if (attempts.length > 0) {
    bestAttempt = attempts.reduce((best, curr) =>
      (curr.percentage > (best?.percentage || 0)) ? curr : best, null
    );
  }

  res.json({
    finalAssessment,
    attemptsUsed,
    attemptsAllowed,
    canTakeAssessment,
    bestAttempt,
  });
};

// POST /api/final-assessment/:courseId/start
export const startFinalAssessmentAttempt = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  // Get active assessment
  const finalAssessment = await FinalAssessment.findOne({ courseId, isActive: true });
  if (!finalAssessment) return res.status(404).json({ message: 'No active assessment found.' });

  // Check attempts
  const attempts = await FinalAssessmentAttempt.find({
    user: userId,
    courseId,
    assessmentId: finalAssessment._id,
  });
  if (attempts.length >= finalAssessment.attemptsAllowed) {
    return res.status(403).json({ message: 'No attempts left.' });
  }

  // Create attempt
  const attempt = await FinalAssessmentAttempt.create({
    user: userId,
    courseId,
    assessmentId: finalAssessment._id,
    answers: [],
    startedAt: new Date(),
  });

  res.json({
    attempt,
    timeLimit: finalAssessment.timeLimit,
    finalAssessment,
  });
};

// POST /api/final-assessment/attempt/:attemptId/submit
export const submitFinalAssessmentAttempt = async (req, res) => {
  const { attemptId } = req.params;
  const userId = req.user._id;
  const { answers } = req.body;

  const attempt = await FinalAssessmentAttempt.findById(attemptId);
  if (!attempt) return res.status(404).json({ message: 'Attempt not found.' });
  if (attempt.user.toString() !== userId.toString()) return res.status(403).json({ message: 'Not your attempt.' });
  if (attempt.submittedAt) return res.status(400).json({ message: 'Attempt already submitted.' });

  // Get assessment
  const finalAssessment = await FinalAssessment.findById(attempt.assessmentId);
  if (!finalAssessment) return res.status(404).json({ message: 'Assessment not found.' });

  // Score
  let score = 0;
  let maxScore = 0;
  finalAssessment.questions.forEach((q, idx) => {
    maxScore += q.marks || 1;
    const correct = Array.isArray(q.correctAnswers) ? q.correctAnswers.sort().join(',') : '';
    const userAns = Array.isArray(answers[idx]?.selectedAnswers) ? answers[idx].selectedAnswers.sort().join(',') : '';
    if (correct === userAns) score += q.marks || 1;
  });
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const isPassed = percentage >= (finalAssessment.passingScore || 60);

  // Update attempt
  attempt.answers = answers;
  attempt.score = score;
  attempt.maxScore = maxScore;
  attempt.percentage = percentage;
  attempt.isPassed = isPassed;
  attempt.submittedAt = new Date();
  attempt.duration = Math.floor((attempt.submittedAt - attempt.startedAt) / 1000);
  await attempt.save();

  res.json({
    score,
    totalPoints: maxScore,
    percentage,
    isPassed,
    attemptId: attempt._id,
  });
}; 