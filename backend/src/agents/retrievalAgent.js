const {
  searchCars,
} = require("../services/vectorSearchService");

const retrieveCars = async (
  queryEmbedding,
  filters
) => {
  return searchCars(queryEmbedding, filters);
};

module.exports = {
  retrieveCars,
};