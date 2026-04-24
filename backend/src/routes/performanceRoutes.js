const express = require("express");
const { getPerformanceInsights } = require("../controllers/performanceController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  verifyToken,
  authorizeRoles("admin", "team_leader", "employee"),
  getPerformanceInsights,
);

module.exports = router;
