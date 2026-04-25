const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const { normalizeRole } = require("../utils/roles");
const { authorizeUserChannel } = require("../utils/pusherServer");

const getMyNotifications = async (req, res) => {
  try {
    const normalizedRole = normalizeRole(req.user.role);
    const notifications = await Notification.find({
      $or: [
        { role: normalizedRole, targetUserId: null },
        { targetUserId: req.user.id },
      ],
    })
      .sort({ createdAt: -1, _id: -1 })
      .limit(50);

    return res.status(200).json({ notifications });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Unable to fetch notifications",
    });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const normalizedRole = normalizeRole(req.user.role);
    const filter = {
      _id: new mongoose.Types.ObjectId(req.params.notificationId),
      $or: [
        { role: normalizedRole, targetUserId: null },
        { targetUserId: req.user.id },
      ],
    };

    const notification = await Notification.findOneAndUpdate(
      filter,
      { read: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({ notification });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Unable to update notification",
    });
  }
};

const authorizeNotificationChannel = async (req, res) => {
  try {
    const authResponse = authorizeUserChannel({
      socketId: req.body.socket_id,
      userId: req.user.id,
      channelName: req.body.channel_name,
    });

    if (!authResponse) {
      return res.status(403).json({ message: "Unable to authorize channel" });
    }

    return res.status(200).send(authResponse);
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Unable to authorize notification channel",
    });
  }
};

module.exports = {
  getMyNotifications,
  markNotificationRead,
  authorizeNotificationChannel,
};
