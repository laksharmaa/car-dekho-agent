# CarDekho Agent – AI-Powered Car Recommendation System

CarDekho Agent is an AI-powered car recommendation platform that helps confused customers find a suitable car based on their requirements.

Instead of forcing users to browse hundreds of vehicles and filters, CarDekho Agent allows them to ask questions like:

> "I need a safe family SUV under ₹15 lakh"

> "Suggest a fuel-efficient hybrid car for city driving"

> "Best hatchback for daily commute with high safety ratings"

The system uses Retrieval-Augmented Generation (RAG), Vector Search, and a multi-agent architecture to understand user requirements, retrieve relevant vehicles, and generate personalized recommendations.

---

## Architecture Overview

The application follows a 3-Agent RAG Architecture:

```text
User Query
    │
    ▼
Requirement Agent
    │
    ├── Understands user intent
    └── Generates semantic embedding
    │
    ▼
Retrieval Agent
    │
    ├── MongoDB Atlas Vector Search
    ├── Cosine Similarity Search
    └── Retrieves Top Matching Cars
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
* Multi-Agent Architecture
* RAG Pipeline
* Vector Search
* Conversational Recommendations
* Authentication
* Persistent Chat History

The goal was to help users move from uncertainty to a confident shortlist as quickly as possible.

---

## What I Deliberately Cut

Given the time constraints, I intentionally did not build:

* Vehicle comparison tables
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
* Vehicle Comparison Agent
* Review Summarization Agent
* Recommendation Explanations with Citations
* Streaming Responses
* Analytics Dashboard

---

## Author

Lakshya Sharma

Software Engineer | Cloud & AI Enthusiast

Built as part of the CarDekho AI-Native Software Engineer Assignment.
