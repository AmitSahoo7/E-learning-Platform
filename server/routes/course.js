import express from "express";
import {
  getAllCourses,
  getSingleCourse,
  fetchLectures,
  fetchLecture,
  getMyCourses,
  paymentVerification,
  addLecture,
} from "../controllers/course.js";
import { isAuth } from "../middlewares/isAuth.js";
import { uploadFiles } from "../middlewares/multer.js";

const router = express.Router();

router.get("/course/all", getAllCourses);
router.get("/course/:id", getSingleCourse);
router.get("/lectures/:id", isAuth, fetchLectures);
router.get("/lecture/:id", isAuth, fetchLecture);
router.get("/mycourse", isAuth, getMyCourses);
router.post("/course/checkout/:id", isAuth, paymentVerification);

// Add Lecture
router.post("/course/:id", isAuth, uploadFiles, addLecture);

export default router;