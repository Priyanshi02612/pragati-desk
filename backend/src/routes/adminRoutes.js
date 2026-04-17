const express = require("express");
const {
  getTeamLeaders,
  createTicket,
} = require("../controllers/adminController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/leaders", verifyToken, authorizeRoles("admin"), getTeamLeaders);
router.post("/create-ticket", verifyToken, authorizeRoles("admin"), createTicket);

module.exports = router;
