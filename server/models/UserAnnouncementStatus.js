import mongoose from "mongoose";

const UserAnnouncementStatusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  announcementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Announcement",
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  isCleared: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

UserAnnouncementStatusSchema.index({ userId: 1, announcementId: 1 }, { unique: true });

export default mongoose.model("UserAnnouncementStatus", UserAnnouncementStatusSchema); 