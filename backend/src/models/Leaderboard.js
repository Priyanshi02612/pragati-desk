const mongoose = require("mongoose");

const highlightSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    role: {
      type: String,
      enum: ["Admin", "Team Leader", "Employee"],
      required: true,
    },
    achievement: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const rankingSchema = new mongoose.Schema(
  {
    rank: {
      type: Number,
      required: true,
      min: 1,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    trend: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const leaderboardSchema = new mongoose.Schema(
  {
    month: {
      type: highlightSchema,
      required: true,
    },
    year: {
      type: highlightSchema,
      required: true,
    },
    rankings: {
      type: [rankingSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Leaderboard", leaderboardSchema);
