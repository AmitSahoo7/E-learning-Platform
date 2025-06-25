import express from "express";
import { isAuth, isAdmin } from "../middlewares/isAuth.js";
import { submitFeedback, getAllFeedbacks } from "../controllers/feedback.js";
const router = express.Router();

router.post("/", isAuth, submitFeedback);
router.get("/", isAuth, isAdmin, getAllFeedbacks);

export default router;
