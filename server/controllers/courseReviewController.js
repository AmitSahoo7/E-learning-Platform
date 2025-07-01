import { CourseReview } from "../models/CourseReview.js";

// Submit a new or update review
export const submitCourseReview = async (req, res) => {
  const { courseId } = req.params;
  const { rating, review } = req.body;

  console.log("📩 Review submission incoming:", {
    user: req.user?._id,
    courseId,
    rating,
    review,
  });

  if (rating < 1 || rating > 5)
    return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });

  try {
    const data = await CourseReview.findOneAndUpdate(
      { courseId, userId: req.user._id },
      { rating, review },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    console.log("✅ Review saved:", data);
    res.status(200).json({ success: true, message: "Review saved", data });
  } catch (err) {
    console.error("❌ Review save error:", err);
    res.status(500).json({ success: false, message: "Failed to save review" });
  }
};


// Get all reviews of a course
export const getCourseReviews = async (req, res) => {
  /*console.log("✅ Route Hit! courseId = ", req.params.courseId); // Add this*/

  try {
    const reviews = await CourseReview.find({ courseId: req.params.courseId }).populate("userId", "name");
    res.status(200).json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching reviews" });
  }
};


// Get average rating for a course
export const getCourseAverageRating = async (req, res) => {
  try {
    const result = await CourseReview.aggregate([
      { $match: { courseId: new mongoose.Types.ObjectId(req.params.courseId) } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);
    const avg = result[0]?.avgRating || 0;
    const count = result[0]?.count || 0;
    res.status(200).json({ success: true, average: avg, count });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error getting average rating" });
  }
};

// Delete review
export const deleteCourseReview = async (req, res) => {
  try {
    const review = await CourseReview.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await review.deleteOne();
    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting review" });
  }
};
