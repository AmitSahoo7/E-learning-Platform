import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Courses',
    required: true
  },
  assessmentAttempt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinalAssessmentAttempt',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  quizScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  finalAssessmentScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  certificateNumber: {
    type: String,
    required: true,
    unique: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['issued', 'revoked'],
    default: 'issued'
  },
  revokedAt: {
    type: Date
  },
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  revokedReason: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
certificateSchema.index({ user: 1, course: 1 });

export default mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema); 