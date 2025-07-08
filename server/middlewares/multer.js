import multer from "multer";
import { v4 as uuid } from "uuid";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads");
  },
  filename(req, file, cb) {
    const id = uuid();

    const extName = file.originalname.split(".").pop();

    const fileName = `${id}.${extName}`;

    cb(null, fileName);
  },
});

export const uploadFiles = multer({ storage }).fields([
  { name: "file", maxCount: 1 },
  { name: "pdf", maxCount: 1 }
]);

// For course creation: accept image, pdf, instructor avatar, and preview video fields
export const uploadCourseFiles = multer({ storage }).fields([
  { name: "image", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
  { name: "instructorAvatar", maxCount: 1 },
  { name: "previewVideo", maxCount: 1 },
]);

export const uploadUserPhoto = multer({ storage }).single('photo');
