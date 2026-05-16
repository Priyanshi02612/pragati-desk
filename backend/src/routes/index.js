const express = require("express");
const authRoutes = require("./authRoutes");
const adminRoutes = require("./adminRoutes");
const chatRoutes = require("./chatRoutes");
const leaderRoutes = require("./leaderRoutes");
const notificationRoutes = require("./notificationRoutes");
const performanceRoutes = require("./performanceRoutes");
const ticketRoutes = require("./ticketRoutes");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ message: "API is running" });
});

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/chat", chatRoutes);
router.use("/leader", leaderRoutes);
router.use("/notifications", notificationRoutes);
router.use("/performance", performanceRoutes);
router.use("/tickets", ticketRoutes);

module.exports = router;
