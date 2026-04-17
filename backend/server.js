const http = require("http");
const { app, ensureAppReady } = require("./src/app");
const { initWebSocketServer } = require("./src/utils/socketServer");

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initWebSocketServer(server);

const startServer = async () => {
  await ensureAppReady();

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Server failed to start:", error.message);
  process.exit(1);
});

module.exports = server;
