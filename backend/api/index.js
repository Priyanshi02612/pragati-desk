const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("../src/config/db");
const routes = require("../src/routes");
const { ensureFixedAdminUser } = require("../src/utils/adminAccount");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    process.env.FRONTEND_URL || "http://localhost:5173",
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

app.use(express.json());

// ✅ DB connection caching (CRITICAL)
let isConnected = false;

app.use(async (req, res, next) => {
  if (!isConnected) {
    await connectDB();
    await ensureFixedAdminUser();
    isConnected = true;
    console.log("Cold start → DB connected");
  }
  next();
});

// Routes
app.use("/api", routes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(
    `Local server running on http://localhost:${process.env.PORT || 5000}`,
  );
});

module.exports = app;
