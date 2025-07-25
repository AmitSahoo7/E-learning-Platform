import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { rm } from "fs";
import { promisify } from "util";
import fs from "fs";
import { User } from "../models/User.js";
import { Payment } from "../models/Payment.js";
import Announcement from "../models/Announcement.js";
import UserAnnouncementStatus from "../models/UserAnnouncementStatus.js";

export const createCourse = TryCatch(async (req, res) => {
  const { 
    title, 
    description, 
    category, 
    createdBy, 
    duration, 
    price,
    tagline,
    difficulty,
    prerequisites,
    whatYouLearn,
    courseOutcomes,
    instructorName,
    instructorBio,
    instructors // This may be an array or a string
  } = req.body;

  const image = req.files?.image?.[0] || req.file;
  const pdf = req.files?.pdf?.[0];
  const instructorAvatar = req.files?.instructorAvatar?.[0];
  const previewVideo = req.files?.previewVideo?.[0];

  // Normalize instructors to an array of strings/ObjectIds
  let instructorsArray = [];
  if (Array.isArray(instructors)) {
    instructorsArray = instructors;
  } else if (typeof instructors === 'string' && instructors.length > 0) {
    instructorsArray = instructors.split(',').map(s => s.trim()).filter(Boolean);
  }

  // DEBUG: Log instructorsArray
  console.log('DEBUG: instructorsArray', instructorsArray);

  const course = await Courses.create({
    title,
    description,
    category,
    createdBy,
    image: image?.path,
    duration,
    price,
    pdf: pdf?.path,
    tagline,
    difficulty,
    prerequisites,
    whatYouLearn,
    courseOutcomes,
    instructorName,
    instructorBio,
    instructorAvatar: instructorAvatar?.path,
    previewVideo: previewVideo?.path,
    instructors: instructorsArray,
  });

  // Auto-enroll the creator as a student in their own course
  const user = await User.findById(createdBy);
  if (user && !user.subscription.includes(course._id)) {
    user.subscription.push(course._id);
    await user.save();
  }

  // Auto-enroll all assigned instructors in the course
  if (Array.isArray(instructorsArray) && instructorsArray.length > 0) {
    await Promise.all(instructorsArray.map(async (instructorId) => {
      const instructor = await User.findById(instructorId);
      console.log('DEBUG: instructorId', instructorId, 'found:', !!instructor);
      if (instructor && !instructor.subscription.includes(course._id)) {
        instructor.subscription.push(course._id);
        await instructor.save();
        console.log('DEBUG: instructor', instructor.email, 'enrolled in course', course._id.toString());
      }
    }));
  }

  res.status(201).json({
    message: "Course Created Successfully",
    course
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
  const allowedRoles = ["user", "instructor", "admin"];
  const { role } = req.body;

  if (!role || !allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  user.role = role;
  await user.save();
  return res.status(200).json({ message: `Role updated to ${role}` });
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

export const updateCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });

  // Update text fields if provided
  const fields = [
    "title", "description", "category", "createdBy", "duration", "price",
    "tagline", "difficulty", "prerequisites", "whatYouLearn", "courseOutcomes",
    "instructorName", "instructorBio"
  ];
  fields.forEach(field => {
    if (req.body[field] !== undefined) course[field] = req.body[field];
  });

  // Update files if new ones are uploaded
  if (req.files?.image?.[0]) course.image = req.files.image[0].path;
  if (req.files?.pdf?.[0]) course.pdf = req.files.pdf[0].path;
  if (req.files?.instructorAvatar?.[0]) course.instructorAvatar = req.files.instructorAvatar[0].path;
  if (req.files?.previewVideo?.[0]) course.previewVideo = req.files.previewVideo[0].path;

  // Update instructors if provided
  if (req.body.instructors !== undefined) {
    if (Array.isArray(req.body.instructors)) {
      course.instructors = req.body.instructors;
    } else if (typeof req.body.instructors === 'string' && req.body.instructors.length > 0) {
      course.instructors = req.body.instructors.split(',').map(s => s.trim()).filter(Boolean);
    } else {
      course.instructors = [];
    }
  }

  await course.save();

  // Auto-enroll newly assigned instructors in the course
  if (req.body.instructors !== undefined) {
    let instructorsArray = [];
    if (Array.isArray(req.body.instructors)) {
      instructorsArray = req.body.instructors;
    } else if (typeof req.body.instructors === 'string' && req.body.instructors.length > 0) {
      instructorsArray = req.body.instructors.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (instructorsArray.length > 0) {
      await Promise.all(instructorsArray.map(async (instructorId) => {
        const instructor = await User.findById(instructorId);
        if (instructor && !instructor.subscription.includes(course._id)) {
          instructor.subscription.push(course._id);
          await instructor.save();
        }
      }));
    }
  }

  res.json({ message: "Course updated successfully", course });
});

// Create announcement (admin only)
export const createAnnouncement = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });
    const announcement = await Announcement.create({
      message,
      createdBy: req.user._id,
    });
    res.status(201).json({ message: "Announcement created", announcement });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all announcements (latest first)
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email role");
    res.json({ announcements });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all announcements with user-specific status
export const getAnnouncementsWithStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    // Fetch user's account creation date
    const user = await User.findById(userId).select('createdAt');
    const userCreatedAt = user?.createdAt || new Date(0);
    // Only fetch announcements created after user's account creation
    const announcements = await Announcement.find({ createdAt: { $gte: userCreatedAt } })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email role");
    const statusList = await UserAnnouncementStatus.find({ userId });
    const statusMap = {};
    statusList.forEach(status => {
      statusMap[status.announcementId.toString()] = status;
    });
    const announcementsWithStatus = announcements.map(a => {
      const status = statusMap[a._id.toString()] || {};
      return {
        ...a.toObject(),
        isRead: status.isRead || false,
        isCleared: status.isCleared || false,
      };
    });
    res.json({ announcements: announcementsWithStatus });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark an announcement as read or cleared for the current user
export const markAnnouncementStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { announcementId } = req.body;
    const { isRead, isCleared } = req.body;
    if (!announcementId) return res.status(400).json({ message: "announcementId is required" });
    let status = await UserAnnouncementStatus.findOne({ userId, announcementId });
    if (!status) {
      status = new UserAnnouncementStatus({ userId, announcementId });
    }
    if (typeof isRead === 'boolean') status.isRead = isRead;
    if (typeof isCleared === 'boolean') status.isCleared = isCleared;
    status.updatedAt = new Date();
    await status.save();
    res.json({ message: "Status updated", status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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
