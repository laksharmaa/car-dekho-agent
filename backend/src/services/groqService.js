const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Builds the messages array shared by both the streaming and non-streaming paths.
 */
const buildMessages = (userQuery, cars, history = []) => {
  const carContext = cars
    .map(
      (car, i) =>
        `${i + 1}. ${car.name} by ${car.brand} — ₹${(car.price / 100000).toFixed(2)}L, ` +
        `${car.bodyType}, ${car.fuelType}, ${car.mileage}km/l, ` +
        `Safety: ${car.safetyRating}/5. ${car.description}`
    )
    .join("\n");

  const historyMessages = history.map((m) => ({ role: m.role, content: m.content }));

  return [
    {
      role: "system",
      content: `You are CarWise, an expert AI car recommendation assistant for the Indian market.
The cars listed below have ALREADY been filtered to match the user's budget and preferences — every car shown is within their constraints.
Your job is to recommend from ONLY these cars. Do not suggest cars outside this list.
Be conversational, specific, and helpful. Explain why each recommended car suits the user's stated needs.
If only one car matches, confidently recommend that one. Reference conversation history when relevant.
IMPORTANT: Write in plain text only. Do not use markdown formatting — no asterisks, no bold (**text**), no bullet dashes, no headers. Use plain sentences and numbers for lists.`,
    },
    ...historyMessages,
    {
      role: "user",
      content: `User query: "${userQuery}"\n\nCars within the user's requirements:\n${carContext}\n\nRecommend the best option(s) from this list and explain why.`,
    },
  ];
};

const NO_CARS_MESSAGE =
  "I couldn't find any cars matching your exact requirements in our database. Try adjusting your budget or preferences slightly and I'll search again.";

/**
 * Non-streaming path — returns the full recommendation string.
 * Used internally by the streaming controller to flush the completed text
 * into the session after the stream ends.
 *
 * For the streaming endpoint, prefer generateRecommendationStream().
 */
const generateRecommendation = async (userQuery, cars, history = []) => {
  if (!cars || cars.length === 0) return NO_CARS_MESSAGE;

  const messages = buildMessages(userQuery, cars, history);

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    max_tokens: 500,
    temperature: 0.7,
  });

  return response.choices[0].message.content;
};

/**
 * Streaming path — returns an async iterable of Groq chunks.
 * The caller is responsible for writing each chunk to the HTTP response
 * and collecting the full text for session persistence.
 *
 * Usage:
 *   const stream = await generateRecommendationStream(query, cars, history);
 *   for await (const chunk of stream) {
 *     const token = chunk.choices[0]?.delta?.content ?? "";
 *     // write token to SSE response
 *   }
 */
const generateRecommendationStream = async (userQuery, cars, history = []) => {
  if (!cars || cars.length === 0) return null; // caller handles the no-cars case

  const messages = buildMessages(userQuery, cars, history);

  const stream = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    max_tokens: 500,
    temperature: 0.7,
    stream: true, // ← the only difference from the non-streaming call
  });

  return stream;
};

module.exports = { generateRecommendation, generateRecommendationStream, NO_CARS_MESSAGE };