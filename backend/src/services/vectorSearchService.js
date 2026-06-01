const Car = require("../models/Car");

const searchCars = async (queryEmbedding) => {
  return Car.aggregate([
    {
      $vectorSearch: {
        index: "car_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 50,
        limit: 4,
      },
    },
    {
      $project: {
        embedding: 0,
      },
    },
  ]);
};

module.exports = {
  searchCars,
};