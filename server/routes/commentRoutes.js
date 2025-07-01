// server/routes/commentRoutes.js

import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { getComments, postComment, deleteComment } from "../controllers/commentController.js";

const router = express.Router();

router.get("/:lectureId", isAuth, getComments);
router.post("/:lectureId", isAuth, postComment);
router.delete("/:id", isAuth, deleteComment);

export default router;
