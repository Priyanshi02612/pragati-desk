const express = require("express");
const {
  getTeamMembers,
  getTeamLeaders,
  createTicket,
} = require("../controllers/adminController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/users", verifyToken, authorizeRoles("admin"), getTeamMembers);
router.get("/leaders", verifyToken, authorizeRoles("admin"), getTeamLeaders);
router.post("/create-ticket", verifyToken, authorizeRoles("admin"), createTicket);

module.exports = router;
