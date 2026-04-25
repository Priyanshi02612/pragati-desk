const Pusher = require("pusher");

const hasPusherConfig =
  process.env.PUSHER_APP_ID &&
  process.env.PUSHER_KEY &&
  process.env.PUSHER_SECRET &&
  process.env.PUSHER_CLUSTER;

const pusher = hasPusherConfig
  ? new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
      useTLS: true,
    })
  : null;

const getUserNotificationChannel = (userId) => `private-user-${userId}`;

const pushNotificationToUser = async (userId, notification) => {
  if (!pusher || !userId || !notification) {
    return;
  }

  await pusher.trigger(getUserNotificationChannel(userId), "notification-created", {
    notification,
  });
};

const authorizeUserChannel = ({ socketId, userId, channelName }) => {
  if (!pusher || !socketId || !userId || !channelName) {
    return null;
  }

  const expectedChannelName = getUserNotificationChannel(userId);

  if (channelName !== expectedChannelName) {
    return null;
  }

  return pusher.authorizeChannel(socketId, channelName);
};

module.exports = {
  authorizeUserChannel,
  getUserNotificationChannel,
  pushNotificationToUser,
};
