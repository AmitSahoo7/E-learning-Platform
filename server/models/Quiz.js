import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswers: [{ type: Number, required: true }], // supports multi-correct
  questionType: { type: String, enum: ['single', 'multiple'], default: 'single' },
});

const quizSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  title: { type: String, required: true }, // new field
  questions: [questionSchema],
});

export default mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
