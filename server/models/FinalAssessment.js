import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswers: [{ type: Number, required: true }], // indices of correct options
  questionType: { type: String, enum: ['single', 'multiple'], default: 'single' },
  explanation: { type: String }, // optional, for admin feedback
  marks: { type: Number, default: 1 }, // optional, default 1 mark per question
});

const finalAssessmentSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Courses', required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  questions: [questionSchema],
  totalPoints: { type: Number, default: 0 },
  passingScore: { type: Number, default: 60 }, // percent
  timeLimit: { type: Number, default: 0 }, // in minutes
  attemptsAllowed: { type: Number, default: 1 },
  isActive: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // admin
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // admin
}, {
  timestamps: true,
});

export default mongoose.models.FinalAssessment || mongoose.model('FinalAssessment', finalAssessmentSchema); 