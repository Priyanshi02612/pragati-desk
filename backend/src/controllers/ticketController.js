const Ticket = require("../models/Ticket");
const Task = require("../models/Task");
const DelayRequest = require("../models/DelayRequest");
const Notification = require("../models/Notification");
const { normalizeRole } = require("../utils/roles");
const { ensureTaskNumbers } = require("../utils/taskNumbers");
const { pushNotificationToUser } = require("../utils/socketServer");

const TASK_POPULATION = [
  { path: "ticketId", select: "_id ticketNumber title ticketType assignedLeaderId" },
  { path: "assigneeId", select: "_id name email department avatar role" },
];

const populateTaskQuery = (query) =>
  TASK_POPULATION.reduce(
    (currentQuery, population) => currentQuery.populate(population.path, population.select),
    query,
  );

const getElapsedSeconds = (timerStartedAt) => {
  if (!timerStartedAt) {
    return 0;
  }

  const elapsedMilliseconds = Date.now() - new Date(timerStartedAt).getTime();
  return elapsedMilliseconds > 0 ? Math.floor(elapsedMilliseconds / 1000) : 0;
};

const findEmployeeTask = async (taskId, userId) => {
  const task = await Task.findById(taskId).populate("ticketId", "_id ticketNumber title ticketType assignedLeaderId");

  if (!task) {
    return { error: { status: 404, message: "Task not found" } };
  }

  if (task.assigneeId.toString() !== userId.toString()) {
    return { error: { status: 403, message: "You can only update your own tasks" } };
  }

  return { task };
};

const respondWithTask = async (res, statusCode, message, taskId, extra = {}) => {
  const task = await populateTaskQuery(Task.findById(taskId));

  return res.status(statusCode).json({
    message,
    task,
    ...extra,
  });
};

const getTickets = async (req, res) => {
  try {
    const normalizedRole = normalizeRole(req.user.role);
    const query = {};

    if (normalizedRole === "Team Leader") {
      query.assignedLeaderId = req.user.id;
    }

    const tickets = await Ticket.find(query)
      .populate("assignedLeaderId", "_id name email department avatar role")
      .sort({ createdAt: -1, _id: -1 });

    return res.status(200).json({
      tickets,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Unable to fetch tickets",
    });
  }
};

const getTasks = async (req, res) => {
  try {
    await ensureTaskNumbers();

    const normalizedRole = normalizeRole(req.user.role);
    const query = {};

    if (normalizedRole === "Employee") {
      query.assigneeId = req.user.id;
    }

    if (normalizedRole === "Team Leader") {
      const assignedTickets = await Ticket.find({
        assignedLeaderId: req.user.id,
      }).select("_id");

      query.ticketId = { $in: assignedTickets.map((ticket) => ticket._id) };
    }

    const tasks = await populateTaskQuery(Task.find(query))
      .sort({ createdAt: -1, _id: -1 });

    return res.status(200).json({
      tasks,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Unable to fetch tasks",
    });
  }
};

const startTaskTimer = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { task, error } = await findEmployeeTask(taskId, req.user.id);

    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    if (task.status === "Completed") {
      return res.status(400).json({ message: "Completed tasks cannot be restarted" });
    }

    if (!task.timerStartedAt) {
      task.timerStartedAt = new Date();
    }

    task.status = "In Progress";
    await task.save();

    return respondWithTask(res, 200, "Task timer started", task._id);
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Unable to start task timer",
    });
  }
};

const stopTaskTimer = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { task, error } = await findEmployeeTask(taskId, req.user.id);

    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    task.timeSpent += getElapsedSeconds(task.timerStartedAt);
    task.timerStartedAt = null;

    if (task.status === "Pending") {
      task.status = "In Progress";
    }

    await task.save();

    return respondWithTask(res, 200, "Task timer stopped", task._id);
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Unable to stop task timer",
    });
  }
};

const completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { task, error } = await findEmployeeTask(taskId, req.user.id);

    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    task.timeSpent += getElapsedSeconds(task.timerStartedAt);
    task.timerStartedAt = null;
    task.status = "Completed";
    await task.save();

    return respondWithTask(res, 200, "Task completed", task._id);
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Unable to complete task",
    });
  }
};

const createDelayRequest = async (req, res) => {
  try {
    const { taskId } = req.params;
    const reason = req.body.reason?.trim();
    const { task, error } = await findEmployeeTask(taskId, req.user.id);

    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    if (!reason) {
      return res.status(400).json({ message: "Delay reason is required" });
    }

    task.timeSpent += getElapsedSeconds(task.timerStartedAt);
    task.timerStartedAt = null;
    task.status = "Delayed";
    task.delayReason = reason;
    await task.save();

    const delayRequest = await DelayRequest.create({
      taskId: task._id,
      employeeId: req.user.id,
      reason,
      status: "Pending",
    });

    const leaderId =
      typeof task.ticketId === "object"
        ? task.ticketId?.assignedLeaderId
        : null;

    if (leaderId) {
      const notification = await Notification.create({
        title: "Delay request submitted",
        message: `${task.taskNumber || task.title} needs more time.`,
        type: "delay",
        role: "Team Leader",
        targetUserId: leaderId,
      });

      pushNotificationToUser(leaderId, notification.toObject());
    }

    return respondWithTask(res, 201, "Delay request submitted", task._id, {
      delayRequest,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Unable to submit delay request",
    });
  }
};

module.exports = {
  getTickets,
  getTasks,
  startTaskTimer,
  stopTaskTimer,
  completeTask,
  createDelayRequest,
};
