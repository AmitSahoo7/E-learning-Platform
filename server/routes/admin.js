import express from "express";
import { isAdmin, isAuth } from "../middlewares/isAuth.js";
import {
  addLectures,
  createCourse,
  deleteCourse,
  deleteLecture,
  getAllStats,
  getAllUsers,
  updateRole,
  getCoursesWithLectures,
  getUsersWithSubscriptions,
  getUserActivityStats,
  getRecentPayments,
  getEnrollmentTrends,
  getFeedbacks,

  updateCourse,

  createAnnouncement,
  getAnnouncements,

} from "../controllers/admin.js";
import { uploadFiles, uploadCourseFiles } from "../middlewares/multer.js";
import { getAllCourses } from "../controllers/course.js";

const router = express.Router();

router.post("/course/new", isAuth, isAdmin, uploadCourseFiles, createCourse);
router.post("/course/:id", isAuth, isAdmin, uploadFiles, addLectures);
router.delete("/course/:id", isAuth, isAdmin, deleteCourse);
router.delete("/lecture/:id", isAuth, isAdmin, deleteLecture);
router.get("/stats", isAuth, isAdmin, getAllStats);
router.get("/users", isAuth, isAdmin, getAllUsers);
router.put("/user/:id", isAuth, isAdmin, updateRole);
router.get("/courses-with-lectures", isAuth, isAdmin, getCoursesWithLectures);
router.get("/users-with-subscriptions", isAuth, isAdmin, getUsersWithSubscriptions);
router.get("/user-activity-stats", isAuth, isAdmin, getUserActivityStats);
router.get("/payments", isAuth, isAdmin, getRecentPayments);
router.get("/enrollment-trends", isAuth, isAdmin, getEnrollmentTrends);
router.get("/feedbacks", isAuth, isAdmin, getFeedbacks);
router.get("/course", isAuth, isAdmin, getAllCourses);
router.put("/course/:id", isAuth, isAdmin, uploadCourseFiles, updateCourse);

// Announcements
router.post("/announcement", isAuth, isAdmin, createAnnouncement);
router.get("/announcements", isAuth, getAnnouncements);

export default router;