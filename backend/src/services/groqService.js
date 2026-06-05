const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateRecommendation = async (userQuery, cars, history = []) => {
  if (!cars || cars.length === 0) {
    return "I couldn't find any cars matching your exact requirements in our database. Try adjusting your budget or preferences slightly and I'll search again.";
  }

  const carContext = cars
    .map(
      (car, i) =>
        `${i + 1}. ${car.name} by ${car.brand} — ₹${(car.price / 100000).toFixed(2)}L, ` +
        `${car.bodyType}, ${car.fuelType}, ${car.mileage}km/l, ` +
        `Safety: ${car.safetyRating}/5. ${car.description}`
    )
    .join("\n");

  const historyMessages = history.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const messages = [
    {
      role: "system",
      content: `You are CarWise, an expert AI car recommendation assistant for the Indian market.
The cars listed below have ALREADY been filtered to match the user's budget and preferences — every car shown is within their constraints.
Your job is to recommend from ONLY these cars. Do not suggest cars outside this list.
Be conversational, specific, and helpful. Explain why each recommended car suits the user's stated needs.
If only one car matches, confidently recommend that one. Reference conversation history when relevant.`,
    },
    ...historyMessages,
    {
      role: "user",
      content: `User query: "${userQuery}"\n\nCars within the user's requirements:\n${carContext}\n\nRecommend the best option(s) from this list and explain why.`,
    },
  ];

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    max_tokens: 500,
    temperature: 0.7,
  });

  return response.choices[0].message.content;
};

module.exports = { generateRecommendation };