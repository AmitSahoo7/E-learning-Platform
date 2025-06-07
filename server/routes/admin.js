import express from "express";
import { isAdmin, isAuth } from "../middlewares/isAuth.js";
import { uploadFiles } from "../middlewares/multer.js";
import { createCourse} from "../controllers/admin.js";
const router = express.Router();

router.post("/course/new", isAuth, isAdmin, uploadFiles, createCourse);
router.post("/course/:id", isAuth, isAdmin, uploadFiles, addLectures);

export default router;
