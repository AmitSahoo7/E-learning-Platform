// server/controllers/commentController.js

import { Comment } from "../models/Comment.js";

// Get comments
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ lectureId: req.params.lectureId }).populate("userId", "name");
    res.status(200).json({ success: true, comments });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch comments" });
  }
};

// Post a comment
export const postComment = async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ success: false, message: "Comment cannot be empty" });
  }

  try {
    const comment = await Comment.create({
      text,
      userId: req.user._id,
      lectureId: req.params.lectureId,
    });

    // Populate username for immediate UI use
    await comment.populate("userId", "name");

    res.status(201).json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to post comment" });
  }
};

// Delete comment
// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Allow if user owns comment OR is admin
    if (
      comment.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await comment.deleteOne();
    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
