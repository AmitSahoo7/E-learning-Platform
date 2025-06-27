import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [String],
  correctAnswerIndex: { type: Number, required: true }
});

const quizSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Quiz', quizSchema);
// This schema defines a Quiz model with a reference to a Course and an array of questions.
// Each question has text, options, and the index of the correct answer.