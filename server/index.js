import express from 'express';
import dotenv from "dotenv";
import { connectDb } from "./database/db.js";
import Razorpay from 'razorpay';
import cors from 'cors';
import webinarRoutes from './routes/webinarRoutes.js';

//



dotenv.config();

export const instance=new Razorpay({
    key_id:process.env.Razorpay_Key,
    key_secret:process.env.Razorpay_Secret,
});
const app=express();

// using middlewares
app.use(express.json());
app.use(cors());

const port=process.env.PORT;
app.get('/',(req,res)=>{
    res.send("Server is working");
});


//
app.use("/uploads", express.static("uploads"));

//importing routes
import userRoutes from './routes/user.js'
import quizRoutes from './routes/quizRoutes.js';

import courseRoutes from "./routes/course.js";
import adminRoutes from "./routes/admin.js";
import feedbackRoutes from "./routes/feedback.js";
import rewardRoutes from "./routes/reward.js";
//using routes
app.use('/api',userRoutes);
app.use('/api/quiz', quizRoutes);

app.use("/api", courseRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/reward", rewardRoutes);
app.use('/api/webinar', webinarRoutes);

app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
    connectDb()
});


import commentRoutes from "./routes/commentRoutes.js";
app.use("/api/comments", commentRoutes);


import courseReviewRoutes from "./routes/courseReviewRoutes.js";
app.use("/api/course-review", courseReviewRoutes);