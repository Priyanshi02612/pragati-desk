import Pusher from "pusher-js";
import { TOKEN_STORAGE_KEY } from "./api";

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const CHAT_EVENT_NAME = "chat-message-created";

let pusherClient = null;

const getUserNotificationChannel = (userId) => `private-user-${userId}`;
const PUSHER_AUTH_ENDPOINT = `${API_BASE_URL.replace(/\/api$/, "")}/api/notifications/pusher/auth`;

const getPusherClient = () => {
  if (!PUSHER_KEY || !PUSHER_CLUSTER) {
    return null;
  }

  if (!pusherClient) {
    pusherClient = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      channelAuthorization: {
        endpoint: PUSHER_AUTH_ENDPOINT,
        transport: "ajax",
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem(TOKEN_STORAGE_KEY) || ""}`,
        },
      },
    });
  }

  return pusherClient;
};

export const connectNotificationChannel = ({
  userId,
  onNotification,
  onChatMessage,
}) => {
  const client = getPusherClient();

  if (!client || !userId) {
    return null;
  }

  const channelName = getUserNotificationChannel(userId);
  const channel = client.subscribe(channelName);

  channel.bind("notification-created", (payload) => {
    if (payload?.notification) {
      onNotification?.(payload.notification);
    }
  });

  channel.bind(CHAT_EVENT_NAME, (payload) => {
    if (payload?.conversation && payload?.message) {
      onChatMessage?.(payload);
    }
  });

  return {
    unsubscribe: () => {
      channel.unbind_all();
      client.unsubscribe(channelName);
    },
  };
};
