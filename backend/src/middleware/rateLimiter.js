const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

// General API limiter — applies to all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please try again after 15 minutes.",
  },
});

// Chat limiter — 20 messages per hour per user
const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Chat limit reached. You can send 20 messages per hour. Please try again later.",
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

module.exports = { globalLimiter, chatLimiter, sessionLimiter };