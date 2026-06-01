const { generateRecommendation } = require("../services/groqService");

const recommendCars = async (userQuery, cars, history = []) => {
  return generateRecommendation(userQuery, cars, history);
};

module.exports = { recommendCars };