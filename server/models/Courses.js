import mongoose from "mongoose";

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },

  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  pdf: {
    type: String,
    required: false,
  },
  // New fields for dynamic course details
  tagline: {
    type: String,
    required: false,
  },
  difficulty: {
    type: String,
    required: false,
  },
  prerequisites: {
    type: String,
    required: false,
  },
  whatYouLearn: {
    type: String,
    required: false,
  },
  courseOutcomes: {
    type: String,
    required: false,
  },
  instructorName: {
    type: String,
    required: false,
  },
  instructorBio: {
    type: String,
    required: false,
  },
  instructorAvatar: {
    type: String,
    required: false,
  },
  previewVideo: {
    type: String,
    required: false,
  },
  instructors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
    default: [],
  }],
});

export const Courses = mongoose.model("Courses", schema);
