# CarDekho Agent – AI-Powered Car Recommendation System

CarDekho Agent is an AI-powered car recommendation platform that helps confused customers find a suitable car based on their requirements.

Instead of forcing users to browse hundreds of vehicles and filters, CarDekho Agent allows them to ask questions like:

> "I need a safe family SUV under ₹15 lakh"

> "Suggest a fuel-efficient hybrid car for city driving"

> "Best hatchback for daily commute with high safety ratings"

The system uses Retrieval-Augmented Generation (RAG), Vector Search, and a multi-agent architecture orchestrated with **LangGraph** to understand user requirements, retrieve relevant vehicles, and generate personalized recommendations.

---

## Architecture Overview

The application follows a 3-Agent RAG Architecture, orchestrated as a LangGraph state graph with a conditional retry path:

```text
User Query
    │
    ▼
Requirement Agent
    │
    ├── Understands user intent (LangChain structured output)
    └── Generates semantic embedding
    │
    ▼
Retrieval Agent
    │
    ├── MongoDB Atlas Vector Search
    ├── Cosine Similarity Search
    └── Retrieves Top Matching Cars
    │
    ├── 0 results + budget filter? ──▶ Relax budget by 20% ──▶ Retry retrieval (once)
    │
    ▼
Recommendation Agent
    │
    ├── Groq LLM
    ├── Context-Aware Reasoning
    └── Personalized Recommendation
    │
    ▼
Response
```

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full LangGraph node/edge breakdown.

---

## Tech Stack

### Frontend

* React
* Auth0 Authentication

### Backend

* Node.js
* Express.js
* MongoDB Vector Search

### AI Stack

* Xenova/all-MiniLM-L6-v2
* MongoDB Atlas Vector Search
* Llama 3.3 70B Versatile
* LangChain (structured output parsing)
* LangGraph (agent orchestration)

### Authentication

* Auth0
* JWT Access Tokens

### Deployment

* Frontend: Vercel
* Backend: Render
* Database: MongoDB Atlas

---

## How It Works

### Requirement Agent

The Requirement Agent receives the user query and converts it into a semantic vector representation.

Example:

```text
I need a safe family SUV under ₹15 lakh
```

The query is embedded using:

```text
Xenova/all-MiniLM-L6-v2
```

The embedding captures the semantic meaning of the request rather than relying on keyword matching.

In parallel, the same query is passed to a LangChain `ChatGroq` model bound to a Zod schema via `withStructuredOutput`, which extracts hard filters (max/min price, body type, fuel type, minimum mileage, minimum safety rating, use case) directly as a validated object — no manual JSON parsing.

---

### Retrieval Agent

Each car in the database contains:

* Name
* Brand
* Body Type
* Price
* Mileage
* Safety Rating
* Fuel Type
* Description
* Embedding Vector

The Retrieval Agent performs a MongoDB Atlas Vector Search using cosine similarity.

```text
Query Embedding
        ↓
MongoDB Vector Search
        ↓
Top 3 Relevant Cars
```

Only the most relevant vehicles are returned.

---

### Recommendation Agent

The Recommendation Agent uses Groq-hosted Llama 3.3 70B.

The model receives:

* User Query
* Conversation History
* Retrieved Cars

The model does NOT receive embedding vectors.

It generates:

* Best Recommendation
* Alternative Options
* Trade-offs
* Reasoning

This ensures recommendations remain grounded in retrieved vehicle data.

---

## Vehicle Comparison

Users can select up to **2 cars** from any recommendation result (across messages) and compare them side-by-side in a table view.

* Each car card has a "Compare" toggle. Selecting a 2nd car while 2 are already selected is disabled until one is removed.
* A persistent compare bar shows the currently selected cars as removable chips, with "Compare Now" enabled once exactly 2 are selected.
* The comparison modal renders a spec table (Price, Mileage, Safety Rating, Body Type, Fuel Type, Description) and highlights the better value per row (lower price, higher mileage/safety) with a trophy indicator.

This is a frontend-only feature — no additional backend endpoints were needed since car objects are already returned in full with each chat response.

---

## Authentication

Auth0 is used for user authentication.

Features:

* Secure Login
* JWT Access Tokens
* Session Persistence
* Protected API Routes

Users must authenticate before accessing the recommendation system.

---

## Chat Sessions

Authenticated users have persistent chat sessions.

Each conversation stores:

### User Message

```json
{
  "role": "user",
  "content": "Need a family SUV under 15 lakh"
}
```

### Assistant Message

```json
{
  "role": "assistant",
  "recommendation": "...",
  "cars": [...]
}
```

Benefits:

* Conversation continuity
* Follow-up questions
* Personalized search history

---

## Environment Variables

### Backend

```env
PORT=5000
MONGODB_URI=
GROQ_API_KEY=
AUTH0_DOMAIN=
AUTH0_AUDIENCE=
```

### Frontend

```env
VITE_API_URL=
VITE_AUTH0_DOMAIN=
VITE_AUTH0_CLIENT_ID=
VITE_AUTH0_AUDIENCE=
```

---

## Local Setup

### Clone Repository

```bash
git clone <repo-url>

cd project
```

### Backend

```bash
cd backend

npm install

npm run dev
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## Seed Database

```bash
npm run seed
```

This script:

1. Loads dummy car data
2. Generates embeddings
3. Stores vehicles in MongoDB Atlas

---

## MongoDB Vector Search Configuration

Index Name:

```text
car_index
```

Configuration:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 384,
      "similarity": "cosine"
    }
  ]
}
```

---

## What I Built

I focused on building an opinionated AI-first car discovery experience rather than a traditional filter-based search application.

Key features:

* Natural Language Search
* Multi-Agent Architecture orchestrated with LangGraph
* RAG Pipeline
* Vector Search
* Conversational Recommendations
* Vehicle Comparison (table view, up to 2 cars)
* Authentication
* Persistent Chat History

The goal was to help users move from uncertainty to a confident shortlist as quickly as possible.

---

## What I Deliberately Cut

Given the time constraints, I intentionally did not build:

* Detailed specification pages
* Dealer integrations
* Price prediction models
* User reviews ingestion
* Advanced filtering UI
* Multi-modal search

These can be added in future iterations.

---

## AI Tool Usage

AI tools were used extensively for:

* Architecture brainstorming
* Boilerplate generation
* Refactoring
* Debugging
* Documentation

All generated code was reviewed, modified, and integrated manually.

AI was most useful for accelerating repetitive implementation tasks while allowing focus on system design and product decisions.

---

## If I Had Another 4 Hours

I would add:

* Hybrid Retrieval (Metadata + Vector Search)
* Session Sidebar
* Multi-Turn Agent Memory
* Compare-by-conversation (e.g. "compare the Nexon and the Creta" routed via a LangGraph intent node)
* Review Summarization Agent
* Recommendation Explanations with Citations
* Streaming Responses
* Analytics Dashboard

---

## Author

Lakshya Sharma

Software Engineer | Cloud & AI Enthusiast

Built as part of the CarDekho AI-Native Software Engineer Assignment.