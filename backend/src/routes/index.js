const express = require("express");
const authRoutes = require("./authRoutes");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ message: "API is running" });
});

router.use("/auth", authRoutes);

module.exports = router;
