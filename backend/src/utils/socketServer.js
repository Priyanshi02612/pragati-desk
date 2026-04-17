const { WebSocketServer, WebSocket } = require("ws");
const jwt = require("jsonwebtoken");
const { URL } = require("url");

const userConnections = new Map();

const addConnection = (userId, socket) => {
  const key = userId.toString();
  const existingConnections = userConnections.get(key) || new Set();
  existingConnections.add(socket);
  userConnections.set(key, existingConnections);
};

const removeConnection = (userId, socket) => {
  const key = userId.toString();
  const existingConnections = userConnections.get(key);

  if (!existingConnections) {
    return;
  }

  existingConnections.delete(socket);

  if (!existingConnections.size) {
    userConnections.delete(key);
  }
};

const initWebSocketServer = (server) => {
  const webSocketServer = new WebSocketServer({ server, path: "/ws" });

  webSocketServer.on("connection", (socket, request) => {
    try {
      const requestUrl = new URL(request.url, `http://${request.headers.host}`);
      const token = requestUrl.searchParams.get("token");

      if (!token) {
        socket.close(1008, "Authentication token is required");
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      addConnection(userId, socket);

      socket.on("close", () => {
        removeConnection(userId, socket);
      });

      socket.on("error", () => {
        removeConnection(userId, socket);
      });

      socket.send(
        JSON.stringify({
          type: "connection_established",
        }),
      );
    } catch (_error) {
      socket.close(1008, "Unauthorized");
    }
  });

  return webSocketServer;
};

const pushNotificationToUser = (userId, notification) => {
  const connections = userConnections.get(userId?.toString());

  if (!connections?.size) {
    return;
  }

  const payload = JSON.stringify({
    type: "notification_created",
    notification,
  });

  connections.forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(payload);
    }
  });
};

module.exports = {
  initWebSocketServer,
  pushNotificationToUser,
};
