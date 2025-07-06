import express from "express";
import {
  getAllCourses,
  getSingleCourse,
  fetchLectures,
  fetchLecture,
  getMyCourses,
  checkout,
  paymentVerification,
  addLecture,
  deleteLecture,
  getInstructorCourses,
  getInstructorCourseStats,
  getCourseUserStats,
  updateCourseContentOrder,
} from "../controllers/course.js";
import { isAuth } from "../middlewares/isAuth.js";
import { uploadFiles } from "../middlewares/multer.js";
// import { deleteLecture } from "../controllers/lecture.js";

const router = express.Router();

// Move this route for updating order to the top, before any /:id routes
router.post('/course/update-content-order', isAuth, updateCourseContentOrder);

router.get("/course/all", getAllCourses);
router.get("/course/:id", getSingleCourse);
router.get("/lectures/:id", isAuth, fetchLectures);
router.get("/lecture/:id", isAuth, fetchLecture);
router.get("/mycourse", isAuth, getMyCourses);
router.get("/instructor/courses", isAuth, getInstructorCourses);
router.get("/instructor/course-stats", isAuth, getInstructorCourseStats);
router.get("/instructor/course/:id/users", isAuth, getCourseUserStats);

// More specific routes first
router.post("/course/checkout/:id", isAuth, checkout);
router.post("/verification/:id", isAuth, paymentVerification);

// Generic route last
router.post("/course/:id", isAuth, uploadFiles, addLecture);

router.delete("/lecture/:id", isAuth, deleteLecture);

export default router;