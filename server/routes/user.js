import express from 'express';
import {register , verifyUser} from "../controllers/user.js"
const router=express.Router();

router.get("/user/register",register);
router.post("/user/verify", verifyUser);

export default router;