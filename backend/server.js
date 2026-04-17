const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./src/config/db");
const routes = require("./src/routes");
const { ensureFixedAdminUser } = require("./src/utils/adminAccount");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api", routes);

const startServer = async () => {
  await connectDB();
  await ensureFixedAdminUser();

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Server failed to start:", error.message);
  process.exit(1);
});
