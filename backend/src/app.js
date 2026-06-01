const express = require("express");
const cors = require("cors");

const chatRoutes = require("./routes/chatRoutes");
const sessionRoutes = require("./routes/sessionRoutes");

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

app.use("/api/chat", chatRoutes);
app.use("/api/session", sessionRoutes);

module.exports = app;