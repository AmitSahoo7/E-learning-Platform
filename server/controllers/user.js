import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail, { sendForgotMail } from "../middlewares/sendMail.js";
import TryCatch from "../middlewares/TryCatch.js";
import { Progress } from "../models/Progress.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { Reward } from "../models/Reward.js";
import { UserActivity } from "../models/UserActivity.js";

export const register = TryCatch(async (req, res) => {
  const { email, name, password, role, mobile } = req.body;

  let user = await User.findOne({ email });

  if (user)
    return res.status(400).json({
      message: "User Already exists",
    });

  const hashPassword = await bcrypt.hash(password, 10);

  let photo = '';
  if (req.file) {
    photo = req.file.path;
  }

  user = {
    name,
    email,
    password: hashPassword,
    role: role || 'user',
    mobile: mobile || '',
    photo,
  };

  const otp = Math.floor(Math.random() * 1000000);

  const activationToken = jwt.sign(
    {
      user,
      otp,
    },
    process.env.Activation_Secret,
    {
      expiresIn: "5m",
    }
  );

  const data = {
    name,
    otp,
  };

  await sendMail(email, "E learning", data);

  res.status(200).json({
    message: "Otp send to your mail",
    activationToken,
  });
});

export const verifyUser = TryCatch(async (req, res) => {
  const { otp, activationToken } = req.body;

  const verify = jwt.verify(activationToken, process.env.Activation_Secret);

  if (!verify)
    return res.status(400).json({
      message: "Otp Expired",
    });

  if (verify.otp !== otp)
    return res.status(400).json({
      message: "Wrong Otp",
    });

  await User.create({
    name: verify.user.name,
    email: verify.user.email,
    password: verify.user.password,
    role: verify.user.role || 'user',
    mobile: verify.user.mobile || '',
    photo: verify.user.photo || '',
  });

  res.json({
    message: "User Registered",
  });
});

export const loginUser = TryCatch(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return res.status(400).json({
      message: "No User with this email",
    });

  const mathPassword = await bcrypt.compare(password, user.password);

  if (!mathPassword)
    return res.status(400).json({
      message: "wrong Password",
    });

  const token = jwt.sign({ _id: user._id }, process.env.Jwt_Sec, {
    expiresIn: "15d",
  });

  res.json({
    message: `Welcome back ${user.name}`,
    token,
    user,
  });
});

export const myProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({ user });
});

export const updateProfile = TryCatch(async (req, res) => {
  const userId = req.user._id;
  const { name, mobile } = req.body;
  const update = {};
  if (name) update.name = name;
  if (mobile) update.mobile = mobile;
  if (req.file) update.photo = req.file.path;

  if (!name && !mobile && !req.file) return res.status(400).json({ message: "No data to update" });

  const user = await User.findByIdAndUpdate(userId, update, { new: true });
  res.json({ message: "Profile updated", user });
});

export const forgotPassword = TryCatch(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return res.status(404).json({
      message: "No User with this email",
    });

  const token = jwt.sign({ email }, process.env.Forgot_Secret);

  const data = { email, token };

  await sendForgotMail("E learning", data);

  user.resetPasswordExpire = Date.now() + 5 * 60 * 1000;

  await user.save();

  res.json({
    message: "Reset Password Link is send to you mail",
  });
});

export const resetPassword = TryCatch(async (req, res) => {
  const decodedData = jwt.verify(req.query.token, process.env.Forgot_Secret);

  const user = await User.findOne({ email: decodedData.email });

  if (!user)
    return res.status(404).json({
      message: "No user with this email",
    });

  if (user.resetPasswordExpire === null)
    return res.status(400).json({
      message: "Token Expired",
    });

  if (user.resetPasswordExpire < Date.now()) {
    return res.status(400).json({
      message: "Token Expired",
    });
  }

  const password = await bcrypt.hash(req.body.password, 10);

  user.password = password;

  user.resetPasswordExpire = null;

  await user.save();

  res.json({ message: "Password Reset" });
});

// Get user dashboard stats
export const getDashboardStats = TryCatch(async (req, res) => {
  const userId = req.user._id;
  
  // Get user's enrolled courses
  const user = await User.findById(userId);
  const enrolledCourses = user.subscription || [];
  
  // Get progress for all enrolled courses
  const progressData = await Progress.find({ user: userId });
  
  // Calculate total progress
  let totalProgress = 0;
  let completedCourses = 0;
  let totalLectures = 0;
  let completedLectures = 0;
  
  for (const progress of progressData) {
    const course = await Courses.findById(progress.course);
    if (course) {
      const courseLectures = await Lecture.find({ course: progress.course });
      const courseProgress = courseLectures.length > 0 
        ? (progress.completedLectures.length / courseLectures.length) * 100 
        : 0;
      
      totalProgress += courseProgress;
      totalLectures += courseLectures.length;
      completedLectures += progress.completedLectures.length;
      
      if (courseProgress >= 100) {
        completedCourses++;
      }
    }
  }
  
  const averageProgress = enrolledCourses.length > 0 ? totalProgress / enrolledCourses.length : 0;
  
  // Get user's total points
  const totalPoints = user.totalPoints || 0;
  
  // Calculate learning streak (real logic)
  const activities = await UserActivity.find({ user: userId }).sort({ timestamp: -1 });
  let streak = 0;
  if (activities.length > 0) {
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // today at midnight
    let activityIdx = 0;
    let keepCounting = true;
    while (keepCounting) {
      // Find if there is any activity for currentDate
      let found = false;
      while (activityIdx < activities.length) {
        const actDate = new Date(activities[activityIdx].timestamp);
        actDate.setHours(0, 0, 0, 0);
        if (actDate.getTime() === currentDate.getTime()) {
          found = true;
          // skip all activities for this day
          while (
            activityIdx < activities.length &&
            new Date(activities[activityIdx].timestamp).setHours(0, 0, 0, 0) === currentDate.getTime()
          ) {
            activityIdx++;
          }
          break;
        } else if (actDate < currentDate) {
          break;
        } else {
          activityIdx++;
        }
      }
      if (found) {
        streak++;
        // Move to previous day
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        keepCounting = false;
      }
    }
  }
  const learningStreak = streak;
  
  // Get user's rank
  const allUsers = await User.find({ role: { $ne: 'admin' } }).sort({ totalPoints: -1 });
  const userRank = allUsers.findIndex(u => u._id.toString() === userId.toString()) + 1;
  
  // Calculate total time spent (mock data for now)
  const totalTimeSpent = Math.floor(Math.random() * 120) + 30; // 30-150 minutes
  
  res.json({
    totalCourses: enrolledCourses.length,
    completedCourses,
    totalPoints,
    learningStreak,
    totalTimeSpent,
    currentRank: userRank,
    totalUsers: allUsers.length,
    averageProgress: Math.round(averageProgress),
    totalLectures,
    completedLectures
  });
});

// Get user rewards/achievements
export const getUserRewards = TryCatch(async (req, res) => {
  const userId = req.user._id;
  
  const rewards = await Reward.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('course', 'title')
    .limit(20);
  
  res.json({ rewards });
});

// Get user learning analytics
export const getLearningAnalytics = TryCatch(async (req, res) => {
  const userId = req.user._id;
  
  // Get weekly progress (mock data for now)
  const weeklyProgress = [
    { day: 'Mon', progress: Math.floor(Math.random() * 100) },
    { day: 'Tue', progress: Math.floor(Math.random() * 100) },
    { day: 'Wed', progress: Math.floor(Math.random() * 100) },
    { day: 'Thu', progress: Math.floor(Math.random() * 100) },
    { day: 'Fri', progress: Math.floor(Math.random() * 100) },
    { day: 'Sat', progress: Math.floor(Math.random() * 100) },
    { day: 'Sun', progress: Math.floor(Math.random() * 100) }
  ];
  
  // Get quiz scores (mock data for now)
  const quizScores = Array.from({ length: 7 }, () => Math.floor(Math.random() * 30) + 70);
  
  // Get video completion (mock data for now)
  const videoCompletion = Array.from({ length: 7 }, (_, i) => (i + 1) * 5 + Math.floor(Math.random() * 10));
  
  res.json({
    weeklyProgress,
    quizScores,
    videoCompletion
  });
});

// Get recommended courses
export const getRecommendedCourses = TryCatch(async (req, res) => {
  const userId = req.user._id;
  
  // Get user's enrolled courses to avoid recommending them
  const user = await User.findById(userId);
  const enrolledCourseIds = user.subscription || [];
  
  // Get courses not enrolled by user
  const recommendedCourses = await Courses.find({
    _id: { $nin: enrolledCourseIds }
  })
  .limit(6)
  .sort({ createdAt: -1 });
  
  res.json({ recommendedCourses });
});

// Update user study goals
export const updateStudyGoals = TryCatch(async (req, res) => {
  const userId = req.user._id;
  const { dailyGoal, weeklyGoal, monthlyGoal } = req.body;
  
  // Store goals in user document or separate collection
  await User.findByIdAndUpdate(userId, {
    studyGoals: {
      dailyGoal: dailyGoal || 30,
      weeklyGoal: weeklyGoal || 5,
      monthlyGoal: monthlyGoal || 2
    }
  });
  
  res.json({ message: "Study goals updated successfully" });
});

// Get user study goals
export const getStudyGoals = TryCatch(async (req, res) => {
  const userId = req.user._id;
  
  const user = await User.findById(userId);
  const studyGoals = user.studyGoals || {
    dailyGoal: 30,
    weeklyGoal: 5,
    monthlyGoal: 2
  };
  
  res.json({ studyGoals });
});

// Get user recent activity
export const getUserRecentActivity = TryCatch(async (req, res) => {
  const userId = req.user._id;
  
  const activities = await UserActivity.find({ user: userId })
    .sort({ timestamp: -1 })
    .limit(10)
    .populate('course', 'title');
  
  res.json({ activities });
});

// Get user weekly progress analytics
export const getUserWeeklyProgress = TryCatch(async (req, res) => {
  const userId = req.user._id;

  // Use IST (UTC+5:30) for week calculation
  const IST_OFFSET_MINUTES = 330; // 5 hours 30 minutes
  const now = new Date();
  // Convert current time to IST
  const nowIST = new Date(now.getTime() + IST_OFFSET_MINUTES * 60000);
  const istDay = nowIST.getDay(); // 0 (Sun) - 6 (Sat)
  // Get start of week in IST
  const startOfWeekIST = new Date(nowIST);
  startOfWeekIST.setDate(nowIST.getDate() - istDay);
  startOfWeekIST.setHours(0, 0, 0, 0);
  // Convert startOfWeekIST back to UTC for DB query
  const startOfWeekUTC = new Date(startOfWeekIST.getTime() - IST_OFFSET_MINUTES * 60000);

  // Get activities for the current week (in UTC, but week start is IST)
  const weeklyActivities = await UserActivity.find({
    user: userId,
    timestamp: { $gte: startOfWeekUTC }
  }).sort({ timestamp: 1 });

  // Group activities by day (IST) and count only unique activities per type per day
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyProgress = daysOfWeek.map((day, index) => {
    // Calculate IST day start/end, then convert to UTC for comparison
    const dayStartIST = new Date(startOfWeekIST);
    dayStartIST.setDate(startOfWeekIST.getDate() + index);
    dayStartIST.setHours(0, 0, 0, 0);
    const dayEndIST = new Date(dayStartIST);
    dayEndIST.setDate(dayStartIST.getDate() + 1);
    // Convert to UTC
    const dayStartUTC = new Date(dayStartIST.getTime() - IST_OFFSET_MINUTES * 60000);
    const dayEndUTC = new Date(dayEndIST.getTime() - IST_OFFSET_MINUTES * 60000);

    // Filter activities for this day
    const dayActivities = weeklyActivities.filter(activity => {
      const ts = new Date(activity.timestamp);
      return ts >= dayStartUTC && ts < dayEndUTC;
    });

    // Count only unique activities per type per day
    const uniqueSet = new Set();
    dayActivities.forEach(activity => {
      if (activity.activityType === 'video') {
        if (activity.lecture) {
          uniqueSet.add('video-' + activity.lecture.toString());
        } else if (activity.title) {
          uniqueSet.add('video-' + activity.title);
        }
      } else if (activity.activityType === 'quiz') {
        if (activity.quiz) {
          uniqueSet.add('quiz-' + activity.quiz.toString());
        } else if (activity.title) {
          uniqueSet.add('quiz-' + activity.title);
        }
      } else {
        // fallback: count by _id
        uniqueSet.add(activity._id.toString());
      }
    });
    const uniqueCount = uniqueSet.size;

    // Calculate progress based on unique activities
    let progress = 0;
    if (uniqueCount > 0) {
      progress = Math.min(uniqueCount * 15, 100); // 15% per unique activity, max 100%
    }

    return { day, progress };
  });

  res.json({ weeklyProgress });
});

// Record user activity (to be called from other controllers)
export const recordUserActivity = async (userId, activityData) => {
  try {
    await UserActivity.create({
      user: userId,
      ...activityData
    });
  } catch (error) {
    console.error('Error recording user activity:', error);
  }
};

// Get today's total lecture watch time (in minutes) for the user
export const getTodayLectureMinutes = TryCatch(async (req, res) => {
  const userId = req.user._id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Find all 'video' activities for today
  const activities = await UserActivity.find({
    user: userId,
    activityType: 'video',
    timestamp: { $gte: today, $lt: tomorrow }
  });

  // Sum up durations (in minutes) from metadata.duration, default to 0 if missing
  const minutesStudied = activities.reduce((sum, act) => sum + (act.metadata?.duration || 0), 0);

  res.json({ minutesStudied });
});

export const logLectureWatch = TryCatch(async (req, res) => {
  const { lectureId, courseId, duration } = req.body;
  const lecture = await Lecture.findById(lectureId);
  await UserActivity.create({
    user: req.user._id,
    activityType: "video",
    title: `Watched ${lecture?.title || 'Lecture'}`,
    course: courseId,
    courseName: (await Courses.findById(courseId))?.title || "Unknown Course",
    lecture: lectureId,
    metadata: { duration: Number(duration) }
  });
  res.json({ message: "Watch time logged" });
});