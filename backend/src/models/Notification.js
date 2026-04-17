const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["assignment", "delay", "performance"],
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["Admin", "Team Leader", "Employee"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
