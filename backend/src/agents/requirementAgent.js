const { generateEmbedding } = require("../services/embeddingService");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const processRequirement = async (query) => {
  // Run embedding and structured extraction in parallel
  const [embedding, structured] = await Promise.all([
    generateEmbedding(query),
    extractStructuredRequirements(query),
  ]);

  return {
    query,
    embedding,
    ...structured,
  };
};

const extractStructuredRequirements = async (query) => {
  const prompt = `You are a car requirement extractor. Extract structured requirements from the user query.
Return ONLY a valid JSON object with these fields (use null if not mentioned):
{
  "maxPrice": <number in rupees, e.g. 1500000 for 15 lakhs, null if not mentioned>,
  "minPrice": <number in rupees, null if not mentioned>,
  "bodyType": <one of: "SUV", "Sedan", "Hatchback", "MPV", "Coupe", null if not mentioned>,
  "fuelType": <one of: "Petrol", "Diesel", "Electric", "Hybrid", "CNG", null if not mentioned>,
  "minMileage": <number, minimum km/l required, null if not mentioned>,
  "minSafetyRating": <number 1-5, null if not mentioned>,
  "useCase": <brief use case summary like "long travel", "city commute", "family", null if not mentioned>
}

User query: "${query}"

Return only the JSON, no explanation.`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0,
    });

    const text = response.choices[0].message.content.trim();
    const json = text.replace(/```json|```/g, "").trim();
    return JSON.parse(json);
  } catch (err) {
    console.error("Requirement extraction failed, using defaults:", err.message);
    return {
      maxPrice: null,
      minPrice: null,
      bodyType: null,
      fuelType: null,
      minMileage: null,
      minSafetyRating: null,
      useCase: null,
    };
  }
};

module.exports = { processRequirement };