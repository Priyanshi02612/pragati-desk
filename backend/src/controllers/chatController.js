const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const { pushChatEventToUsers } = require("../utils/pusherServer");

const buildParticipantKey = (userIds) =>
  [...userIds].map(String).sort().join(":");

const normalizeUserSummary = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  avatar: user.avatar,
  performance: user.performance,
});

const mapConversationSummary = ({ conversation, currentUserId, unreadCount }) => {
  const participants = (conversation.participants || []).map(normalizeUserSummary);
  const counterpart =
    participants.find((participant) => String(participant.id) !== String(currentUserId)) ||
    participants[0] ||
    null;

  return {
    id: conversation._id,
    participants,
    counterpart,
    lastMessageText: conversation.lastMessageText || "",
    lastMessageAt: conversation.lastMessageAt,
    lastMessageSenderId: conversation.lastMessageSenderId || null,
    unreadCount,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
};

const ensureConversationAccess = async (conversationId, userId) =>
  Conversation.findOne({
    _id: new mongoose.Types.ObjectId(conversationId),
    participants: userId,
  }).populate("participants", "name email role department avatar performance");

const getChatOverview = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const [contacts, conversations] = await Promise.all([
      User.find({ _id: { $ne: currentUserId } })
        .select("name email role department avatar performance")
        .sort({ name: 1 }),
      Conversation.find({ participants: currentUserId })
        .populate("participants", "name email role department avatar performance")
        .sort({ lastMessageAt: -1, updatedAt: -1 }),
    ]);

    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conversation._id,
          senderId: { $ne: currentUserId },
          readBy: { $ne: currentUserId },
        });

        return mapConversationSummary({
          conversation,
          currentUserId,
          unreadCount,
        });
      }),
    );

    return res.status(200).json({
      contacts: contacts.map(normalizeUserSummary),
      conversations: conversationsWithUnread,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Unable to load chat overview",
    });
  }
};

const createConversation = async (req, res) => {
  try {
    const currentUserId = String(req.user.id);
    const participantId = String(req.body.participantId || "").trim();

    if (!participantId) {
      return res.status(400).json({ message: "participantId is required" });
    }

    if (participantId === currentUserId) {
      return res.status(400).json({ message: "You cannot chat with yourself" });
    }

    const participant = await User.findById(participantId).select(
      "name email role department avatar performance",
    );

    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    const participantKey = buildParticipantKey([currentUserId, participantId]);
    let conversation = await Conversation.findOne({ participantKey }).populate(
      "participants",
      "name email role department avatar performance",
    );

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, participantId],
        participantKey,
        lastMessageAt: new Date(),
      });

      conversation = await Conversation.findById(conversation._id).populate(
        "participants",
        "name email role department avatar performance",
      );
    }

    return res.status(200).json({
      conversation: mapConversationSummary({
        conversation,
        currentUserId,
        unreadCount: 0,
      }),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Unable to create conversation",
    });
  }
};

const getConversationMessages = async (req, res) => {
  try {
    const conversation = await ensureConversationAccess(
      req.params.conversationId,
      req.user.id,
    );

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .populate("senderId", "name email role department avatar performance")
      .sort({ createdAt: 1 })
      .limit(100);

    return res.status(200).json({ messages });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Unable to load conversation messages",
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const content = String(req.body.content || "").trim();

    if (!content) {
      return res.status(400).json({ message: "Message content is required" });
    }

    const conversation = await ensureConversationAccess(
      req.params.conversationId,
      req.user.id,
    );

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId: req.user.id,
      content,
      readBy: [req.user.id],
    });

    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessageText: content,
      lastMessageAt: message.createdAt,
      lastMessageSenderId: req.user.id,
    });

    const hydratedMessage = await Message.findById(message._id).populate(
      "senderId",
      "name email role department avatar performance",
    );
    const refreshedConversation = await Conversation.findById(conversation._id).populate(
      "participants",
      "name email role department avatar performance",
    );

    const participantIds = refreshedConversation.participants.map((participant) =>
      String(participant._id),
    );

    await Promise.all(
      participantIds.map(async (participantId) => {
        const unreadCount =
          participantId === String(req.user.id)
            ? 0
            : await Message.countDocuments({
                conversationId: refreshedConversation._id,
                senderId: { $ne: participantId },
                readBy: { $ne: participantId },
              });

        return pushChatEventToUsers([participantId], {
          type: "message-created",
          conversation: mapConversationSummary({
            conversation: refreshedConversation,
            currentUserId: participantId,
            unreadCount,
          }),
          message: hydratedMessage,
        });
      }),
    );

    return res.status(201).json({
      conversation: mapConversationSummary({
        conversation: refreshedConversation,
        currentUserId: req.user.id,
        unreadCount: 0,
      }),
      message: hydratedMessage,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Unable to send message",
    });
  }
};

const markConversationRead = async (req, res) => {
  try {
    const conversation = await ensureConversationAccess(
      req.params.conversationId,
      req.user.id,
    );

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    await Message.updateMany(
      {
        conversationId: conversation._id,
        senderId: { $ne: req.user.id },
        readBy: { $ne: req.user.id },
      },
      {
        $addToSet: { readBy: req.user.id },
      },
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Unable to mark conversation as read",
    });
  }
};

module.exports = {
  createConversation,
  getChatOverview,
  getConversationMessages,
  markConversationRead,
  sendMessage,
};
