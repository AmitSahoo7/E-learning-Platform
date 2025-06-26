import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { rm } from "fs";
import { promisify } from "util";
import fs from "fs";
import { User } from "../models/User.js";
import { Payment } from "../models/Payment.js";

export const createCourse = TryCatch(async (req, res) => {
  const { title, description, category, createdBy, duration, price } = req.body;

  const image = req.files?.image?.[0] || req.file;
  const pdf = req.files?.pdf?.[0];

  await Courses.create({
    title,
    description,
    category,
    createdBy,
    image: image?.path,
    duration,
    price,
    pdf: pdf?.path,
  });

  res.status(201).json({
    message: "Course Created Successfully",
  });
});

export const addLectures = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  if (!course)
    return res.status(404).json({
      message: "No Course with this id",
    });

  const { title, description } = req.body;
  const file = req.file;

  let lectureData = {
    title,
    description,
    course: course._id,
  };

  if (file) {
    if (file.mimetype === "application/pdf") {
      lectureData.pdf = file.path;
    } else if (file.mimetype === "video/mp4") {
      lectureData.video = file.path;
    }
  }

  const lecture = await Lecture.create(lectureData);

  res.status(201).json({
    message: "Lecture Added",
    lecture,
  });
});

export const deleteLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);

  rm(lecture.video, () => {
    console.log("Video deleted");
  });

  await lecture.deleteOne();

  res.json({ message: "Lecture Deleted" });
});

const unlinkAsync = promisify(fs.unlink);

export const deleteCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const lectures = await Lecture.find({ course: course._id });

  await Promise.all(
    lectures.map(async (lecture) => {
      if (lecture.video && fs.existsSync(lecture.video)) {
        await unlinkAsync(lecture.video);
        console.log("video deleted");
      }
    })
  );

  if (course.image && fs.existsSync(course.image)) {
    await unlinkAsync(course.image);
    console.log("image deleted");
  }

  await Lecture.deleteMany({ course: req.params.id });

  await course.deleteOne();

  await User.updateMany({}, { $pull: { subscription: req.params.id } });

  res.json({
    message: "Course Deleted",
  });
});

export const getAllStats = TryCatch(async (req, res) => {
  const totalCourses = (await Courses.find()).length;
  const totalLectures = (await Lecture.find()).length;
  const totalUsers = (await User.find()).length;

  const stats = {
    totalCourses,
    totalLectures,
    totalUsers,
  };

  res.json({
    stats,
  });
});

export const getAllUsers = TryCatch(async (req, res) => {
  const users = await User.find({});
  res.json({ users });
});

export const getAllUser = TryCatch(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } }).select(
    "-password"
  );

  res.json({ users });
});

export const updateRole = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user.role === "user") {
    user.role = "admin";
    await user.save();

    return res.status(200).json({
      message: "Role updated to admin",
    });
  }

  if (user.role === "admin") {
    user.role = "user";
    await user.save();

    return res.status(200).json({
      message: "Role updated to user",
    });
  }
});

export const getCoursesWithLectures = TryCatch(async (req, res) => {
  const courses = await Courses.find();
  const result = await Promise.all(
    courses.map(async (course) => {
      const lectures = await Lecture.find({ course: course._id });
      return {
        ...course.toObject(),
        lectures,
      };
    })
  );
  res.json({ courses: result });
});

export const getUsersWithSubscriptions = TryCatch(async (req, res) => {
  const users = await User.find().populate('subscription');
  res.json({ users });
});

export const getUserActivityStats = TryCatch(async (req, res) => {
  // Get all users' updatedAt timestamps
  const users = await User.find({}, 'updatedAt');
  // Create a histogram for 24 hours
  const activity = Array(24).fill(0);
  users.forEach(user => {
    const hour = new Date(user.updatedAt).getHours();
    activity[hour]++;
  });
  res.json({ activity });
});

export const getRecentPayments = TryCatch(async (req, res) => {
  const payments = await Payment.find().sort({ createdAt: -1 }).limit(5).populate('user').populate('course');
  res.json({ payments });
});

export const getEnrollmentTrends = TryCatch(async (req, res) => {
  // Mock data for last 7 days
  const today = new Date();
  const trends = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return {
      date: d.toLocaleDateString(),
      enrollments: Math.floor(Math.random() * 10) + 1,
    };
  });
  res.json({ trends });
});

export const getFeedbacks = TryCatch(async (req, res) => {
  // Mock feedbacks
  const feedbacks = [
    { _id: 1, user: { name: "Alice" }, message: "Great platform!", createdAt: new Date() },
    { _id: 2, user: { name: "Bob" }, message: "Need more courses.", createdAt: new Date() },
    { _id: 3, user: { name: "Charlie" }, message: "Support was helpful.", createdAt: new Date() },
    { _id: 4, user: { name: "Diana" }, message: "Found a bug in lectures.", createdAt: new Date() },
    { _id: 5, user: { name: "Eve" }, message: "Loving the new UI!", createdAt: new Date() },
  ];
  res.json({ feedbacks });
});


//Adding comment part over here
import { Comment } from "../models/Comment.js";

export const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find({})
      .populate("userId", "name")
      .populate("lectureId", "title");

    res.status(200).json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching comments" });
  }
};
