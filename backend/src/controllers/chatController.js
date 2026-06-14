const { runRecommendationGraph } = require("../graphs/recommendationGraph");
const { generateRecommendationStream, NO_CARS_MESSAGE } = require("../services/groqService");
const Session = require("../models/Session");

/**
 * POST /api/chat  (SSE streaming)
 *
 * Flow:
 *  1. Run the LangGraph pipeline (requirement extraction → retrieval → optional relax/retry).
 *     This part is NOT streamed — it runs silently while the client waits for the first token.
 *  2. Open an SSE connection and stream the LLM recommendation token by token.
 *  3. After the stream closes, persist the full text + cars to the session.
 *
 * SSE event format (newline-delimited, text/event-stream):
 *   data: {"type":"cars","cars":[...]}          ← sent once, before any tokens
 *   data: {"type":"token","token":"Hello "}     ← one per LLM token
 *   data: {"type":"done"}                       ← stream finished
 *   data: {"type":"error","message":"..."}      ← only on failure
 */
const chat = async (req, res) => {
  const { query, history } = req.body;
  const userId = req.auth.payload.sub;

  if (!query) {
    return res.status(400).json({ message: "Query required" });
  }

  console.log(`[chatController] user=${userId} | query="${query}"`);

  // ── SSE headers ──────────────────────────────────────────────────────────
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // flush immediately so the browser opens the stream

  const send = (payload) => res.write(`data: ${JSON.stringify(payload)}\n\n`);

  try {
    // ── Step 1: run the graph (retrieval + optional relax) ─────────────────
    const { cars, requirement, filters, relaxed } = await runRecommendationGraph(query, history || []);

    console.log(`[chatController] graph done | cars=${cars.length} relaxed=${Boolean(relaxed)}`);

    // Send the car list to the client immediately so the UI can render cards
    // while the text is still streaming in.
    send({ type: "cars", cars });

    // ── Step 2: handle the no-results case without streaming ───────────────
    if (!cars || cars.length === 0) {
      send({ type: "token", token: NO_CARS_MESSAGE });
      send({ type: "done" });

      await persistSession(userId, query, NO_CARS_MESSAGE, []);
      return res.end();
    }

    // ── Step 3: stream the LLM recommendation ─────────────────────────────
    const stream = await generateRecommendationStream(query, cars, history || []);

    let fullText = "";

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content ?? "";
      if (token) {
        fullText += token;
        send({ type: "token", token });
      }
    }

    send({ type: "done" });

    console.log(`[chatController] stream done | text length=${fullText.length}`);

    // ── Step 4: persist completed message to session ───────────────────────
    await persistSession(userId, query, fullText, cars);

    res.end();
  } catch (error) {
    console.error("[chatController] error:", error);
    send({ type: "error", message: "Server Error" });
    res.end();
  }
};

async function persistSession(userId, query, recommendation, cars) {
  try {
    await Session.findOneAndUpdate(
      { userId },
      {
        $push: {
          messages: {
            $each: [
              { role: "user", content: query },
              { role: "assistant", content: recommendation, cars },
            ],
          },
        },
      },
      { upsert: true, new: true }
    );
    console.log(`[chatController] session saved for user=${userId}`);
  } catch (err) {
    console.error("[chatController] session save error:", err);
  }
}

module.exports = { chat };