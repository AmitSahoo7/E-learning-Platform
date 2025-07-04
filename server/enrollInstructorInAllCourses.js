import mongoose from "mongoose";
import { User } from "./models/User.js";
import { Courses } from "./models/Courses.js";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  await mongoose.connect(process.env.DB);
  const instructorId = "6851c7ee053a136204b11294"; // your ObjectId
  const user = await User.findById(instructorId);
  if (!user) {
    console.error("Instructor not found!");
    process.exit(1);
  }
  const allCourses = await Courses.find({});
  user.subscription = allCourses.map(c => c._id);
  await user.save();
  console.log("Instructor now enrolled in all courses.");
  await mongoose.disconnect();
}
main(); 