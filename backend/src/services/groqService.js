const Groq = require("groq-sdk");
const dotenv = require("dotenv");

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateRecommendation = async (userQuery, cars, history = []) => {
  const carContext = cars
    .map(
      (car, i) =>
        `${i + 1}. ${car.name} by ${car.brand} — ₹${(car.price / 100000).toFixed(2)}L, ` +
        `${car.bodyType}, ${car.fuelType}, ${car.mileage}km/l, ` +
        `Safety: ${car.safetyRating}/5. ${car.description}`
    )
    .join("\n");

  // Convert saved history into Groq message format
  const historyMessages = history.map((m) => ({
    role: m.role,
    content: m.role === "assistant" ? m.content : m.content,
  }));

  const messages = [
    {
      role: "system",
      content: `You are CarWise, an expert AI car recommendation assistant for the Indian market. 
You help users find the perfect car based on their needs, budget, and preferences.
Be conversational, helpful, and concise. Reference previous messages in the conversation when relevant.
When recommending cars, mention specific models from the provided list and explain why they suit the user's needs.`,
    },
    ...historyMessages,
    {
      role: "user",
      content: `User query: "${userQuery}"\n\nMatched cars from database:\n${carContext}\n\nProvide a helpful recommendation based on the conversation context and these cars.`,
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