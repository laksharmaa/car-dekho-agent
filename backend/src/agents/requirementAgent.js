const { generateEmbedding } = require(
  "../services/embeddingService"
);

const processRequirement = async (query) => {
  const embedding =
    await generateEmbedding(query);

  return {
    query,
    embedding,
  };
};

module.exports = {
  processRequirement,
};