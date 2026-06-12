# Architecture

This document covers the LangGraph orchestration layer that ties the three
agents together, and the frontend component structure. For the high-level
product overview, see [`README.md`](./README.md).

---

## Backend: LangGraph Orchestration

The recommendation pipeline lives in `backend/src/graphs/recommendationGraph.js`
as a `StateGraph`. Previously this was a sequence of manual `await` calls with
an `if (results.length === 0)` branch buried inside the vector search service.
It's now an explicit graph, which makes the retry/relax behaviour visible and
gives a single place to add new steps (e.g. an intent router for the compare
feature — see "Future Extension" below).

### Shared State

```js
{
  query: string,            // raw user query
  history: Array<Message>,  // prior chat turns, passed to the recommender
  requirement: object,      // { embedding, maxPrice, bodyType, ... } from requirementAgent
  filters: object,          // hard filters derived from `requirement`, possibly relaxed
  cars: Array<Car>,          // most recent retrieval result
  relaxed: boolean,         // true once a budget-relaxation retry has happened
  recommendation: string,   // final LLM output
}
```

### Nodes

| Node | Wraps | Responsibility |
|---|---|---|
| `extractRequirements` | `agents/requirementAgent.js` | Generates the query embedding (Xenova/MiniLM) and, in parallel, extracts structured filters via `ChatGroq(...).withStructuredOutput(zodSchema)`. Derives `filters` from the result. |
| `retrieveCars` | `agents/retrievalAgent.js` → `services/vectorSearchService.js` | Runs MongoDB Atlas `$vectorSearch` with the current `filters`. |
| `relaxFilters` | — | Increases `filters.maxPrice` by 20% and sets `relaxed = true`. |
| `recommend` | `agents/recommendationAgent.js` → `services/groqService.js` | Generates the final natural-language recommendation from `cars`, `query`, and `history`. |

### Edges

```text
START → extractRequirements → retrieveCars
                                   │
                    ┌──────────────┴───────────────┐
                    │ routeAfterRetrieval (conditional)
                    │
   cars.length === 0           otherwise
   AND filters.maxPrice
   AND !relaxed
        │                          │
        ▼                          ▼
   relaxFilters              recommend → END
        │
        └──→ retrieveCars  (loop, retried at most once)
```

The `relaxed` flag guarantees the relax/retry loop runs **at most once** per
request — if the relaxed budget still returns 0 cars, the graph proceeds to
`recommend`, which already has a "no cars found" fallback message.

### Logging

Every node logs on entry, and `runRecommendationGraph()` logs a start/end
banner with total duration and result count. This gives a readable trace of
each request, e.g.:

```text
========== [recommendationGraph] START ==========
[recommendationGraph] query: "Best SUV under ₹15 lakhs" | history turns: 0
[graph] node → extractRequirements
[requirementAgent] structured requirements: { maxPrice: 1500000, bodyType: 'SUV', ... }
[graph] node → retrieveCars (relaxed=false)
[retrievalAgent] results: [ 'Tata Nexon', 'Hyundai Creta', ... ]
[graph] decision → proceeding to recommend
[graph] node → recommend
[recommendationGraph] DONE in 1840ms | 4 car(s) | relaxed=false
========== [recommendationGraph] END ==========
```

### Future Extension: Compare via Conversation

The current vehicle comparison feature (see README) is frontend-only —
users select cars via checkboxes. A natural extension is letting users type
*"compare the Nexon and the Creta"*. This would be added as:

1. An **intent classification node** at `START`, before `extractRequirements`
   — a small structured-output call returning `{ intent: "recommend" | "compare", carNames?: string[] }`.
2. A **conditional edge** routing `compare` intents to a new `compareAgent`
   node (looks up the named cars and generates a natural-language comparison),
   while `recommend` intents follow the existing path.

Because the graph is already conditional-edge based, this is additive — no
changes needed to the existing nodes.

---

## Frontend: Component Structure

`frontend/src/App.jsx` was originally a 416-line file mixing layout, chat
logic, and presentational components. It's now split as follows:

```text
src/
├── App.jsx                 # top-level state: messages, auth, compare selection
├── api/api.js              # axios instance + Auth0 token interceptor
├── constants/
│   └── suggestions.js       # starter prompt suggestions
├── utils/
│   └── carHelpers.js        # formatPrice, fuelColor, carKey
└── components/
    ├── Header.jsx            # top bar: logo, "New Search", user menu
    ├── LoginScreen.jsx        # pre-auth screen
    ├── Spinner.jsx            # loading state
    ├── EmptyState.jsx         # welcome screen + suggestion chips
    ├── Message.jsx            # chat bubble (user or assistant + car grid)
    ├── CarCard.jsx            # individual car result + Compare toggle
    ├── StarRating.jsx          # safety rating stars
    ├── ThinkingIndicator.jsx   # "Finding best matches…" animation
    ├── ChatInput.jsx           # persistent bottom input bar
    ├── CompareBar.jsx          # selected-cars chips + "Compare Now"
    └── CompareModal.jsx        # side-by-side spec table
```

### Compare Selection Flow

1. `App.jsx` holds `selectedCars` (max 2) and `showCompare` (modal visibility).
2. `CarCard` renders a "Compare" toggle; `Message.jsx` computes `selected`
   and `disabled` per card by matching `carKey(car)` against `selectedCars`.
3. `carKey(car)` defaults to `car.name`, used to track selection across
   different chat messages (the same model recommended twice should be
   treated as the same selection).
4. `CompareBar` shows selected cars as removable chips and opens
   `CompareModal` once exactly 2 are selected.
5. `CompareModal` renders the spec table and highlights the better value per
   row using simple numeric comparisons (lower price / higher mileage /
   higher safety rating wins).

**Known limitation:** selection is keyed on `car.name`. If the backend ever
returns multiple distinct entries with the same name but different specs,
they'd be treated as the same selection. Not an issue with the current seed
data, but worth revisiting if the car catalog grows.