import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  submitCourseReview,
  getCourseReviews,
  getCourseAverageRating,
  deleteCourseReview,
} from "../controllers/courseReviewController.js";

const router = express.Router();

router.post("/:courseId", isAuth, submitCourseReview);
router.get("/:courseId", getCourseReviews);
router.get("/:courseId/average", getCourseAverageRating);
router.delete("/:courseId", isAuth, deleteCourseReview);

export default router;
