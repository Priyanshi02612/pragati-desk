const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const routes = require("./routes");
const { ensureFixedAdminUser } = require("./utils/adminAccount");

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://pragati-desk.netlify.app",
].filter(Boolean);

const allowedOriginPatterns = [
  /^http:\/\/localhost(?::\d+)?$/,
  /^http:\/\/127\.0\.0\.1(?::\d+)?$/,
  /^https:\/\/[a-z0-9-]+\.netlify\.app$/,
];

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  return (
    allowedOrigins.includes(origin) ||
    allowedOriginPatterns.some((pattern) => pattern.test(origin))
  );
};

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

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

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;

  if (requestOrigin && isAllowedOrigin(requestOrigin)) {
    res.header("Access-Control-Allow-Origin", requestOrigin);
    res.header("Vary", "Origin");
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(cors(corsOptions));

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
