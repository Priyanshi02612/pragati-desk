const express = require("express");
const {
  createConversation,
  getChatOverview,
  getConversationMessages,
  markConversationRead,
  sendMessage,
} = require("../controllers/chatController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", verifyToken, getChatOverview);
router.post("/conversations", verifyToken, createConversation);
router.get(
  "/conversations/:conversationId/messages",
  verifyToken,
  getConversationMessages,
);
router.post(
  "/conversations/:conversationId/messages",
  verifyToken,
  sendMessage,
);
router.post(
  "/conversations/:conversationId/read",
  verifyToken,
  markConversationRead,
);

module.exports = router;
