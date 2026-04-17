import { TOKEN_STORAGE_KEY } from "./api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getSocketUrl = () => {
  const apiUrl = new URL(API_BASE_URL);
  apiUrl.protocol = apiUrl.protocol === "https:" ? "wss:" : "ws:";
  apiUrl.pathname = "/ws";
  apiUrl.search = "";
  return apiUrl;
};

export const connectNotificationSocket = ({ onNotification, onOpen, onClose }) => {
  const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);

  if (!token) {
    return null;
  }

  const socketUrl = getSocketUrl();
  socketUrl.searchParams.set("token", token);

  const socket = new WebSocket(socketUrl.toString());

  socket.addEventListener("open", () => {
    onOpen?.();
  });

  socket.addEventListener("close", () => {
    onClose?.();
  });

  socket.addEventListener("message", (event) => {
    try {
      const payload = JSON.parse(event.data);

      if (payload.type === "notification_created" && payload.notification) {
        onNotification?.(payload.notification);
      }
    } catch (_error) {
      // Ignore malformed socket events.
    }
  });

  return socket;
};
