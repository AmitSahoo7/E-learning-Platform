import mongoose from 'mongoose';

const finalAssessmentAttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Courses', required: true },
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'FinalAssessment', required: true },
  answers: [{ questionIndex: Number, selectedAnswers: [Number] }],
  score: { type: Number, default: 0 },
  maxScore: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  isPassed: { type: Boolean, default: false },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  duration: { type: Number }, // seconds
}, { timestamps: true });

export default mongoose.models.FinalAssessmentAttempt || mongoose.model('FinalAssessmentAttempt', finalAssessmentAttemptSchema); 