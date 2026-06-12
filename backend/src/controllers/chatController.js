const { runRecommendationGraph } = require("../graphs/recommendationGraph");
const Session = require("../models/Session");

const chat = async (req, res) => {
  try {
    const { query, history } = req.body;
    const userId = req.auth.payload.sub;

    if (!query) {
      return res.status(400).json({ message: "Query required" });
    }

    console.log(`[chatController] user=${userId} | query="${query}"`);

    const { recommendation, cars } = await runRecommendationGraph(query, history || []);

    await Session.findOneAndUpdate(
      { userId },
      {
        $push: {
          messages: {
            $each: [
              { role: "user", content: query },
              { role: "assistant", content: recommendation, cars },
            ],
          },
        },
      },
      { upsert: true, new: true }
    );

    console.log(`[chatController] saved session message pair for user=${userId}`);

    res.json({ success: true, recommendation, cars });
  } catch (error) {
    console.error("[chatController] error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { chat };
