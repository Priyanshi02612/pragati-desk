const express = require("express");
const { getTickets, getTasks } = require("../controllers/ticketController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  verifyToken,
  authorizeRoles("admin", "team_leader", "employee"),
  getTickets,
);

router.get(
  "/tasks",
  verifyToken,
  authorizeRoles("admin", "team_leader", "employee"),
  getTasks,
);

module.exports = router;
