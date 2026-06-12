const { StateGraph, Annotation, START, END } = require("@langchain/langgraph");
const { processRequirement } = require("../agents/requirementAgent");
const { retrieveCars } = require("../agents/retrievalAgent");
const { recommendCars } = require("../agents/recommendationAgent");

/**
 * Shared state that flows through every node of the graph.
 *
 * query        - the raw user query
 * history      - prior chat messages, passed to the recommendation step
 * requirement  - structured filters + embedding extracted from the query
 * filters      - the (possibly relaxed) hard filters passed to retrieval
 * cars         - cars returned by the most recent retrieval
 * relaxed      - whether we've already attempted a budget relaxation,
 *                so we only ever retry once
 * recommendation - final LLM-generated recommendation text
 */
const GraphState = Annotation.Root({
  query: Annotation,
  history: Annotation,
  requirement: Annotation,
  filters: Annotation,
  cars: Annotation,
  relaxed: Annotation,
  recommendation: Annotation,
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

  console.log("[graph] decision → proceeding to recommend");
  return "recommend";
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

// ── Node: generate the final natural-language recommendation ──────────────
async function recommendNode(state) {
  console.log("[graph] node → recommend");

  const recommendation = await recommendCars(state.query, state.cars, state.history || []);

  return { recommendation };
}

const graph = new StateGraph(GraphState)
  .addNode("extractRequirements", extractRequirementsNode)
  .addNode("retrieveCars", retrieveCarsNode)
  .addNode("relaxFilters", relaxFiltersNode)
  .addNode("recommend", recommendNode)
  .addEdge(START, "extractRequirements")
  .addEdge("extractRequirements", "retrieveCars")
  .addConditionalEdges("retrieveCars", routeAfterRetrieval, {
    relax: "relaxFilters",
    recommend: "recommend",
  })
  .addEdge("relaxFilters", "retrieveCars")
  .addEdge("recommend", END);

const compiledGraph = graph.compile();

/**
 * Runs the full requirement -> retrieval -> (optional relax/retry) -> recommend
 * pipeline for a single user query.
 *
 * @param {string} query - the user's message
 * @param {Array<{role: string, content: string}>} history - prior chat turns
 * @returns {Promise<{ recommendation: string, cars: any[], requirement: object, filters: object }>}
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
