const {
  generateRecommendation,
} = require("../services/groqService");

const recommendCars = async (
  userQuery,
  cars
) => {
  return generateRecommendation(
    userQuery,
    cars
  );
};

module.exports = {
  recommendCars,
};