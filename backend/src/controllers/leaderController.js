const Task = require("../models/Task");
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { pushNotificationToUser } = require("../utils/socketServer");
const { normalizeRole } = require("../utils/roles");
const { getNextTaskNumber } = require("../utils/taskNumbers");

const createTask = async (req, res) => {
  try {
    const { ticketId, title, assigneeId, dueDate } = req.body;

    if (!ticketId || !title?.trim() || !assigneeId || !dueDate) {
      return res.status(400).json({
        message: "Ticket, title, assignee, and due date are required",
      });
    }

    const ticket = await Ticket.findById(ticketId).select(
      "_id ticketNumber title assignedLeaderId department",
    );

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.assignedLeaderId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "You can only create tasks for tickets assigned to you",
      });
    }

    const assignee = await User.findById(assigneeId).select(
      "_id name role department",
    );

    if (!assignee) {
      return res.status(404).json({ message: "Assignee not found" });
    }

    if (normalizeRole(assignee.role) !== "Employee") {
      return res.status(400).json({
        message: "Assigned user must have the Employee role",
      });
    }

    const parsedDueDate = new Date(dueDate);

    if (Number.isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({ message: "Invalid due date" });
    }

    const taskNumber = await getNextTaskNumber(ticket._id, ticket.ticketNumber);

    const task = await Task.create({
      taskNumber,
      ticketId,
      title: title.trim(),
      assigneeId,
      dueDate: parsedDueDate,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("ticketId", "_id ticketNumber title ticketType assignedLeaderId")
      .populate("assigneeId", "_id name email department avatar role");

    const notification = await Notification.create({
      title: "New task assigned",
      message: `${taskNumber} • ${title.trim()} has been assigned to you.`,
      type: "assignment",
      role: "Employee",
      targetUserId: assigneeId,
    });

    pushNotificationToUser(assigneeId, notification.toObject());

    return res.status(201).json({
      message: "Task created successfully",
      task: populatedTask,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Task creation failed",
    });
  }
};

module.exports = {
  createTask,
};
