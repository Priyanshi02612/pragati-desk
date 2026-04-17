const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { pushNotificationToUser } = require("../utils/socketServer");
const { normalizeRole } = require("../utils/roles");
const {
  TICKET_TYPES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  DEFAULT_TICKET_PRIORITY,
  DEFAULT_TICKET_STATUS,
} = require("../constants/tickets");

const extractTicketSequence = (ticketNumber, ticketType) => {
  const match = ticketNumber?.match(new RegExp(`^${ticketType}-(\\d+)$`));
  return match ? Number.parseInt(match[1], 10) : 0;
};

const getNextTicketNumber = async (ticketType) => {
  const latestTicket = await Ticket.findOne({ ticketType })
    .sort({ createdAt: -1, _id: -1 })
    .select("ticketNumber");

  const nextSequence =
    extractTicketSequence(latestTicket?.ticketNumber, ticketType) + 1;

  return `${ticketType}-${nextSequence}`;
};

const getTeamLeaders = async (_req, res) => {
  try {
    const leaders = await User.find({ role: "Team Leader" })
      .select("_id name email department avatar role")
      .sort({ name: 1 });

    return res.status(200).json({
      leaders,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Unable to fetch team leaders",
    });
  }
};

const createTicket = async (req, res) => {
  try {
    const {
      title,
      description,
      ticketType,
      priority,
      status,
      assignedLeaderId,
      department,
    } = req.body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !ticketType ||
      !assignedLeaderId ||
      !department?.trim()
    ) {
      return res.status(400).json({
        message:
          "Title, description, ticket type, assigned leader, and department are required",
      });
    }

    if (!TICKET_TYPES.includes(ticketType)) {
      return res.status(400).json({ message: "Invalid ticket type" });
    }

    if (priority && !TICKET_PRIORITIES.includes(priority)) {
      return res.status(400).json({ message: "Invalid ticket priority" });
    }

    if (status && !TICKET_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid ticket status" });
    }

    const assignedLeader = await User.findById(assignedLeaderId).select("role");

    if (!assignedLeader) {
      return res.status(404).json({ message: "Assigned team leader not found" });
    }

    if (normalizeRole(assignedLeader.role) !== "Team Leader") {
      return res.status(400).json({
        message: "Assigned user must have the Team Leader role",
      });
    }

    const ticketNumber = await getNextTicketNumber(ticketType);

    const ticket = await Ticket.create({
      ticketNumber,
      title: title.trim(),
      description: description.trim(),
      ticketType,
      priority: priority || DEFAULT_TICKET_PRIORITY,
      status: status || DEFAULT_TICKET_STATUS,
      assignedLeaderId,
      department: department.trim(),
    });

    const notification = await Notification.create({
      title: "New ticket assigned",
      message: `${ticketNumber} has been assigned to you.`,
      type: "assignment",
      role: "Team Leader",
      targetUserId: assignedLeaderId,
    });

    pushNotificationToUser(assignedLeaderId, notification.toObject());

    return res.status(201).json({
      message: "Ticket created successfully",
      ticket,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Ticket creation failed",
    });
  }
};

module.exports = {
  getTeamLeaders,
  createTicket,
};
