const { searchCars } = require("../services/vectorSearchService");

const retrieveCars = async (queryEmbedding, filters) => {
  console.log("[retrievalAgent] invoking vector search with filters:", filters);
  const cars = await searchCars(queryEmbedding, filters);
  console.log(
    "[retrievalAgent] results:",
    cars.map((c) => c.name)
  );
  return cars;
};

module.exports = {
  retrieveCars,
};
