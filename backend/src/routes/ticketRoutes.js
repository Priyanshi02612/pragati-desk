const express = require("express");
const { getTickets } = require("../controllers/ticketController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  verifyToken,
  authorizeRoles("admin", "team_leader", "employee"),
  getTickets,
);

module.exports = router;
