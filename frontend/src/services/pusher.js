import Pusher from "pusher-js";
import { TOKEN_STORAGE_KEY } from "./api";

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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

export const connectNotificationChannel = ({ userId, onNotification }) => {
  const client = getPusherClient();

  if (!client || !userId) {
    return null;
  }

  const channel = client.subscribe(getUserNotificationChannel(userId));

  channel.bind("notification-created", (payload) => {
    if (payload?.notification) {
      onNotification?.(payload.notification);
    }
  });

  return {
    unsubscribe: () => {
      channel.unbind_all();
      client.unsubscribe(getUserNotificationChannel(userId));
    },
  };
};
