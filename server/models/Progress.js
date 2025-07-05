import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Courses",
    },
    completedLectures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    completedQuizzes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
      },
    ],
    quizScores: [
      {
        quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
        bestScore: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Progress = mongoose.model("Progress", schema);
