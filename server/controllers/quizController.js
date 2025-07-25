import Quiz from '../models/Quiz.js';
import { Courses } from '../models/Courses.js';
import { Progress } from '../models/Progress.js';
import { UserActivity } from '../models/UserActivity.js';

// Create Quiz with title, support for single/multiple correct MCQs
export const createQuiz = async (req, res) => {
  try {
    const { title, courseId, questions } = req.body;

    if (!title || !courseId || !questions || questions.length === 0) {
      return res.status(400).json({ success: false, message: "Title, Course ID and at least one question are required." });
    }

    // Find the max order among lectures and quizzes for this course
    const lectures = await (await import('../models/Lecture.js')).Lecture.find({ course: courseId });
    const quizzes = await Quiz.find({ courseId });
    const maxLectureOrder = lectures.length > 0 ? Math.max(...lectures.map(l => l.order || 0)) : 0;
    const maxQuizOrder = quizzes.length > 0 ? Math.max(...quizzes.map(q => q.order || 0)) : 0;
    const nextOrder = Math.max(maxLectureOrder, maxQuizOrder) + 1;

    const quiz = new Quiz({ title, courseId, questions, order: nextOrder });
    await quiz.save();

    res.status(201).json({ success: true, message: "Quiz created" });
  } catch (error) {
    console.error("Quiz creation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch ALL Quizzes for a course (if enrolled)
export const getQuizzesByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const user = req.user;

    // Allow admins and instructors to view all quizzes without enrollment
    const isAdminUser = user.role === 'admin';
    const isInstructor = user.role === 'instructor' || (Array.isArray(user.roles) && user.roles.includes('instructor'));
    
    if (!user || (!isAdminUser && !isInstructor && (!Array.isArray(user.subscription) || !user.subscription.includes(courseId)))) {
      return res.status(403).json({ message: "You must enroll in this course to take the quizzes" });
    }

    const quizzes = await Quiz.find({ courseId });
    if (!quizzes || quizzes.length === 0) return res.json([]);

    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit Quiz (supporting multiple correct answers)
export const submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    const { answers } = req.body; // answers: array of arrays (for multiple correct)
    const userId = req.user._id;
    const courseId = quiz.courseId;

    let score = 0;
    quiz.questions.forEach((q, i) => {
      const correct = Array.isArray(q.correctAnswers) ? q.correctAnswers.sort().toString() : [].toString();
      const submitted = Array.isArray(answers[i]) ? answers[i].sort().toString() : [].toString();
      if (correct === submitted) score++;
    });

    const percent = quiz.questions.length > 0 ? (score / quiz.questions.length) : 0;

    // Mark quiz as completed for this user and course ONLY if >=75%
    let progress = await Progress.findOne({ user: userId, course: courseId });
    if (!progress) {
      progress = await Progress.create({
        user: userId,
        course: courseId,
        completedLectures: [],
        completedQuizzes: percent >= 0.75 ? [quiz._id] : [],
        quizScores: [{ quiz: quiz._id, bestScore: score }],
      });
    } else {
      // Ensure quizScores is always an array
      if (!Array.isArray(progress.quizScores)) progress.quizScores = [];
      // Find if this quiz already has a score entry
      const scoreIndex = progress.quizScores.findIndex(qs => qs.quiz.toString() === quiz._id.toString());
      if (scoreIndex === -1) {
        // New quiz, add entry
        progress.quizScores.push({ quiz: quiz._id, bestScore: score });
      } else {
        // Existing quiz, update bestScore if higher
        if (score > progress.quizScores[scoreIndex].bestScore) {
          progress.quizScores[scoreIndex].bestScore = score;
        }
      }
      // Only add to completedQuizzes if >=75% and not already present
      if (percent >= 0.75 && !progress.completedQuizzes.includes(quiz._id)) {
        progress.completedQuizzes.push(quiz._id);
      }
      // If score drops below 75% on a later attempt, do NOT remove from completedQuizzes (keeps best attempt logic)
      await progress.save();
    }

    // Record user activity for quiz
    await UserActivity.create({
      user: userId,
      activityType: "quiz",
      title: `Completed quiz: ${quiz.title}`,
      course: courseId,
      courseName: (await Courses.findById(courseId))?.title || "Unknown Course",
      points: percent >= 0.75 ? 10 : 0,
      metadata: { score, total: quiz.questions.length, percent: Math.round(percent * 100) },
      quiz: quiz._id
    });

    res.status(200).json({ score, total: quiz.questions.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
