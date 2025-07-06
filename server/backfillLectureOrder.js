import mongoose from 'mongoose';
import { Lecture } from './models/Lecture.js';
import { Courses } from './models/Courses.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/elearning';

async function backfillLectureOrder() {
  await mongoose.connect(MONGO_URI);
  const courses = await Courses.find();
  for (const course of courses) {
    const lectures = await Lecture.find({ course: course._id }).sort({ createdAt: 1 });
    for (let i = 0; i < lectures.length; i++) {
      lectures[i].order = i + 1;
      await lectures[i].save();
      console.log(`Set order ${i + 1} for lecture ${lectures[i].title} in course ${course.title}`);
    }
  }
  await mongoose.disconnect();
  console.log('Lecture order backfill complete.');
}

backfillLectureOrder(); 