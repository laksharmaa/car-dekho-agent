const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  cars: {
    type: Array,
    default: [],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true, // one session per user
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);