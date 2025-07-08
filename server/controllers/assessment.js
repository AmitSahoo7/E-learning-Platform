import FinalAssessment from '../models/FinalAssessment.js';
import { Progress } from '../models/Progress.js';
import { Courses } from '../models/Courses.js';
import TryCatch from '../middlewares/TryCatch.js';
import FinalAssessmentAttempt from '../models/FinalAssessmentAttempt.js';
import { Lecture } from '../models/Lecture.js';
import  Quiz  from '../models/Quiz.js';
import Certificate from '../models/Certificate.js';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Admin: Create a new assessment
export const createAssessment = TryCatch(async (req, res) => {
  console.log('CREATE req.body:', req.body);
  const { courseId, title, questions, description, passingScore, timeLimit, attemptsAllowed } = req.body;
  if (!courseId || !title || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ message: 'Missing required fields or questions are empty.' });
  }
  // Optionally: check if course exists
  const course = await Courses.findById(courseId);
  if (!course) {
    return res.status(404).json({ message: 'Course not found.' });
  }
  // Calculate totalPoints
  const totalPoints = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
  // Create assessment
  const assessment = await FinalAssessment.create({
    courseId,
    title,
    description,
    questions,
    totalPoints,
    passingScore: passingScore || 60,
    timeLimit: timeLimit || 0,
    attemptsAllowed: attemptsAllowed || 1,
    createdBy: req.user._id,
    isActive: false // default inactive
  });
  res.status(201).json({ message: 'Assessment created successfully', assessment });
});

// Admin: Update assessment
export const updateAssessment = TryCatch(async (req, res) => {
  console.log('UPDATE req.body:', req.body);
  const { id } = req.params;
  const { title, questions, description, passingScore, timeLimit, attemptsAllowed } = req.body;
  const assessment = await FinalAssessment.findById(id);
  if (!assessment) return res.status(404).json({ message: 'Assessment not found.' });
  if (title) assessment.title = title;
  if (description !== undefined) assessment.description = description;
  if (Array.isArray(questions) && questions.length > 0) {
    assessment.questions = questions;
    assessment.totalPoints = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
  }
  if (passingScore !== undefined) assessment.passingScore = passingScore;
  if (timeLimit !== undefined) assessment.timeLimit = timeLimit;
  if (attemptsAllowed !== undefined) assessment.attemptsAllowed = attemptsAllowed;
  await assessment.save();
  res.json({ message: 'Assessment updated successfully', assessment });
});

// Admin: Preview assessment
export const previewAssessment = TryCatch(async (req, res) => {
  const { id } = req.params;
  const assessment = await FinalAssessment.findById(id);
  if (!assessment) return res.status(404).json({ message: 'Assessment not found.' });
  console.log('PREVIEW assessment:', assessment);
  res.json({ assessment });
});

// Admin: Activate assessment (deactivate others for the course)
export const activateAssessment = TryCatch(async (req, res) => {
  const { id } = req.params;
  const assessment = await FinalAssessment.findById(id);
  if (!assessment) return res.status(404).json({ message: 'Assessment not found.' });
  // Deactivate all other assessments for this course
  await FinalAssessment.updateMany({ courseId: assessment.courseId }, { isActive: false });
  assessment.isActive = true;
  await assessment.save();
  res.json({ message: 'Assessment activated', assessment });
});

// Admin: Deactivate assessment
export const deactivateAssessment = TryCatch(async (req, res) => {
  const { id } = req.params;
  const assessment = await FinalAssessment.findById(id);
  if (!assessment) return res.status(404).json({ message: 'Assessment not found.' });
  assessment.isActive = false;
  await assessment.save();
  res.json({ message: 'Assessment deactivated', assessment });
});

// Admin: List all assessments for a course
export const listAssessments = TryCatch(async (req, res) => {
  const { courseId } = req.params;
  const user = req.user;
  // Fetch the course to check instructor permissions
  const course = await Courses.findById(courseId);
  // Debug patch:
  console.log('DEBUG: User:', user._id.toString(), user.role);
  console.log('DEBUG: Course instructors:', course?.instructors?.map(i => i.toString()));
  const foundAssessments = await FinalAssessment.find({ courseId }).sort({ createdAt: -1 });
  console.log('DEBUG: Assessments found:', foundAssessments.map(a => a._id.toString()));
  if (!course) return res.status(404).json({ message: 'Course not found.' });
  // If user is admin/superadmin, allow
  if (user.role === 'admin' || user.role === 'superadmin') {
    return res.json({ assessments: foundAssessments });
  }
  // If user is instructor, check if they are assigned to this course (ObjectId equality)
  if (user.role === 'instructor' && Array.isArray(course.instructors) && course.instructors.some(id => id.equals ? id.equals(user._id) : String(id) === String(user._id))) {
    return res.json({ assessments: foundAssessments });
  }
  // Otherwise, forbidden
  return res.status(403).json({ message: 'You do not have permission to view assessments for this course.' });
});

// User: Get active assessment for a course
export const getActiveAssessment = TryCatch(async (req, res) => {
  const { courseId } = req.params;
  // Check eligibility first
  const progress = await Progress.findOne({ user: req.user._id, course: courseId });
  const totalLectures = await Lecture.countDocuments({ course: courseId });
  const completed = progress?.completedLectures?.length || 0;
  const percent = totalLectures > 0 ? (completed / totalLectures) * 100 : 0;
  if (percent < 80) {
    return res.status(403).json({ message: 'Not eligible for final assessment.' });
  }
  // Get active assessment
  const assessment = await FinalAssessment.findOne({ courseId, isActive: true });
  if (!assessment) return res.status(404).json({ message: 'No active assessment found.' });
  res.json({ assessment });
});

// User: Submit assessment answers
export const submitAssessment = TryCatch(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;
  const { answers } = req.body; // array of arrays: [[0], [1,2], ...]
  // Get active assessment
  const assessment = await FinalAssessment.findOne({ courseId, isActive: true });
  if (!assessment) return res.status(404).json({ message: 'No active assessment found.' });
  if (!Array.isArray(answers) || answers.length !== assessment.questions.length) {
    return res.status(400).json({ message: 'Invalid answers.' });
  }
  // Score the assessment
  let score = 0;
  let maxScore = 0;
  assessment.questions.forEach((q, idx) => {
    maxScore += q.marks || 1;
    const correct = Array.isArray(q.correctAnswers) ? q.correctAnswers.sort().join(',') : '';
    const userAns = Array.isArray(answers[idx]) ? answers[idx].sort().join(',') : '';
    if (correct === userAns) score += q.marks || 1;
  });
  // Passing criteria: 60% (can be made configurable)
  const passPercent = 60;
  const passed = (score / maxScore) * 100 >= passPercent;
  // Store attempt
  await FinalAssessmentAttempt.create({
    user: userId,
    courseId,
    assessmentId: assessment._id,
    answers,
    score,
    maxScore,
    passed
  });
  res.json({ score, maxScore, passed, percent: (score / maxScore) * 100 });
});

// User: Check eligibility for final assessment
export const checkEligibility = TryCatch(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;
  // Find progress for this user and course
  const progress = await Progress.findOne({ user: userId, course: courseId });
  if (!progress) return res.json({ eligible: false, reason: 'No progress found' });
  // Count total lectures in course
  const totalLectures = await Lecture.countDocuments({ course: courseId });
  const completed = progress.completedLectures?.length || 0;
  const percent = totalLectures > 0 ? (completed / totalLectures) * 100 : 0;
  if (percent >= 80) {
    return res.json({ eligible: true });
  } else {
    return res.json({ eligible: false, reason: 'Complete at least 80% of lectures to unlock the final assessment.' });
  }
});

// User: Check eligibility for certificate
export const checkCertificateEligibility = TryCatch(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;
  
  // Find progress for this user and course
  const progress = await Progress.findOne({ user: userId, course: courseId });
  if (!progress) {
    return res.json({ 
      eligible: false, 
      reason: 'No progress found for this course',
      requirements: {
        lectures: { completed: 0, total: 0, required: 100 },
        quizzes: { completed: 0, total: 0, required: 'all' },
        assessment: { completed: false, passed: false, required: 'pass' }
      }
    });
  }

  // Check lecture completion (100% required)
  const totalLectures = await Lecture.countDocuments({ course: courseId });
  const completedLectures = progress.completedLectures?.length || 0;
  const lectureProgress = totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0;

  // Prepare quiz data for both eligibility and certificate generation
  const quizDocs = await Quiz.find({ courseId: courseId }, '_id');
  const quizIds = quizDocs.map(q => q._id.toString());
  const totalQuizzes = quizIds.length;
  const attemptedQuizzes = progress.quizScores
    ? progress.quizScores.filter(qs => quizIds.includes(qs.quiz.toString())).length
    : 0;
  const completedQuizzes = progress.completedQuizzes
    ? progress.completedQuizzes.filter(qid => quizIds.includes(qid.toString())).length
    : 0;

  // Calculate quiz score (average of all quiz scores)
  let quizScore = 0;
  if (totalQuizzes > 0 && progress.quizScores && progress.quizScores.length > 0) {
    const totalQuizScore = progress.quizScores.reduce((sum, quizScore) => {
      return sum + (quizScore.bestScore || 0);
    }, 0);
    quizScore = Math.round((totalQuizScore / progress.quizScores.length) * 100) / 100;
  }

  // Check final assessment
  const finalAssessment = await FinalAssessment.findOne({ courseId, isActive: true });
  let assessmentCompleted = false;
  let assessmentPassed = false;
  let bestScore = 0;
  let weightedTotalScore = 0;

  if (finalAssessment) {
    const attempts = await FinalAssessmentAttempt.find({
      user: userId,
      courseId,
      assessmentId: finalAssessment._id
    }).sort({ percentage: -1 });

    if (attempts.length > 0) {
      assessmentCompleted = true;
      bestScore = attempts[0].percentage;
      assessmentPassed = attempts[0].isPassed;
      
      // Calculate weighted total score
      weightedTotalScore = (0.25 * quizScore) + (0.75 * bestScore);
    }
  }

  // Determine eligibility
  const lecturesComplete = lectureProgress >= 100;
  const allQuizzesAttempted = totalQuizzes === 0 || attemptedQuizzes >= totalQuizzes;
  const quizzesComplete = totalQuizzes === 0 || completedQuizzes >= totalQuizzes;
  const assessmentComplete = assessmentCompleted && assessmentPassed;
  const scoreRequirementMet = weightedTotalScore >= 60;

  // User must attempt ALL quizzes regardless of score
  const eligible = lecturesComplete && allQuizzesAttempted && quizzesComplete && assessmentComplete && scoreRequirementMet;

  let reason = '';
  if (!lecturesComplete) {
    reason = `Complete all lectures (${Math.round(lectureProgress)}% / 100%)`;
  } else if (!allQuizzesAttempted) {
    reason = `Attempt all quizzes (${attemptedQuizzes} / ${totalQuizzes} attempted) - You must attempt every quiz regardless of score`;
  } else if (!quizzesComplete) {
    reason = `Complete all quizzes (${completedQuizzes} / ${totalQuizzes} completed)`;
  } else if (!assessmentCompleted) {
    reason = 'Complete the final assessment';
  } else if (!assessmentPassed) {
    reason = `Pass the final assessment (best score: ${bestScore}%)`;
  } else if (!scoreRequirementMet) {
    reason = `Achieve total score ≥60% (current: ${Math.round(weightedTotalScore * 100) / 100}%)`;
  }

  // Block certificate eligibility if not all quizzes are attempted
  if (totalQuizzes > 0 && attemptedQuizzes < totalQuizzes) {
    return res.json({
      eligible: false,
      reason: `You must attempt all quizzes before you can generate a certificate. Attempted: ${attemptedQuizzes}/${totalQuizzes}`,
      requirements: {
        lectures: {
          completed: completedLectures,
          total: totalLectures,
          progress: Math.round(lectureProgress),
          required: 100,
          complete: lecturesComplete
        },
        quizzes: {
          attempted: attemptedQuizzes,
          total: totalQuizzes,
          complete: false,
          allAttempted: false,
          averageScore: quizScore
        },
        assessment: {
          completed: assessmentCompleted,
          passed: assessmentPassed,
          bestScore,
          required: 'pass',
          complete: assessmentComplete
        },
        totalScore: {
          weightedScore: Math.round(weightedTotalScore * 100) / 100,
          quizContribution: Math.round(0.25 * quizScore * 100) / 100,
          assessmentContribution: Math.round(0.75 * bestScore * 100) / 100,
          required: 60,
          complete: scoreRequirementMet
        }
      }
    });
  }

  return res.json({
    eligible,
    reason: eligible ? 'All requirements met!' : reason,
    requirements: {
      lectures: { 
        completed: completedLectures, 
        total: totalLectures, 
        progress: Math.round(lectureProgress),
        required: 100,
        complete: lecturesComplete
      },
      quizzes: { 
        completed: completedQuizzes, 
        total: totalQuizzes, 
        attempted: attemptedQuizzes,
        required: 'all',
        complete: quizzesComplete,
        allAttempted: allQuizzesAttempted,
        averageScore: quizScore
      },
      assessment: { 
        completed: assessmentCompleted, 
        passed: assessmentPassed, 
        bestScore,
        required: 'pass',
        complete: assessmentComplete
      },
      totalScore: {
        weightedScore: Math.round(weightedTotalScore * 100) / 100,
        quizContribution: Math.round(0.25 * quizScore * 100) / 100,
        assessmentContribution: Math.round(0.75 * bestScore * 100) / 100,
        required: 60,
        complete: scoreRequirementMet
      }
    }
  });
});

// Admin: Get all attempts for a course
export const getAllAttempts = TryCatch(async (req, res) => {
  const { courseId } = req.params;
  
  // Get all assessments for this course
  const assessments = await FinalAssessment.find({ courseId });
  const assessmentIds = assessments.map(a => a._id);
  
  // Get all attempts for these assessments with user details
  const attempts = await FinalAssessmentAttempt.find({
    courseId,
    assessmentId: { $in: assessmentIds }
  })
  .populate('user', 'name email')
  .populate('assessmentId', 'title')
  .sort({ createdAt: -1 });
  
  // Group attempts by user for better overview
  const attemptsByUser = attempts.reduce((acc, attempt) => {
    const userId = attempt.user._id.toString();
    if (!acc[userId]) {
      acc[userId] = {
        user: attempt.user,
        attempts: []
      };
    }
    acc[userId].attempts.push(attempt);
    return acc;
  }, {});
  
  // Calculate statistics
  const totalAttempts = attempts.length;
  const uniqueUsers = Object.keys(attemptsByUser).length;
  const passedAttempts = attempts.filter(a => a.isPassed).length;
  const averageScore = attempts.length > 0 
    ? attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length 
    : 0;
  
  res.json({
    attempts,
    attemptsByUser: Object.values(attemptsByUser),
    statistics: {
      totalAttempts,
      uniqueUsers,
      passedAttempts,
      averageScore: Math.round(averageScore * 100) / 100,
      passRate: totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0
    }
  });
});

// Admin: Get detailed attempt info
export const getAttemptDetails = TryCatch(async (req, res) => {
  const { attemptId } = req.params;
  const attempt = await FinalAssessmentAttempt.findById(attemptId)
    .populate('user', 'name email')
    .populate('assessmentId', 'title');
  console.log('DEBUG: Attempt details:', JSON.stringify(attempt, null, 2));
  if (!attempt) return res.status(404).json({ message: 'Attempt not found.' });
  if (!attempt.user || !attempt.assessmentId) {
    return res.status(500).json({ message: 'Attempt found, but user or assessment not populated. Check database references.' });
  }
  res.json({ attempt });
});

// Generate certificate for a user
export const generateCertificate = TryCatch(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  // Check if user has completed all requirements
  const progress = await Progress.findOne({ user: userId, course: courseId });
  if (!progress) {
    return res.status(404).json({ message: 'No progress found for this course' });
  }

  // Get course details
  const course = await Courses.findById(courseId);
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  // Check lecture completion (100% required)
  const totalLectures = await Lecture.countDocuments({ course: courseId });
  const completedLectures = progress.completedLectures?.length || 0;
  const lectureProgress = totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0;

  if (lectureProgress < 100) {
    return res.status(403).json({ 
      message: 'Complete all lectures to generate certificate',
      lectureProgress,
      completedLectures,
      totalLectures
    });
  }

  // Check quiz completion (all quizzes must be attempted)
  const quizDocs = await Quiz.find({ courseId: courseId }, '_id');
  const quizIds = quizDocs.map(q => q._id.toString());
  const totalQuizzes = quizIds.length;
  const attemptedQuizzes = progress.quizScores
    ? progress.quizScores.filter(qs => quizIds.includes(qs.quiz.toString())).length
    : 0;
  const completedQuizzes = progress.completedQuizzes
    ? progress.completedQuizzes.filter(qid => quizIds.includes(qid.toString())).length
    : 0;
  
  if (totalQuizzes > 0 && attemptedQuizzes < totalQuizzes) {
    return res.status(403).json({ 
      message: 'Attempt all quizzes to generate certificate - You must attempt every quiz regardless of score',
      attemptedQuizzes,
      totalQuizzes
    });
  }
  
  if (totalQuizzes > 0 && completedQuizzes < totalQuizzes) {
    return res.status(403).json({ 
      message: 'Complete all quizzes to generate certificate',
      completedQuizzes,
      totalQuizzes
    });
  }

  // Calculate quiz score (average of all quiz scores)
  let quizScore = 0;
  if (totalQuizzes > 0 && progress.quizScores && progress.quizScores.length > 0) {
    const totalQuizScore = progress.quizScores.reduce((sum, quizScore) => {
      return sum + (quizScore.bestScore || 0);
    }, 0);
    quizScore = Math.round((totalQuizScore / progress.quizScores.length) * 100) / 100;
  }

  // Check if user has passed final assessment
  const finalAssessment = await FinalAssessment.findOne({ courseId, isActive: true });
  if (!finalAssessment) {
    return res.status(404).json({ message: 'No active final assessment found' });
  }

  const attempts = await FinalAssessmentAttempt.find({
    user: userId,
    courseId,
    assessmentId: finalAssessment._id
  }).sort({ percentage: -1 });

  if (attempts.length === 0) {
    return res.status(403).json({ message: 'Complete the final assessment to generate certificate' });
  }

  const bestAttempt = attempts[0];
  if (!bestAttempt.isPassed) {
    return res.status(403).json({ 
      message: 'Pass the final assessment to generate certificate',
      bestScore: bestAttempt.percentage
    });
  }

  // Calculate weighted total score: (25% × Quiz Score) + (75% × Final Assessment Score)
  const finalAssessmentScore = bestAttempt.percentage;
  const weightedTotalScore = (0.25 * quizScore) + (0.75 * finalAssessmentScore);
  
  // Check if weighted score meets minimum requirement (60%)
  if (weightedTotalScore < 60) {
    return res.status(403).json({ 
      message: 'Achieve a total score of at least 60% to generate certificate',
      quizScore,
      finalAssessmentScore,
      weightedTotalScore: Math.round(weightedTotalScore * 100) / 100,
      requiredScore: 60,
      breakdown: {
        quizContribution: Math.round(0.25 * quizScore * 100) / 100,
        assessmentContribution: Math.round(0.75 * finalAssessmentScore * 100) / 100
      }
    });
  }

  // Check if certificate already exists
  const existingCertificate = await Certificate.findOne({ user: userId, course: courseId });
  if (existingCertificate) {
    return res.json({ 
      message: 'Certificate already exists',
      certificate: existingCertificate,
      downloadUrl: `/api/certificate/${existingCertificate._id}/download`
    });
  }

  // Generate certificate
  const certificate = await Certificate.create({
    user: userId,
    course: courseId,
    assessmentAttempt: bestAttempt._id,
    score: Math.round(weightedTotalScore * 100) / 100, // Store weighted total score
    quizScore: quizScore,
    finalAssessmentScore: finalAssessmentScore,
    issuedAt: new Date(),
    certificateNumber: generateCertificateNumber(),
    status: 'issued'
  });

  res.json({ 
    message: 'Certificate generated successfully',
    certificate,
    downloadUrl: `/api/certificate/${certificate._id}/download`
  });
});

// Download certificate
export const downloadCertificate = TryCatch(async (req, res) => {
  const { certificateId } = req.params;
  const userId = req.user._id;

  const certificate = await Certificate.findById(certificateId)
    .populate('user', 'name email')
    .populate('course', 'title description')
    .populate('assessmentAttempt');

  if (!certificate) {
    return res.status(404).json({ message: 'Certificate not found' });
  }

  // Check if user owns this certificate or is admin
  if (certificate.user._id.toString() !== userId.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to download this certificate' });
  }

  // Generate PDF certificate
  const pdfBuffer = await generateCertificatePDF(certificate);
  
  res.setHeader('Content-Type', 'application/pdf');
  // Custom filename: Certificate_{UserName}_{CourseTitle}.pdf
  const userName = certificate.user.name.replace(/[^a-zA-Z0-9]/g, '_');
  const courseTitle = certificate.course.title.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Certificate_${userName}_${courseTitle}.pdf`;
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.send(pdfBuffer);
});

// Helper function to generate certificate number
const generateCertificateNumber = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `CERT-${timestamp}-${random}`.toUpperCase();
};

// Helper function to generate PDF certificate
const generateCertificatePDF = async (certificate) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
    });

    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      resolve(Buffer.concat(buffers));
    });

    // Path to your template image
    const templatePath = path.join(__dirname, '../assets/certificate_template.png');
    if (fs.existsSync(templatePath)) {
      doc.image(templatePath, 0, 0, { width: doc.page.width, height: doc.page.height });
    } else {
      console.error('Certificate template image not found:', templatePath);
    }

    // Overlay dynamic text (adjust x, y, width as needed)
    doc.fontSize(32)
      .fillColor('#000')
      .text(certificate.user.name, 165, 250, { align: 'center', width: 500 });

    doc.fontSize(24)
      .text(certificate.course.title,-35, 320, { align: 'center', width: 500 });

    // Add more fields as needed, e.g. date, certificate number, etc.

    doc.end();
  });
}; 