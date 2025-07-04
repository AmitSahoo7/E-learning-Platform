import { Reward } from "../models/Reward.js";
import { User } from "../models/User.js";
import { Lecture } from "../models/Lecture.js";
import TryCatch from "../middlewares/TryCatch.js";

// Award points for completing a video
export const awardVideoPoints = TryCatch(async (req, res) => {
  const { lectureId, courseId } = req.body;
  
  // Check if user already got points for this video
  const existingReward = await Reward.findOne({
    user: req.user._id,
    course: courseId,
    activityType: "video",
    description: `Completed video lecture: ${lectureId}`
  });

  if (existingReward) {
    return res.status(400).json({
      message: "Points already awarded for this video",
    });
  }

  // Get lecture details
  const lecture = await Lecture.findById(lectureId);
  if (!lecture) {
    return res.status(404).json({
      message: "Lecture not found",
    });
  }

  // Award 1 point for video completion
  const reward = await Reward.create({
    user: req.user._id,
    course: courseId,
    activityType: "video",
    points: 1,
    description: `Completed video lecture: ${lecture.title}`
  });

  // Update user's total points
  const user = await User.findById(req.user._id);
  user.totalPoints += 1;
  await user.save();

  res.status(201).json({
    message: "Points awarded for video completion",
    points: 1,
    totalPoints: user.totalPoints,
    reward
  });
});

// Award points for quiz completion (for future implementation)
export const awardQuizPoints = TryCatch(async (req, res) => {
  const { quizId, courseId, score } = req.body;
  
  // Check if user already got points for this quiz
  const existingReward = await Reward.findOne({
    user: req.user._id,
    course: courseId,
    activityType: "quiz",
    description: `Completed quiz: ${quizId}`
  });

  if (existingReward) {
    return res.status(400).json({
      message: "Points already awarded for this quiz",
    });
  }

  // Award 10 points for quiz completion
  const reward = await Reward.create({
    user: req.user._id,
    course: courseId,
    activityType: "quiz",
    points: 10,
    description: `Completed quiz with score: ${score}%`
  });

  // Update user's total points
  const user = await User.findById(req.user._id);
  user.totalPoints += 10;
  await user.save();

  res.status(201).json({
    message: "Points awarded for quiz completion",
    points: 10,
    totalPoints: user.totalPoints,
    reward
  });
});

// Award points for final assessment completion (for future implementation)
export const awardAssessmentPoints = TryCatch(async (req, res) => {
  const { assessmentId, courseId, score } = req.body;
  
  // Check if user already got points for this assessment
  const existingReward = await Reward.findOne({
    user: req.user._id,
    course: courseId,
    activityType: "assessment",
    description: `Completed final assessment: ${assessmentId}`
  });

  if (existingReward) {
    return res.status(400).json({
      message: "Points already awarded for this assessment",
    });
  }

  // Award 100 points for assessment completion
  const reward = await Reward.create({
    user: req.user._id,
    course: courseId,
    activityType: "assessment",
    points: 100,
    description: `Completed final assessment with score: ${score}%`
  });

  // Update user's total points
  const user = await User.findById(req.user._id);
  user.totalPoints += 100;
  await user.save();

  res.status(201).json({
    message: "Points awarded for assessment completion",
    points: 100,
    totalPoints: user.totalPoints,
    reward
  });
});

// Get user's reward history
export const getUserRewards = TryCatch(async (req, res) => {
  const rewards = await Reward.find({ user: req.user._id })
    .populate("course", "title")
    .sort({ createdAt: -1 });

  const user = await User.findById(req.user._id);

  res.json({
    rewards,
    totalPoints: user.totalPoints
  });
});

// Get leaderboard
export const getLeaderboard = TryCatch(async (req, res) => {
  const users = await User.find({ role: "user" })
    .select("name totalPoints role")
    .sort({ totalPoints: -1 })
    .limit(50);

  // For safety, if any admin/instructor sneaks in, mark their points as 'Not Applicable'
  const leaderboard = users.map(u => ({
    ...u.toObject(),
    totalPoints: (u.role === 'admin' || u.role === 'instructor') ? 'Not Applicable' : u.totalPoints
  }));

  res.json({
    leaderboard
  });
});

// Get user's ranking
export const getUserRanking = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.role === 'admin' || user.role === 'instructor') {
    return res.json({
      ranking: 'Not Applicable',
      totalPoints: 'Not Applicable',
      totalUsers: await User.countDocuments({ role: "user" })
    });
  }

  // Count users with more points than current user
  const usersWithMorePoints = await User.countDocuments({
    totalPoints: { $gt: user.totalPoints },
    role: "user"
  });

  const ranking = usersWithMorePoints + 1;

  res.json({
    ranking,
    totalPoints: user.totalPoints,
    totalUsers: await User.countDocuments({ role: "user" })
  });
}); 