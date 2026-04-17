const mongoose = require("mongoose");

const completionSeriesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    completionRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    delayRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);

const monthlySeriesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    performance: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);

const performanceSeriesSchema = new mongoose.Schema(
  {
    completion: {
      type: [completionSeriesSchema],
      default: [],
    },
    monthly: {
      type: [monthlySeriesSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PerformanceSeries", performanceSeriesSchema);
