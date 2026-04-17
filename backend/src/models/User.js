const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Admin", "Team Leader", "Employee"],
      default: "Employee",
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    performance: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    avatar: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
