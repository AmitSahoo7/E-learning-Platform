import Quiz from '../models/quiz.js';
import { Courses } from '../models/Courses.js';

export const createQuiz = async (req, res) => {
  try {
    const { courseId, questions } = req.body;

    if (!courseId || !questions || questions.length === 0) {
      return res.status(400).json({ success: false, message: "Course ID and at least one question are required." });
    }

    const quiz = new Quiz({ courseId, questions });
    await quiz.save();

    res.status(201).json({ success: true, message: "Quiz created" });
  } catch (error) {
    console.error("Quiz creation error:", error); // Log for debugging
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getQuizByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const user = req.user;

    const course = await Courses.findById(courseId);
    const isEnrolled = course.students.includes(user._id); // assuming students array exists

    if (!isEnrolled) {
      return res.status(403).json({ message: "You must enroll in this course to take the quiz" });
    }

    const quiz = await Quiz.findOne({ courseId });
    if (!quiz) return res.status(404).json({ message: "No quiz found for this course" });

    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    const { answers } = req.body;

    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (q.correctAnswerIndex === answers[i]) score++;
    });

    res.status(200).json({ score, total: quiz.questions.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// This code defines the quiz controller for creating quizzes, retrieving quizzes by course, and submitting quizzes to get scores.
// It includes functions to create a quiz, check if a user is enrolled in a course before allowing access to the quiz, and calculate the score based on submitted answers.
// The controller interacts with the Quiz and Course models to perform these operations and handles errors appropriately.