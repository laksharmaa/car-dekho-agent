const { generateRecommendation } = require("../services/groqService");

const recommendCars = async (userQuery, cars, history = []) => {
  console.log(
    `[recommendationAgent] generating recommendation from ${cars.length} car(s), history length=${history.length}`
  );
  const recommendation = await generateRecommendation(userQuery, cars, history);
  console.log(`[recommendationAgent] recommendation length: ${recommendation.length} chars`);
  return recommendation;
};

module.exports = { recommendCars };
