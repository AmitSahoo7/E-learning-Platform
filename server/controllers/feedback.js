import { Feedback } from "../models/Feedback.js";
import TryCatch from "../middlewares/TryCatch.js";

export const submitFeedback = TryCatch(async (req, res) => {
  const { message } = req.body;
  await Feedback.create({ user: req.user._id, message });
  res.json({ message: "Feedback submitted!" });
});

export const getAllFeedbacks = TryCatch(async (req, res) => {
  const feedbacks = await Feedback.find().populate("user").sort({ createdAt: -1 });
  res.json({ feedbacks });
});
