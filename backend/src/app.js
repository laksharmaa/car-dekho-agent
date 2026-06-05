const express = require("express");
const cors = require("cors");

const chatRoutes = require("./routes/chatRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const { globalLimiter, chatLimiter, sessionLimiter } = require("./middleware/rateLimiter");

const app = express();

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "http://localhost:5173",
    ],
  })
);

app.use(express.json());

// Global limiter — hits every route
app.use(globalLimiter);

// Route-specific limiters applied before route handlers
app.use("/api/chat", chatLimiter, chatRoutes);
app.use("/api/session", sessionLimiter, sessionRoutes);

module.exports = app;