const express = require("express");
const { createTask } = require("../controllers/leaderController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/create-task",
  verifyToken,
  authorizeRoles("team_leader"),
  createTask,
);

module.exports = router;
