const mongoose = require("mongoose");
const {
  TICKET_TYPES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  DEFAULT_TICKET_PRIORITY,
  DEFAULT_TICKET_STATUS,
} = require("../constants/tickets");

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    ticketType: {
      type: String,
      enum: TICKET_TYPES,
      required: true,
    },
    priority: {
      type: String,
      enum: TICKET_PRIORITIES,
      default: DEFAULT_TICKET_PRIORITY,
    },
    status: {
      type: String,
      enum: TICKET_STATUSES,
      default: DEFAULT_TICKET_STATUS,
    },
    assignedLeaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ticket", ticketSchema);
