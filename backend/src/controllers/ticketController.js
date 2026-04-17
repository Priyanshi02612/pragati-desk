const Ticket = require("../models/Ticket");
const { normalizeRole } = require("../utils/roles");

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

module.exports = {
  getTickets,
};
