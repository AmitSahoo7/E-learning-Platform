import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const isAuth = async (req, res, next) => {
  try {
    const token = req.headers.token;

    if (!token)
      return res.status(403).json({
        message: "Please Login",
      });

    const decodedData = jwt.verify(token, process.env.Jwt_Sec);
    req.user = await User.findById(decodedData._id);

    next();
  } catch (error) {
    res.status(500).json({
      message: "Login First",
    });
  }
};

export const isAdmin = (req, res, next) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "superadmin")
      return res.status(403).json({
        message: "You are not admin",
      });

    next();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const isInstructorOrAdmin = (req, res, next) => {
  try {
    // Check if user is admin, superadmin, or instructor
    const isAdminUser = req.user.role === "admin" || req.user.role === "superadmin";
    const isInstructor = req.user.role === "instructor" || 
                        (Array.isArray(req.user.roles) && req.user.roles.includes("instructor"));
    
    if (!isAdminUser && !isInstructor) {
      return res.status(403).json({
        message: "You need instructor or admin privileges",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const isSuperAdmin = (req, res, next) => {
  try {
    if (req.user.role !== "superadmin")
      return res.status(403).json({
        message: "You are not super admin",
      });

    next();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};