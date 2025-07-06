import mongoose from 'mongoose';

const WebinarSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  topic: { type: String, required: true },
  time: { type: String, required: true },
  instructors: [{ type: String, required: true }],
  description: { type: String, required: true },
  objectives: { type: String, required: true },
  notes: { type: String }, // Optional text notes
  document: { type: String }, // Optional file path
  poster: { type: String }, // Optional poster/cover image path
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Webinar', WebinarSchema); 