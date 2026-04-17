const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const routes = require("./routes");
const { ensureFixedAdminUser } = require("./utils/adminAccount");

const app = express();

let appReadyPromise;

const ensureAppReady = async () => {
  if (!appReadyPromise) {
    appReadyPromise = (async () => {
      await connectDB();
      await ensureFixedAdminUser();
    })().catch((error) => {
      appReadyPromise = null;
      throw error;
    });
  }

  return appReadyPromise;
};

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());

app.get("/", async (_req, res, next) => {
  try {
    await ensureAppReady();
    res.json({ message: "PragatiDesk backend is running" });
  } catch (error) {
    next(error);
  }
});

app.use(async (_req, _res, next) => {
  try {
    await ensureAppReady();
    next();
  } catch (error) {
    next(error);
  }
});

app.use("/api", routes);

app.use((error, _req, res, _next) => {
  console.error("Request failed:", error.message);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = { app, ensureAppReady };
