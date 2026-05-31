require("dotenv").config();

const Groq = require("groq-sdk/index.js");

const buildCarContext = require(
  "../utils/buildCarContext"
);

const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
  throw new Error(
    "GROQ_API_KEY environment variable is missing or empty. Add it to .env or pass apiKey to Groq."
  );
}

const groq = new Groq({
  apiKey: groqApiKey,
});

const generateRecommendation = async (
  userQuery,
  cars
) => {
  const context = buildCarContext(cars);

  const completion =
    await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",

      temperature: 0.4,

      max_tokens: 500,

      messages: [
        {
          role: "system",
          content: `
You are an expert automotive advisor.

Rules:
1. Use ONLY provided car data.
2. Never invent specs.
3. Recommend best option.
4. Mention alternatives.
5. Mention trade-offs.
6. Keep answer concise.
`,
        },
        {
          role: "user",
          content: `
User Query:
${userQuery}

Retrieved Cars:
${context}
`,
        },
      ],
    });

  return completion.choices[0].message.content;
};

module.exports = {
  generateRecommendation,
};