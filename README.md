# CarDekho Agent – AI Car Recommendation Assistant



## Overview



CarDekho Agent is an AI-powered car recommendation system designed to help confused buyers find the right car through natural conversation.



Instead of applying multiple filters, users can simply describe their requirements:



* "I need a safe family SUV under ₹15 lakh"

* "Suggest a fuel-efficient car for daily city driving"

* "Best automatic car for a first-time buyer"



The system understands user needs, finds relevant vehicles from the database, and provides personalized recommendations with reasoning.



---



## Features



* Natural language car search

* AI-powered personalized recommendations

* Conversational chat experience

* Vehicle comparison (up to 2 cars)

* Persistent chat history

* Secure authentication with Auth0

* Retrieval-Augmented Generation (RAG)



---



## How It Works



### 1. Requirement Understanding



The user's query is analyzed to understand preferences such as:



* Budget

* Body type

* Fuel type

* Safety requirements

* Mileage expectations

* Intended use case



### 2. Vehicle Retrieval



The query is converted into an embedding and matched against vehicles stored in MongoDB Atlas Vector Search.



The system retrieves the most relevant cars based on semantic similarity and user constraints.



### 3. Recommendation Generation



An LLM receives:



* User query

* Conversation history

* Retrieved vehicles



It then generates personalized recommendations, explains trade-offs, and suggests suitable alternatives.



---



## Tech Stack



### Frontend



* React

* Auth0



### Backend



* Node.js

* Express.js



### Database



* MongoDB Atlas

* MongoDB Vector Search



### AI



* LangChain

* LangGraph

* Xenova/all-MiniLM-L6-v2

* Llama 3.3 70B (Groq)



### Deployment



* Vercel (Frontend)

* Render (Backend)

* MongoDB Atlas (Database)



---



## Setup Guide



### 1. Clone Repository



```bash

git clone <repo-url>

cd project

```



### 2. Backend Setup



```bash

cd backend

npm install

npm run dev

```



Create a `.env` file:



```env

PORT=5000
MONGODB_URI=
GROQ_API_KEY=
AUTH0_DOMAIN=
AUTH0_AUDIENCE=

```



### 3. Frontend Setup



```bash

cd frontend

npm install

npm run dev

```



Create a `.env` file:



```env

VITE_API_URL=
VITE_AUTH0_DOMAIN=
VITE_AUTH0_CLIENT_ID=
VITE_AUTH0_AUDIENCE=

```



### 4. Seed Database



```bash

npm run seed

```



This will populate MongoDB with vehicle data and generate embeddings for semantic search.

---

## Docker Setup

### Development mode (live reload)

Run from the repository root

```bash
docker compose up --build
```

### Production-style build

If you want the base production setup without the dev overrides:

```bash
docker compose -f docker-compose.yml up --build
```


## Vehicle Comparison



Users can select up to two vehicles from recommendation results and compare them side-by-side across:



* Price

* Mileage

* Safety Rating

* Fuel Type

* Body Type

* Description



---



## Future Improvements



* Dealer integrations

* Review summarization

* Hybrid search (metadata + vector search)

* Specification pages

* Advanced comparison capabilities



---



## Author



Lakshya Sharma



Built as part of the CarDekho AI-Native Software Engineer Assignment.