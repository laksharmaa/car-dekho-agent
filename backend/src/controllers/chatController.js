const {
  processRequirement,
} = require("../agents/requirementAgent");

const {
  retrieveCars,
} = require("../agents/retrievalAgent");

const {
  recommendCars,
} = require("../agents/recommendationAgent");

const chat = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        message: "Query required",
      });
    }

    const requirement =
      await processRequirement(query);

    const cars = await retrieveCars(
      requirement.embedding
    );

    const recommendation =
      await recommendCars(
        query,
        cars
      );

    res.json({
      success: true,
      recommendation,
      cars,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  chat,
};