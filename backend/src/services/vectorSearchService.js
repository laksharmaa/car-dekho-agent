const Car = require("../models/Car");

// Pure retrieval: given an embedding + hard filters, return matching cars.
// NOTE: the "0 results -> relax budget by 20% -> retry" behaviour used to
// live here as a hidden second query. It now lives in the LangGraph
// orchestration (graphs/recommendationGraph.js) as an explicit
// `relaxFilters` node + conditional edge, so the retry is visible in logs
// and traceable as part of the graph instead of being buried in the DB layer.
const searchCars = async (queryEmbedding, filters = {}) => {
  const {
    maxPrice,
    minPrice,
    bodyType,
    fuelType,
    minMileage,
    minSafetyRating,
  } = filters;

  const matchFilter = {};

  if (maxPrice !== null && maxPrice !== undefined) {
    matchFilter.price = { ...matchFilter.price, $lte: maxPrice };
  }
  if (minPrice !== null && minPrice !== undefined) {
    matchFilter.price = { ...matchFilter.price, $gte: minPrice };
  }
  if (bodyType) {
    matchFilter.bodyType = bodyType;
  }
  if (fuelType) {
    matchFilter.fuelType = fuelType;
  }
  if (minMileage !== null && minMileage !== undefined) {
    matchFilter.mileage = { $gte: minMileage };
  }
  if (minSafetyRating !== null && minSafetyRating !== undefined) {
    matchFilter.safetyRating = { $gte: minSafetyRating };
  }

  const hasFilters = Object.keys(matchFilter).length > 0;
  console.log("[vectorSearchService] matchFilter:", hasFilters ? matchFilter : "(none — pure vector search)");

  if (hasFilters) {
    return Car.aggregate([
      {
        $vectorSearch: {
          index: "car_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100, // cast wider net
          limit: 20,          // fetch more before filtering
        },
      },
      { $match: matchFilter },
      { $limit: 5 },
      { $project: { embedding: 0 } },
    ]);
  }

  // Pure vector search when no filters extracted
  return Car.aggregate([
    {
      $vectorSearch: {
        index: "car_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 50,
        limit: 5,
      },
    },
    { $project: { embedding: 0 } },
  ]);
};

module.exports = { searchCars };
