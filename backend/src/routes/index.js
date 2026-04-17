const express = require("express");
const authRoutes = require("./authRoutes");
const adminRoutes = require("./adminRoutes");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ message: "API is running" });
});

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
