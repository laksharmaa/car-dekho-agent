const { ChatGroq } = require("@langchain/groq");
const { z } = require("zod");
const { generateEmbedding } = require("../services/embeddingService");

// Structured schema for extracted car requirements.
// Using LangChain's withStructuredOutput removes the need for manual
// "strip ```json fences and JSON.parse" handling — the model is forced
// into this shape (or the call throws, which we catch below).
const requirementSchema = z.object({
  maxPrice: z.number().nullable().describe("Maximum price in rupees, e.g. 1500000 for 15 lakhs"),
  minPrice: z.number().nullable().describe("Minimum price in rupees"),
  bodyType: z.enum(["SUV", "Sedan", "Hatchback", "MPV", "Coupe"]).nullable(),
  fuelType: z.enum(["Petrol", "Diesel", "Electric", "Hybrid", "CNG"]).nullable(),
  minMileage: z.number().nullable().describe("Minimum mileage required in km/l"),
  minSafetyRating: z.number().nullable().describe("Minimum safety rating, 1-5"),
  useCase: z.string().nullable().describe("Brief use case summary, e.g. 'long travel', 'city commute', 'family'"),
});

const structuredModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0,
}).withStructuredOutput(requirementSchema, { name: "car_requirements" });

const DEFAULT_REQUIREMENTS = {
  maxPrice: null,
  minPrice: null,
  bodyType: null,
  fuelType: null,
  minMileage: null,
  minSafetyRating: null,
  useCase: null,
};

const processRequirement = async (query) => {
  console.log(`[requirementAgent] extracting requirements + embedding for: "${query}"`);

  // Run embedding and structured extraction in parallel
  const [embedding, structured] = await Promise.all([
    generateEmbedding(query),
    extractStructuredRequirements(query),
  ]);

  console.log("[requirementAgent] structured requirements:", structured);

  return {
    query,
    embedding,
    ...structured,
  };
};

const extractStructuredRequirements = async (query) => {
  try {
    const result = await structuredModel.invoke([
      {
        role: "system",
        content:
          "You are a car requirement extractor for the Indian car market. " +
          "Extract structured filters from the user's query. " +
          "Use null for any field not mentioned. " +
          "Convert lakh values to rupees (e.g. 15 lakhs -> 1500000).",
      },
      { role: "user", content: query },
    ]);

    return result;
  } catch (err) {
    console.error("[requirementAgent] structured extraction failed, using defaults:", err.message);
    return { ...DEFAULT_REQUIREMENTS };
  }
};

module.exports = { processRequirement };
