import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  lectureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lecture",
    required: true,
  },
}, { timestamps: true });

// ✅ Named export (correct way to match your import)
export const Comment = mongoose.model("Comment", commentSchema);
