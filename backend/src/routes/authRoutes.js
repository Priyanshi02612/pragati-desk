const express = require("express");
const { login, register } = require("../controllers/authController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", verifyToken, authorizeRoles("admin"), register);
router.post("/login", login);
router.get("/me", verifyToken, (req, res) => {
  res.status(200).json({ user: req.user });
});

router.get("/admin", verifyToken, authorizeRoles("admin"), (_req, res) => {
  res.status(200).json({ message: "Admin access granted" });
});

router.get(
  "/team-leader",
  verifyToken,
  authorizeRoles("admin", "team_leader"),
  (_req, res) => {
    res.status(200).json({ message: "Team leader access granted" });
  }
);

router.get(
  "/employee",
  verifyToken,
  authorizeRoles("admin", "team_leader", "employee"),
  (_req, res) => {
    res.status(200).json({ message: "Employee access granted" });
  }
);

module.exports = router;
