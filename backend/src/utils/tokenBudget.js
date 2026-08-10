const TOKEN_BUDGET_PER_HOUR = 6000;
const TOKEN_BUDGET_WINDOW_MS = 60 * 60 * 1000;
const DEFAULT_MAX_OUTPUT_TOKENS = 500;
const ESTIMATED_CHARS_PER_TOKEN = 4;

const usageByUser = new Map();

function estimateTokens(query = "", history = [], responseLimit = DEFAULT_MAX_OUTPUT_TOKENS) {
  const historyText = (history || [])
    .map((item) => (typeof item?.content === "string" ? item.content : ""))
    .join("\n");

  const promptText = `${query}\n${historyText}`.trim();
  const promptTokens = Math.max(1, Math.ceil(promptText.length / ESTIMATED_CHARS_PER_TOKEN));

  return promptTokens + responseLimit;
}

function consumeTokenBudget(userId, { query = "", history = [], responseLimit = DEFAULT_MAX_OUTPUT_TOKENS, now = Date.now() } = {}) {
  const safeUserId = userId || "anonymous";
  const usage = usageByUser.get(safeUserId);

  if (!usage || now >= usage.resetAt) {
    usageByUser.set(safeUserId, {
      resetAt: now + TOKEN_BUDGET_WINDOW_MS,
      used: 0,
    });
  }

  const currentUsage = usageByUser.get(safeUserId);
  const cost = estimateTokens(query, history, responseLimit);

  if (currentUsage.used + cost > TOKEN_BUDGET_PER_HOUR) {
    return {
      allowed: false,
      reason: "Token budget exceeded",
      remaining: Math.max(0, TOKEN_BUDGET_PER_HOUR - currentUsage.used),
      cost,
    };
  }

  currentUsage.used += cost;
  usageByUser.set(safeUserId, currentUsage);

  return {
    allowed: true,
    remaining: TOKEN_BUDGET_PER_HOUR - currentUsage.used,
    cost,
  };
}

module.exports = {
  TOKEN_BUDGET_PER_HOUR,
  DEFAULT_MAX_OUTPUT_TOKENS,
  estimateTokens,
  consumeTokenBudget,
};
