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
  order: { type: Number, default: 0 },
});

export default mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);

// TEMPORARY: Backfill timer for all quizzes if not set
if (import.meta.url === `file://${process.argv[1]}`) {
  const mongoose = await import('mongoose');
  await mongoose.connect('mongodb://localhost:27017/your-db-name'); // <-- UPDATE DB URI
  const { default: Quiz } = await import('./quiz.js');
  const result = await Quiz.updateMany({ $or: [{ timer: { $exists: false } }, { timer: null }] }, { $set: { timer: 10 } });
  console.log('Backfill result:', result);
  await mongoose.disconnect();
  process.exit(0);
}
