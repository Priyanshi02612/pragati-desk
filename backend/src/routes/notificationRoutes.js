const express = require("express");
const {
  getMyNotifications,
  markNotificationRead,
  authorizeNotificationChannel,
} = require("../controllers/notificationController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", verifyToken, getMyNotifications);
router.post("/pusher/auth", verifyToken, authorizeNotificationChannel);
router.patch("/:notificationId/read", verifyToken, markNotificationRead);

module.exports = router;
