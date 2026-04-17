const express = require("express");
const cors = require("cors");
const http = require("http");
require("dotenv").config();
const connectDB = require("./src/config/db");
const routes = require("./src/routes");
const { ensureFixedAdminUser } = require("./src/utils/adminAccount");
const { initWebSocketServer } = require("./src/utils/socketServer");

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use("/api", routes);
initWebSocketServer(server);

const startServer = async () => {
  await connectDB();
  await ensureFixedAdminUser();

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Server failed to start:", error.message);
  process.exit(1);
});
