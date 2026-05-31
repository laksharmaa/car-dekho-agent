const {
  searchCars,
} = require("../services/vectorSearchService");

const retrieveCars = async (
  queryEmbedding
) => {
  return searchCars(queryEmbedding);
};

module.exports = {
  retrieveCars,
};