import mongoose from "mongoose";

const schema = new mongoose.Schema({
    razorpay_order_id:{
        type:String,
        required:true,
    },
    razorpay_payment_id:{
        type:String,
        required:true,
    },
    razorpay_signature:{
        type:String,
        required:true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Courses", required: true },
    amount: { type: Number, required: true },
    createdAt:{
        type:Date,
        default:Date.now,
    },
});

export const Payment=mongoose.model("Payment",schema);