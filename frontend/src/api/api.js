import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const api = axios.create({ baseURL: BASE_URL });

// Attach Auth0 token to every request
let _token = null;

export function setAuthToken(token) {
  _token = token;
}

api.interceptors.request.use((config) => {
  if (_token) {
    config.headers.Authorization = `Bearer ${_token}`;
  }
  return config;
});

/**
 * streamChat — sends a chat query and streams the SSE response.
 *
 * The server sends three event types (all as `data: <JSON>\n\n`):
 *   { type: "cars",  cars: [...] }          — car list, arrives before any tokens
 *   { type: "token", token: "Hello " }      — one LLM token at a time
 *   { type: "done" }                        — stream complete
 *   { type: "error", message: "..." }       — server-side failure
 *
 * @param {string}   query
 * @param {Array}    history
 * @param {object}   callbacks
 * @param {Function} callbacks.onCars    (cars: Car[]) => void
 * @param {Function} callbacks.onToken   (token: string) => void
 * @param {Function} callbacks.onDone    () => void
 * @param {Function} callbacks.onError   (message: string) => void
 */
export async function streamChat(query, history, { onCars, onToken, onDone, onError }) {
  try {
    const response = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(  _token ? { Authorization: `Bearer ${_token}` } : {}),
      },
      body: JSON.stringify({ query, history }),
    });

    if (!response.ok) {
      let errorMessage = `Server error: ${response.status}`;

      try {
        const text = await response.text();
        if (text) {
          try {
            const parsed = JSON.parse(text);
            errorMessage = parsed.error || parsed.message || errorMessage;
          } catch {
            errorMessage = text;
          }
        }
      } catch {
        // ignore and fall back to the default message
      }

      onError?.(errorMessage);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    // ReadableStream is consumed chunk by chunk. Each chunk may contain
    // multiple SSE lines or a partial line — we buffer and split on \n\n.
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE events are delimited by double newlines
      const events = buffer.split("\n\n");
      // The last element might be an incomplete event — keep it in the buffer
      buffer = events.pop();

      for (const event of events) {
        const line = event.trim();
        if (!line.startsWith("data:")) continue;

        try {
          const payload = JSON.parse(line.slice("data:".length).trim());

          if (payload.type === "cars")  onCars?.(payload.cars);
          if (payload.type === "token") onToken?.(payload.token);
          if (payload.type === "done")  onDone?.();
          if (payload.type === "error") onError?.(payload.message);
        } catch {
          // malformed JSON — skip
        }
      }
    }
  } catch (error) {
    const message = error?.message || "Could not connect to server. Please try again.";
    const friendlyMessage = message.includes("Failed to fetch")
      ? "Request was rejected by the server. Please shorten your message and try again."
      : message;

    onError?.(friendlyMessage);
  }
}

export default api;