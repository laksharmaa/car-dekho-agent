const { processRequirement } = require("../agents/requirementAgent");
const { retrieveCars } = require("../agents/retrievalAgent");
const { recommendCars } = require("../agents/recommendationAgent");
const Session = require("../models/Session");

const chat = async (req, res) => {
  try {
    const { query, history } = req.body;
    const userId = req.auth.payload.sub;

    if (!query) {
      return res.status(400).json({ message: "Query required" });
    }

    const requirement = await processRequirement(query);
    const cars = await retrieveCars(requirement.embedding);
    const recommendation = await recommendCars(query, cars, history || []);

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

    res.json({ success: true, recommendation, cars });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { chat };