import express from 'express';
import { createQuiz, getQuizzesByCourse, submitQuiz } from '../controllers/quizController.js';
import { isAuth, isAdmin } from '../middlewares/isAuth.js';
import Quiz from '../models/Quiz.js';

const router = express.Router();

// Only admin can add quiz
router.post('/create', isAuth, isAdmin, createQuiz);

// Get quiz by course for a student (after purchase)
router.get('/:courseId', isAuth, getQuizzesByCourse);

// Submit answers and get score
router.post('/submit/:quizId', isAuth, submitQuiz);

// Delete question
router.delete("/:quizId/question/:questionIndex", async (req, res) => {
  const { quizId, questionIndex } = req.params;
  const quiz = await Quiz.findById(quizId);
  if (!quiz) return res.status(404).send("Quiz not found");

  quiz.questions.splice(questionIndex, 1);
  await quiz.save();

  res.json({ message: "Question deleted", quiz });
});

// Delete a quiz by ID (admin only)
router.delete('/:quizId', isAuth, isAdmin, async (req, res) => {
  try {
    const quizId = req.params.quizId;
    await Quiz.findByIdAndDelete(quizId);
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a quiz by ID (admin only)
router.put('/:quizId', isAuth, isAdmin, async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const { title, questions } = req.body;
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      { title, questions },
      { new: true }
    );
    res.json({ message: 'Quiz updated successfully', quiz: updatedQuiz });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
// This code defines the routes for quiz-related operations in an Express application.
// It includes routes for creating a quiz (admin only), retrieving a quiz by course ID (for students),
// and submitting a quiz to get the score. The routes are protected by authentication and authorization middleware