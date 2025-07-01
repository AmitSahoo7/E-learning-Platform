import { instance } from "../index.js";
import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { Payment } from "../models/Payment.js";
import { User } from "../models/User.js";
import { Progress } from "../models/Progress.js";
import { Reward } from "../models/Reward.js";
import crypto from 'crypto';
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

  if (!progress || progress.length === 0) {
    return res.json({
      courseProgressPercentage: 0,
      completedLectures: 0,
      allLectures,
      progress: [],
    });
  }


  const completedLectures = progress[0].completedLectures.length;
  const courseProgressPercentage = (completedLectures * 100) / allLectures;

  res.json({
    courseProgressPercentage,
    completedLectures,
    allLectures,
    progress,
  });
});
