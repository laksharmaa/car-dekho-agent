const { StateGraph, Annotation, START, END } = require("@langchain/langgraph");
const { processRequirement } = require("../agents/requirementAgent");
const { retrieveCars } = require("../agents/retrievalAgent");

/**
 * Shared state that flows through every node of the graph.
 *
 * NOTE: The "recommend" node has been removed from the graph.
 * The controller now calls generateRecommendationStream() directly
 * after the graph returns, so the SSE response can be piped in real time.
 *
 * The graph is now responsible only for:
 *   requirement extraction → retrieval → (optional budget relaxation + retry)
 */
const GraphState = Annotation.Root({
  query: Annotation,
  history: Annotation,
  requirement: Annotation,
  filters: Annotation,
  cars: Annotation,
  relaxed: Annotation,
});

// ── Node: extract structured requirements + embedding from the query ──────
async function extractRequirementsNode(state) {
  console.log("[graph] node → extractRequirements");

  const requirement = await processRequirement(state.query);

  const filters = {
    maxPrice: requirement.maxPrice,
    minPrice: requirement.minPrice,
    bodyType: requirement.bodyType,
    fuelType: requirement.fuelType,
    minMileage: requirement.minMileage,
    minSafetyRating: requirement.minSafetyRating,
  };

  console.log("[graph] derived filters:", filters);

  return { requirement, filters };
}

// ── Node: run vector search with current filters ──────────────────────────
async function retrieveCarsNode(state) {
  console.log(`[graph] node → retrieveCars (relaxed=${Boolean(state.relaxed)})`);

  const cars = await retrieveCars(state.requirement.embedding, state.filters);

  console.log(`[graph] retrieveCars returned ${cars.length} car(s)`);

  return { cars };
}

// ── Conditional edge: decide whether to relax the budget and retry ────────
function routeAfterRetrieval(state) {
  const noResults = state.cars.length === 0;
  const hasBudgetCap = Boolean(state.filters.maxPrice);
  const alreadyRelaxed = Boolean(state.relaxed);

  if (noResults && hasBudgetCap && !alreadyRelaxed) {
    console.log(
      "[graph] decision → 0 results with an active budget filter, " +
        "routing to relaxFilters for a single retry"
    );
    return "relax";
  }

  console.log("[graph] decision → done, returning cars to controller");
  return "done";
}

// ── Node: relax the budget filter by 20% and loop back to retrieval ───────
async function relaxFiltersNode(state) {
  const relaxedMaxPrice = Math.round(state.filters.maxPrice * 1.2);

  console.log(
    `[graph] node → relaxFilters (maxPrice ${state.filters.maxPrice} -> ${relaxedMaxPrice})`
  );

  return {
    filters: { ...state.filters, maxPrice: relaxedMaxPrice },
    relaxed: true,
  };
}

const graph = new StateGraph(GraphState)
  .addNode("extractRequirements", extractRequirementsNode)
  .addNode("retrieveCars", retrieveCarsNode)
  .addNode("relaxFilters", relaxFiltersNode)
  .addEdge(START, "extractRequirements")
  .addEdge("extractRequirements", "retrieveCars")
  .addConditionalEdges("retrieveCars", routeAfterRetrieval, {
    relax: "relaxFilters",
    done: END,
  })
  .addEdge("relaxFilters", "retrieveCars");

const compiledGraph = graph.compile();

/**
 * Runs requirement extraction → retrieval → (optional relax/retry).
 * Does NOT call the LLM for recommendation — that is the controller's job
 * so it can stream tokens directly to the HTTP response.
 *
 * @param {string} query
 * @param {Array<{role: string, content: string}>} history
 * @returns {Promise<{ cars: any[], requirement: object, filters: object, relaxed: boolean }>}
 */
const runRecommendationGraph = async (query, history = []) => {
  console.log(`\n========== [recommendationGraph] START ==========`);
  console.log(`[recommendationGraph] query: "${query}" | history turns: ${history.length}`);

  const startedAt = Date.now();

  const result = await compiledGraph.invoke({ query, history });

  console.log(
    `[recommendationGraph] DONE in ${Date.now() - startedAt}ms | ` +
      `${result.cars.length} car(s) | relaxed=${Boolean(result.relaxed)}`
  );
  console.log(`========== [recommendationGraph] END ==========\n`);

  return result;
};

module.exports = { runRecommendationGraph };