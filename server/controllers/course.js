import { instance } from "../index.js";
import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { Payment } from "../models/Payment.js";
import { User } from "../models/User.js";
import { Progress } from "../models/Progress.js";
import { Reward } from "../models/Reward.js";
import crypto from 'crypto';
import Quiz from '../models/quiz.js';
// import { deleteLecture } from "../controllers/course.js";

export const getAllCourses = TryCatch(async (req, res) => {
  const courses = await Courses.find();
  res.json({
    courses,
  });
});

export const getSingleCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  res.json({
    course,
  });
});

export const fetchLectures = TryCatch(async (req, res) => {
  const lectures = await Lecture.find({ course: req.params.id });

  const user = await User.findById(req.user._id);

  if (user.role === "admin") {
    return res.json({ lectures });
  }

  if (!user.subscription.includes(req.params.id))
    return res.status(400).json({
      message: "You have not subscribed to this course",
    });

  res.json({ lectures });
});

export const fetchLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);

  const user = await User.findById(req.user._id);

  if (user.role === "admin") {
    return res.json({ lecture });
  }

  if (!user.subscription.includes(lecture.course))
    return res.status(400).json({
      message: "You have not subscribed to this course",
    });

  res.json({ lecture });
});

export const getMyCourses=TryCatch(async(req,res)=>{
  const courses=await Courses.find({_id:req.user.subscription})

  res.json({
    courses,
  });
});

export const checkout=TryCatch(async(req,res)=>{
  const user=await User.findById(req.user._id);

  const course=await Courses.findById(req.params.id);

  if(!course) {
    return res.status(404).json({
      message: "Course not found",
    });
  }

  if(user.subscription.includes(course._id)) {
    return res.status(400).json({
      message:"You already have this course",
    });
  }

  const options={
    amount:Number(course.price*100),
    currency: "INR",
  };

  const order=await instance.orders.create(options);

  res.status(201).json({
    order,
    course,
    key: process.env.Razorpay_Key,
  });
});

export const paymentVerification=TryCatch(async(req,res)=>{
  const {razorpay_order_id,razorpay_payment_id,razorpay_signature}=req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature=crypto
    .createHmac("sha256",process.env.Razorpay_Secret)
    .update(body)
    .digest("hex");

  const isAuthentic= expectedSignature===razorpay_signature;

  if(isAuthentic){
    const course = await Courses.findById(req.params.id);

    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user: req.user._id,
      course: req.params.id,
      amount: course.price,
    });

    const user=await User.findById(req.user._id);
    if (!user.subscription.includes(course._id)) {
      user.subscription.push(course._id);
      await user.save();
    }

    res.status(200).json({
      message: "Course purchased successfully",
    });

  }else{
    return res.status(400).json({
      message:"Payment Failed"
    });
  }
});

export const addLecture = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  if (!course)
    return res.status(404).json({
      message: "No Course with this id",
    });

  const { title, description } = req.body;
  // Support both video and pdf fields
  const files = req.files || {};
  let lectureData = {
    title,
    description,
    course: course._id,
    uploadedBy: req.user._id,
  };

  if (files.file && files.file[0]) {
    if (files.file[0].mimetype === "video/mp4") {
      lectureData.video = files.file[0].path;
    } else if (files.file[0].mimetype === "application/pdf") {
      lectureData.pdf = files.file[0].path;
    }
  }
  if (files.pdf && files.pdf[0]) {
    lectureData.pdf = files.pdf[0].path;
  }

  const lecture = await Lecture.create(lectureData);

  res.status(201).json({
    message: "Lecture Added",
    lecture,
  });
});

export const deleteLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);
  if (!lecture) return res.status(404).json({ message: "Lecture not found" });
  await lecture.deleteOne();
  res.json({ message: "Lecture Deleted" });
});

export const addProgress = TryCatch(async (req, res) => {
  let progress = await Progress.findOne({
    user: req.user._id,
    course: req.query.course,
  });

  const { lectureId } = req.query;

  if (!progress) {
    // Create a new progress document if it doesn't exist
    progress = await Progress.create({
      user: req.user._id,
      course: req.query.course,
      completedLectures: [lectureId],
    });
    
    // Award points for video completion
    try {
      const lecture = await Lecture.findById(lectureId);
      if (lecture) {
        // Check if user already got points for this video
        const existingReward = await Reward.findOne({
          user: req.user._id,
          course: req.query.course,
          activityType: "video",
          description: `Completed video lecture: ${lectureId}`
        });

        if (!existingReward) {
          // Award 1 point for video completion
          await Reward.create({
            user: req.user._id,
            course: req.query.course,
            activityType: "video",
            points: 1,
            description: `Completed video lecture: ${lecture.title}`
          });

          // Update user's total points
          const user = await User.findById(req.user._id);
          user.totalPoints += 1;
          await user.save();
        }
      }
    } catch (error) {
      console.log("Error awarding points:", error.message);
    }
    
    return res.status(201).json({ message: "Progress started" });
  }

  if (progress.completedLectures.includes(lectureId)) {
    return res.json({
      message: "Progress recorded",
    });
  }

  progress.completedLectures.push(lectureId);

  await progress.save();

  // Award points for video completion
  try {
    const lecture = await Lecture.findById(lectureId);
    if (lecture) {
      // Check if user already got points for this video
      const existingReward = await Reward.findOne({
        user: req.user._id,
        course: req.query.course,
        activityType: "video",
        description: `Completed video lecture: ${lectureId}`
      });

      if (!existingReward) {
        // Award 1 point for video completion
        await Reward.create({
          user: req.user._id,
          course: req.query.course,
          activityType: "video",
          points: 1,
          description: `Completed video lecture: ${lecture.title}`
        });

        // Update user's total points
        const user = await User.findById(req.user._id);
        user.totalPoints += 1;
        await user.save();
      }
    }
  } catch (error) {
    console.log("Error awarding points:", error.message);
  }

  res.status(201).json({
    message: "New Progress added",
  });
});

export const getYourProgress = TryCatch(async (req, res) => {
  const progress = await Progress.find({
    user: req.user._id,
    course: req.query.course,
  });

  if (!progress || progress.length === 0) {
  return res.status(404).json({ message: "No progress found" });
}

  const allLectures = (await Lecture.find({ course: req.query.course })).length;
  const allQuizzesArr = await Quiz.find({ courseId: req.query.course });
  const allQuizzes = allQuizzesArr.length;

  let completedQuizzes = 0;
  if (progress[0] && Array.isArray(progress[0].quizScores)) {
    // Only count quizzes where bestScore >= 75% of total questions
    completedQuizzes = progress[0].quizScores.filter(qs => {
      const quiz = allQuizzesArr.find(q => q._id.toString() === qs.quiz.toString());
      if (!quiz) return false;
      return quiz.questions && quiz.questions.length > 0 && (qs.bestScore / quiz.questions.length) >= 0.75;
    }).length;
  }
  const quizProgressPercentage = (completedQuizzes * 100) / (allQuizzes || 1);

  if (!progress || progress.length === 0) {
    return res.json({
      courseProgressPercentage: 0,
      completedLectures: 0,
      allLectures,
      quizProgressPercentage: 0,
      completedQuizzes: 0,
      allQuizzes,
      progress: [],
    });
  }


  const completedLectures = progress[0].completedLectures.length;
  const courseProgressPercentage = (completedLectures * 100) / (allLectures || 1);


  res.json({
    courseProgressPercentage,
    completedLectures,
    allLectures,
    quizProgressPercentage,
    completedQuizzes,
    allQuizzes,
    quizScores: progress[0].quizScores || [],
    progress,
  });
});

export const getInstructorCourses = TryCatch(async (req, res) => {
  // Find courses where user is creator or uploaded at least one lecture
  const createdCourses = await Courses.find({ createdBy: req.user._id });
  const lectureCourses = await Lecture.find({ uploadedBy: req.user._id }).distinct('course');
  const lectureCourseDocs = await Courses.find({ _id: { $in: lectureCourses } });
  // Merge and remove duplicates
  const allCourses = [...createdCourses, ...lectureCourseDocs].filter((course, index, self) =>
    index === self.findIndex((c) => c._id.toString() === course._id.toString())
  );
  res.json({ courses: allCourses });
});

export const getInstructorCourseStats = TryCatch(async (req, res) => {
  // Find courses where user is creator or uploaded at least one lecture
  const createdCourses = await Courses.find({ createdBy: req.user._id });
  const lectureCourses = await Lecture.find({ uploadedBy: req.user._id }).distinct('course');
  const lectureCourseDocs = await Courses.find({ _id: { $in: lectureCourses } });
  // Merge and remove duplicates
  const allCourses = [...createdCourses, ...lectureCourseDocs].filter((course, index, self) =>
    index === self.findIndex((c) => c._id.toString() === course._id.toString())
  );

  console.log("Instructor ID:", req.user._id);
  console.log("Created courses:", createdCourses.map(c => c._id));
  console.log("Lecture courses:", lectureCourses);
  console.log("All courses:", allCourses.map(c => c._id));

  const courseStats = await Promise.all(
    allCourses.map(async (course) => {
      // Count enrolled users (users who have this course in their subscription)
      const enrolledUsers = await User.countDocuments({
        subscription: course._id
      });
      // Get total watch time from progress records
      const progressRecords = await Progress.find({ course: course._id });
      const totalWatchTime = progressRecords.reduce(
        (sum, record) => sum + (record.completedLectures ? record.completedLectures.length : 0),
        0
      );
      return {
        _id: course._id,
        title: course.title,
        enrolledUsers,
        totalWatchTime,
        totalLectures: await Lecture.countDocuments({ course: course._id })
      };
    })
  );
  res.json({ courseStats });
});

export const getCourseUserStats = TryCatch(async (req, res) => {
  const courseId = req.params.id;
  // Find all users enrolled in this course
  const users = await User.find({ subscription: courseId });
  // For each user, get their progress for this course
  const userStats = await Promise.all(users.map(async (user) => {
    const progress = await Progress.findOne({ user: user._id, course: courseId });
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      watchTime: progress && progress.completedLectures ? progress.completedLectures.length : 0,
    };
  }));
  res.json({ userStats });
});
