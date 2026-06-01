const Session = require("../models/Session");

// GET /api/session — load this user's chat history
const getSession = async (req, res) => {
  try {
    const userId = req.auth.payload.sub;
    const session = await Session.findOne({ userId });

    if (!session) {
      return res.json({ messages: [] });
    }

    res.json({ messages: session.messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE /api/session — clear this user's chat history
const clearSession = async (req, res) => {
  try {
    const userId = req.auth.payload.sub;
    await Session.findOneAndUpdate(
      { userId },
      { $set: { messages: [] } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getSession, clearSession };