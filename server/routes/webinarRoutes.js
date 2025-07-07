import express from 'express';
import { createWebinar, getWebinars, updateWebinar, deleteWebinar } from '../controllers/webinarController.js';
import multer from 'multer';
import path from 'path';
import { isAuth } from '../middlewares/isAuth.js';
import TryCatch from '../middlewares/TryCatch.js';
// Assume isAdmin middleware exists or add admin check in isAuth

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads');
  },
  filename(req, file, cb) {
    const extName = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extName}`;
    cb(null, fileName);
  },
});
const upload = multer({ storage });

// CREATE Webinar
router.post('/', isAuth, upload.single('document'), TryCatch(createWebinar));
// GET all webinars (public)
router.get('/', TryCatch(getWebinars));
// UPDATE Webinar
router.put('/:id', isAuth, upload.single('document'), TryCatch(updateWebinar));
// DELETE Webinar
router.delete('/:id', isAuth, TryCatch(deleteWebinar));

export default router; 