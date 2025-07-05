import dotenv from "dotenv";
import fs from "fs";
if (fs.existsSync("./.env")) {
  dotenv.config({ path: "./.env" });
} else if (fs.existsSync("../.env")) {
  dotenv.config({ path: "../.env" });
} else {
  console.error("No .env file found! Please create one with your DB connection string.");
  process.exit(1);
}

console.log("Loaded DB connection string:", process.env.DB);
if (!process.env.DB) {
  console.error("DB connection string not found in environment variables.");
  process.exit(1);
}

import mongoose from "mongoose";
import { Lecture } from "./models/Lecture.js";
import { Courses } from "./models/Courses.js";

async function main() {
  await mongoose.connect(process.env.DB);

  const instructorId = new mongoose.Types.ObjectId("6851c7ee053a136204b11294");
  const lectures = await Lecture.find({ uploadedBy: { $exists: false } });

  for (const lecture of lectures) {
    lecture.uploadedBy = instructorId;
    await lecture.save();
    console.log(`Lecture ${lecture._id} backfilled with uploadedBy ${instructorId}`);
  }

  await mongoose.disconnect();
  console.log("Backfill complete!");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}); 