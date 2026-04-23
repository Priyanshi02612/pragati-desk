const express = require("express");
const {
  getTickets,
  getTasks,
  startTaskTimer,
  stopTaskTimer,
  completeTask,
  createDelayRequest,
} = require("../controllers/ticketController");
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

router.patch(
  "/tasks/:taskId/start",
  verifyToken,
  authorizeRoles("employee"),
  startTaskTimer,
);

router.patch(
  "/tasks/:taskId/stop",
  verifyToken,
  authorizeRoles("employee"),
  stopTaskTimer,
);

router.patch(
  "/tasks/:taskId/complete",
  verifyToken,
  authorizeRoles("employee"),
  completeTask,
);

router.post(
  "/tasks/:taskId/delay-request",
  verifyToken,
  authorizeRoles("employee"),
  createDelayRequest,
);

module.exports = router;
