import { Reward } from "../models/Reward.js";
import { User } from "../models/User.js";
import { Lecture } from "../models/Lecture.js";
import TryCatch from "../middlewares/TryCatch.js";
import { Progress } from "../models/Progress.js";
import Quiz from "../models/Quiz.js";

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

// Helper function to calculate total points including quiz bonus
const calculateTotalPointsWithQuizBonus = async (userId) => {
  const user = await User.findById(userId);
  if (!user || user.role === 'admin' || user.role === 'instructor') {
    return user ? user.totalPoints : 0;
  }

  // Get user's progress and calculate quiz bonus
  const progresses = await Progress.find({ user: userId });
  const quizzes = await Quiz.find({});
  const quizMap = {};
  quizzes.forEach(q => {
    quizMap[q._id.toString()] = q;
  });

  let successfulAttempts = 0;
  progresses.forEach(progress => {
    (progress.quizScores || []).forEach(qs => {
      const quiz = quizMap[qs.quiz?.toString()];
      if (quiz && quiz.questions && quiz.questions.length > 0) {
        if ((qs.bestScore / quiz.questions.length) > 0.5) {
          successfulAttempts++;
        }
      }
    });
  });

  return user.totalPoints + (5 * successfulAttempts);
};

// Get user's reward history
export const getUserRewards = TryCatch(async (req, res) => {
  const rewards = await Reward.find({ user: req.user._id })
    .populate("course", "title")
    .sort({ createdAt: -1 });

  const user = await User.findById(req.user._id);

  // Get user's quiz attempts for achievement history
  const progresses = await Progress.find({ user: req.user._id });
  const quizzes = await Quiz.find({});
  const quizMap = {};
  quizzes.forEach(q => {
    quizMap[q._id.toString()] = q;
  });

  // Create quiz attempt rewards for achievement history
  const quizAttemptRewards = [];
  progresses.forEach(progress => {
    (progress.quizScores || []).forEach(qs => {
      const quiz = quizMap[qs.quiz?.toString()];
      if (quiz && quiz.questions && quiz.questions.length > 0) {
        const scorePercentage = (qs.bestScore / quiz.questions.length) * 100;
        const isSuccessful = scorePercentage > 50;
        quizAttemptRewards.push({
          _id: `quiz_${qs.quiz}_${progress._id}`,
          user: req.user._id,
          course: progress.course,
          activityType: "quiz",
          points: isSuccessful ? 5 : 0,
          description: `Quiz attempt: ${quiz.title} (${scorePercentage.toFixed(1)}%)`,
          createdAt: progress.updatedAt || progress.createdAt,
          isQuizAttempt: true,
          quizTitle: quiz.title,
          scorePercentage: scorePercentage.toFixed(1),
          isSuccessful
        });
      }
    });
  });

  // Combine regular rewards with quiz attempts and sort by date
  const allRewards = [...rewards, ...quizAttemptRewards].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  const totalPointsWithBonus = await calculateTotalPointsWithQuizBonus(req.user._id);

  res.json({
    rewards: allRewards,
    totalPoints: totalPointsWithBonus
  });
});

// Get leaderboard
export const getLeaderboard = TryCatch(async (req, res) => {
  const users = await User.find({ role: "user" })
    .select("name totalPoints role")
    .sort({ totalPoints: -1 })
    .limit(50);

  // Get all progresses and quizzes for efficient lookup
  const progresses = await Progress.find({});
  const quizzes = await Quiz.find({});
  const quizMap = {};
  quizzes.forEach(q => {
    quizMap[q._id.toString()] = q;
  });

  // For each user, count successful quiz attempts (>50% score)
  const userIdToProgress = {};
  progresses.forEach(p => {
    if (!userIdToProgress[p.user]) userIdToProgress[p.user] = [];
    userIdToProgress[p.user].push(p);
  });

  let leaderboard = users.map(u => {
    let successfulAttempts = 0;
    const progresses = userIdToProgress[u._id.toString()] || [];
    progresses.forEach(progress => {
      (progress.quizScores || []).forEach(qs => {
        const quiz = quizMap[qs.quiz?.toString()];
        if (quiz && quiz.questions && quiz.questions.length > 0) {
          if ((qs.bestScore / quiz.questions.length) > 0.5) {
            successfulAttempts++;
          }
        }
      });
    });
    const bonusPoints = 5 * successfulAttempts;
    return {
      ...u.toObject(),
      totalPoints: (u.role === 'admin' || u.role === 'instructor') ? 'Not Applicable' : (u.totalPoints + bonusPoints),
      quizSuccessBonus: bonusPoints,
      successfulQuizAttempts: successfulAttempts
    };
  });

  // Sort leaderboard by totalPoints (desc), handling 'Not Applicable' as lowest
  leaderboard = leaderboard.sort((a, b) => {
    if (typeof a.totalPoints === 'string') return 1;
    if (typeof b.totalPoints === 'string') return -1;
    return b.totalPoints - a.totalPoints;
  });

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

  // Get current user's total points including quiz bonus
  const currentUserTotalPoints = await calculateTotalPointsWithQuizBonus(req.user._id);

  // Get all users and their total points including quiz bonus for ranking
  const allUsers = await User.find({ role: "user" });
  // Use Promise.all to ensure all points are calculated before sorting
  const userPointsWithBonus = await Promise.all(
    allUsers.map(async (u) => {
      const totalPoints = await calculateTotalPointsWithQuizBonus(u._id);
      return {
        userId: u._id,
        totalPoints
      };
    })
  );

  // Sort by total points (including bonus) in descending order
  userPointsWithBonus.sort((a, b) => b.totalPoints - a.totalPoints);

  // Find current user's rank
  const userRank = userPointsWithBonus.findIndex(u => u.userId.toString() === req.user._id.toString()) + 1;

  res.json({
    ranking: userRank,
    totalPoints: currentUserTotalPoints,
    totalUsers: allUsers.length
  });
}); 