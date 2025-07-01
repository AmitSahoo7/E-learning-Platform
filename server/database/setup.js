import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Reward } from "../models/Reward.js";
import dotenv from "dotenv";

dotenv.config();

// Connect to MongoDB
const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Initialize reward system for existing users
const initializeRewardSystem = async () => {
  try {
    console.log("Initializing reward system...");
    
    // Update all existing users to have 0 points if they don't have totalPoints
    const result = await User.updateMany(
      { totalPoints: { $exists: false } },
      { $set: { totalPoints: 0 } }
    );
    
    console.log(`Updated ${result.modifiedCount} users with default points`);
    
    // Create indexes for better performance
    await Reward.createIndexes({ user: 1, course: 1, activityType: 1 });
    await User.createIndexes({ totalPoints: -1 });
    
    console.log("Reward system initialized successfully!");
  } catch (error) {
    console.error("Error initializing reward system:", error);
  }
};

// Reset all points (admin function)
const resetAllPoints = async () => {
  try {
    console.log("Resetting all points...");
    
    // Reset all user points to 0
    await User.updateMany({}, { $set: { totalPoints: 0 } });
    
    // Delete all reward records
    await Reward.deleteMany({});
    
    console.log("All points reset successfully!");
  } catch (error) {
    console.error("Error resetting points:", error);
  }
};

// Get reward statistics
const getRewardStats = async () => {
  try {
    const totalUsers = await User.countDocuments();
    const usersWithPoints = await User.countDocuments({ totalPoints: { $gt: 0 } });
    const totalRewards = await Reward.countDocuments();
    const totalPointsAwarded = await Reward.aggregate([
      { $group: { _id: null, total: { $sum: "$points" } } }
    ]);
    
    console.log("Reward System Statistics:");
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Users with Points: ${usersWithPoints}`);
    console.log(`Total Rewards Awarded: ${totalRewards}`);
    console.log(`Total Points Awarded: ${totalPointsAwarded[0]?.total || 0}`);
    
    // Top 5 users
    const topUsers = await User.find({ role: "user" })
      .select("name totalPoints")
      .sort({ totalPoints: -1 })
      .limit(5);
    
    console.log("\nTop 5 Users:");
    topUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}: ${user.totalPoints} points`);
    });
    
  } catch (error) {
    console.error("Error getting reward stats:", error);
  }
};

// Main function
const main = async () => {
  await connectDb();
  
  const command = process.argv[2];
  
  switch (command) {
    case "init":
      await initializeRewardSystem();
      break;
    case "reset":
      await resetAllPoints();
      break;
    case "stats":
      await getRewardStats();
      break;
    default:
      console.log("Available commands:");
      console.log("  node setup.js init   - Initialize reward system");
      console.log("  node setup.js reset  - Reset all points (admin only)");
      console.log("  node setup.js stats  - Show reward statistics");
  }
  
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { initializeRewardSystem, resetAllPoints, getRewardStats }; 