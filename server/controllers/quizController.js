import Quiz from '../models/quiz.js';
import { Courses } from '../models/Courses.js';

// Create Quiz with title, support for single/multiple correct MCQs
export const createQuiz = async (req, res) => {
  try {
    const { title, courseId, questions } = req.body;

    if (!title || !courseId || !questions || questions.length === 0) {
      return res.status(400).json({ success: false, message: "Title, Course ID and at least one question are required." });
    }

    const quiz = new Quiz({ title, courseId, questions });
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

    // Allow admins to view all quizzes without enrollment
    if (!user || (user.role !== 'admin' && (!Array.isArray(user.subscription) || !user.subscription.includes(courseId)))) {
      return res.status(403).json({ message: "You must enroll in this course to take the quizzes" });
    }

    const quizzes = await Quiz.find({ courseId });
    if (!quizzes || quizzes.length === 0) return res.status(404).json({ message: "No quizzes found for this course" });

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

    let score = 0;
    quiz.questions.forEach((q, i) => {
      const correct = Array.isArray(q.correctAnswers) ? q.correctAnswers.sort().toString() : [].toString();
      const submitted = Array.isArray(answers[i]) ? answers[i].sort().toString() : [].toString();
      if (correct === submitted) score++;
    });

    res.status(200).json({ score, total: quiz.questions.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
