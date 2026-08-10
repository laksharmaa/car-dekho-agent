const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

const MAX_QUERY_LENGTH = 300;
const MAX_HISTORY_MESSAGES = 8;
const MAX_HISTORY_MESSAGE_LENGTH = 1200;
const MAX_TOTAL_HISTORY_LENGTH = 4000;
const MAX_REQUEST_SIZE_BYTES = 8 * 1024;

// General API limiter — applies to all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please try again after 15 minutes.",
  },
});

// Chat limiter — 6 messages per hour per user
const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Chat limit reached. You can send 10 messages per hour. Please try again later.",
  },
  keyGenerator: (req) => {
    // Use Auth0 user ID if available, otherwise use the helper for safe IP fallback
    return req.auth?.payload?.sub || ipKeyGenerator(req);
  },
  skip: () => process.env.NODE_ENV === "development",
});

// Session limiter — 60 requests per 15 minutes per user
const sessionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many session requests. Please try again shortly.",
  },
  keyGenerator: (req) => {
    return req.auth?.payload?.sub || ipKeyGenerator(req);
  },
});

const chatInputGuard = (req, res, next) => {
  const body = req.body || {};
  const query = typeof body.query === "string" ? body.query.trim() : "";
  const history = Array.isArray(body.history) ? body.history : [];

  if (Buffer.byteLength(JSON.stringify(body), "utf8") > MAX_REQUEST_SIZE_BYTES) {
    return res.status(413).json({
      error: "Request too large. Keep your message and history compact.",
    });
  }

  if (!query) {
    return res.status(400).json({ message: "Query required" });
  }

  if (query.length > MAX_QUERY_LENGTH) {
    return res.status(413).json({
      error: `Query too long. Maximum ${MAX_QUERY_LENGTH} characters allowed.`,
    });
  }

  if (history.length > MAX_HISTORY_MESSAGES) {
    return res.status(413).json({
      error: `Too much chat history. Maximum ${MAX_HISTORY_MESSAGES} prior messages allowed.`,
    });
  }

  let totalHistoryLength = 0;

  for (const item of history) {
    const content = typeof item?.content === "string" ? item.content : "";

    if (content.length > MAX_HISTORY_MESSAGE_LENGTH) {
      return res.status(413).json({
        error: `A history message is too long. Maximum ${MAX_HISTORY_MESSAGE_LENGTH} characters per message.`,
      });
    }

    totalHistoryLength += content.length;
  }

  if (totalHistoryLength > MAX_TOTAL_HISTORY_LENGTH) {
    return res.status(413).json({
      error: `Chat history is too large. Keep it under ${MAX_TOTAL_HISTORY_LENGTH} characters total.`,
    });
  }

  next();
};

module.exports = { globalLimiter, chatLimiter, sessionLimiter, chatInputGuard };