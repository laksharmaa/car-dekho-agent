const Car = require("../models/Car");

const searchCars = async (queryEmbedding, filters = {}) => {
  const {
    maxPrice,
    minPrice,
    bodyType,
    fuelType,
    minMileage,
    minSafetyRating,
  } = filters;

  // Build hard filter — only apply constraints that were actually extracted
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

  // Strategy 1: vector search + post-filter (when filters exist)
  // Fetch more candidates so filtering still yields enough results
  if (hasFilters) {
    const results = await Car.aggregate([
      {
        $vectorSearch: {
          index: "car_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100, // cast wider net
          limit: 20,          // fetch more before filtering
        },
      },
      {
        $match: matchFilter,  // apply hard constraints after vector ranking
      },
      {
        $limit: 5,
      },
      {
        $project: { embedding: 0 },
      },
    ]);

    // Fallback: if strict filters return nothing, relax and try again
    if (results.length === 0 && maxPrice) {
      console.log("Strict filter returned 0 results, relaxing budget by 20%...");
      const relaxedFilter = {
        ...matchFilter,
        price: { $lte: maxPrice * 1.2 },
      };
      return Car.aggregate([
        {
          $vectorSearch: {
            index: "car_index",
            path: "embedding",
            queryVector: queryEmbedding,
            numCandidates: 100,
            limit: 20,
          },
        },
        { $match: relaxedFilter },
        { $limit: 5 },
        { $project: { embedding: 0 } },
      ]);
    }

    return results;
  }

  // Strategy 2: pure vector search when no filters extracted
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
    {
      $project: { embedding: 0 },
    },
  ]);
};

module.exports = { searchCars };