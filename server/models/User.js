import mongoose from "mongoose";
const schema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        default:"user",
        enum: ["user", "admin", "superadmin"],
    },
    roles: { type: [String], default: [] }, 
    subscription:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Courses",
    }],
    totalPoints: {
        type: Number,
        default: 0,
    },
    studyGoals: {
        dailyGoal: {
            type: Number,
            default: 30
        },
        weeklyGoal: {
            type: Number,
            default: 5
        },
        monthlyGoal: {
            type: Number,
            default: 2
        }
    }
},{
    timestamps:true,
});
export const User=mongoose.model("User",schema);