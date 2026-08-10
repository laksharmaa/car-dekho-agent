const express = require("express");
const cors = require("cors");

const chatRoutes = require("./routes/chatRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const { globalLimiter, chatLimiter, sessionLimiter, chatInputGuard } = require("./middleware/rateLimiter");

const app = express();

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "http://localhost:5173",
    ],
  })
);

app.use(express.json({ limit: "8kb" }));

// Global limiter — hits every route
app.use(globalLimiter);

// Route-specific limiters applied before route handlers
app.use("/api/chat", chatInputGuard, chatLimiter, chatRoutes);
app.use("/api/session", sessionLimiter, sessionRoutes);

app.use((err, req, res, next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({
      error: "Request too large. Keep your message and history compact.",
    });
  }

  console.error("[app] unexpected error:", err);
  res.status(500).json({ error: "Server error" });
});

module.exports = app;