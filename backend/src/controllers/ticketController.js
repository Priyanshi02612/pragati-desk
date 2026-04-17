const Ticket = require("../models/Ticket");
const Task = require("../models/Task");
const { normalizeRole } = require("../utils/roles");
const { ensureTaskNumbers } = require("../utils/taskNumbers");

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

    const tasks = await Task.find(query)
      .populate("ticketId", "_id ticketNumber title ticketType assignedLeaderId")
      .populate("assigneeId", "_id name email department avatar role")
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

module.exports = {
  getTickets,
  getTasks,
};
