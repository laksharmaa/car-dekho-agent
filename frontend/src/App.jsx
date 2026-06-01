import { useState, useRef, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Search, Gauge, Shield, ChevronRight,
  RotateCcw, Car, Zap, X, LogOut, LogIn, User
} from "lucide-react";
import api, { setAuthToken } from "./api/api";

const SUGGESTIONS = [
  "Best SUV under ₹15 lakhs for a family",
  "Fuel-efficient car for daily city commute",
  "Safe hatchback under ₹7 lakhs",
  "Hybrid car with the best mileage",
];

function formatPrice(p) {
  if (p >= 100000) return `₹${(p / 100000).toFixed(2)} Lakh`;
  return `₹${(p / 1000).toFixed(0)}K`;
}

function fuelColor(type) {
  const map = {
    Petrol: { bg: "#fff7ed", text: "#c2410c" },
    Diesel: { bg: "#eff6ff", text: "#1d4ed8" },
    Electric: { bg: "#f0fdf4", text: "#15803d" },
    Hybrid: { bg: "#faf5ff", text: "#7c3aed" },
    CNG: { bg: "#ecfeff", text: "#0e7490" },
  };
  return map[type] || { bg: "#f9fafb", text: "#374151" };
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M6 1l1.236 2.507L10 3.927l-2 1.949.472 2.752L6 7.25l-2.472 1.378L4 5.876 2 3.927l2.764-.42L6 1z"
            fill={s <= rating ? "#f59e0b" : "#e5e7eb"}
          />
        </svg>
      ))}
    </div>
  );
}

function CarCard({ car, index }) {
  const fc = fuelColor(car.fuelType);
  return (
    <div className={`fade-in stagger-${Math.min(index + 1, 3)} bg-white border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200`}>
      <div className="h-1" style={{ background: car.bodyType === "SUV" ? "#E8102A" : car.bodyType === "Sedan" ? "#1d4ed8" : "#15803d" }} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <div>
            <span className="text-[11px] text-[var(--muted)] font-medium uppercase tracking-wide">{car.brand}</span>
            <h3 className="text-[15px] font-semibold text-[var(--text)] leading-snug">{car.name}</h3>
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full mt-0.5" style={{ background: fc.bg, color: fc.text }}>
            {car.fuelType}
          </span>
        </div>
        <p className="text-[12.5px] text-[var(--muted)] leading-relaxed mb-3 line-clamp-2">{car.description}</p>
        <div className="flex items-center gap-4 mb-3 pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-1.5">
            <Gauge size={13} className="text-[var(--muted)]" />
            <span className="text-[12px] text-[var(--muted)]">{car.mileage} km/l</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield size={13} className="text-[var(--muted)]" />
            <StarRating rating={car.safetyRating} />
          </div>
          <div className="flex items-center gap-1.5">
            <Car size={13} className="text-[var(--muted)]" />
            <span className="text-[12px] text-[var(--muted)]">{car.bodyType}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[var(--muted)]">Ex-showroom price</p>
            <p className="text-[16px] font-bold text-[var(--text)]">{formatPrice(car.price)}</p>
          </div>
          <button className="text-[12px] font-semibold text-[var(--red)] hover:underline flex items-center gap-0.5">
            View Details <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2.5 py-2">
      <div className="w-7 h-7 rounded-full bg-[var(--red-light)] flex items-center justify-center">
        <Zap size={13} className="text-[var(--red)]" />
      </div>
      <div className="flex items-center gap-1">
        <div className="dot-1 w-2 h-2 rounded-full bg-[var(--red)]" />
        <div className="dot-2 w-2 h-2 rounded-full bg-[var(--red)]" />
        <div className="dot-3 w-2 h-2 rounded-full bg-[var(--red)]" />
        <span className="text-[12px] text-[var(--muted)] ml-2">Finding best matches…</span>
      </div>
    </div>
  );
}

function Message({ msg }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end mb-5 fade-in">
        <div className="max-w-[72%] bg-[var(--red)] text-white text-[13px] leading-relaxed rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm">
          {msg.content}
        </div>
      </div>
    );
  }
  return (
    <div className="mb-6 fade-in">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-7 h-7 rounded-full bg-[var(--red-light)] flex items-center justify-center">
          <Zap size={13} className="text-[var(--red)]" />
        </div>
        <span className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">AI Recommendation</span>
      </div>
      {msg.recommendation && (
        <div className="bg-white border border-[var(--border)] rounded-xl px-4 py-3 mb-3 text-[13px] text-[var(--text)] leading-relaxed">
          {msg.recommendation}
        </div>
      )}
      {msg.cars && msg.cars.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">
            {msg.cars.length} Matching Cars
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {msg.cars.map((car, i) => <CarCard key={i} car={car} index={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Loading spinner ────────────────────────────────────────
function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="flex items-center gap-1.5">
        <div className="dot-1 w-2 h-2 rounded-full bg-[var(--red)]" />
        <div className="dot-2 w-2 h-2 rounded-full bg-[var(--red)]" />
        <div className="dot-3 w-2 h-2 rounded-full bg-[var(--red)]" />
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────
export default function App() {
  const {
    isLoading,
    isAuthenticated,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Once authenticated, set token + load session
  useEffect(() => {
    if (!isAuthenticated) return;

    const init = async () => {
      setSessionLoading(true);
      try {
        const token = await getAccessTokenSilently();
        setAuthToken(token);

        const { data } = await api.get("/session");
        if (data.messages && data.messages.length > 0) {
          const uiMessages = data.messages.map((m) =>
            m.role === "user"
              ? { role: "user", content: m.content }
              : { role: "assistant", recommendation: m.content, cars: m.cars || [] }
          );
          setMessages(uiMessages);
          setStarted(true);
        }
      } catch (err) {
        // No session yet or network error — start fresh silently
        console.error("Session load error:", err);
      } finally {
        setSessionLoading(false);
      }
    };

    init();
  }, [isAuthenticated, getAccessTokenSilently]);

  // Auth0 SDK still initializing
  if (isLoading) return <Spinner />;

  // Not logged in — show login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5" style={{ background: "var(--bg)" }}>
        <div className="bg-white border border-[var(--border)] rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[var(--red)] flex items-center justify-center mx-auto mb-4">
            <Car size={22} className="text-white" />
          </div>
          <h1 className="text-[20px] font-bold text-[var(--text)] mb-1">
            car<span className="text-[var(--red)]">wise</span>
          </h1>
          <p className="text-[13px] text-[var(--muted)] mb-6 leading-relaxed">
            Sign in to get personalised AI car recommendations and save your search history.
          </p>
          <button
            onClick={() => loginWithRedirect()}
            className="w-full flex items-center justify-center gap-2 bg-[var(--red)] hover:bg-[var(--red-hover)] text-white text-[13px] font-semibold py-2.5 rounded-xl transition-colors"
          >
            <LogIn size={15} />
            Sign in to continue
          </button>
        </div>
      </div>
    );
  }

  // Loading saved session
  if (sessionLoading) return <Spinner />;

  const send = async (query) => {
    const q = (query || input).trim();
    if (!q || loading) return;

    try {
      const token = await getAccessTokenSilently();
      setAuthToken(token);
    } catch (err) {
      console.error("Token refresh failed:", err);
    }

    setStarted(true);
    setInput("");

    const updatedMessages = [...messages, { role: "user", content: q }];
    setMessages(updatedMessages);
    setLoading(true);

    // Build history in the format backend expects — exclude the message we just added
    const history = messages.map((m) => ({
      role: m.role,
      content: m.role === "assistant" ? m.recommendation : m.content,
    }));

    try {
      const { data } = await api.post("/chat", { query: q, history });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", recommendation: data.recommendation, cars: data.cars },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", recommendation: "Could not connect to server. Please try again.", cars: [] },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const reset = async () => {
    try {
      await api.delete("/session");
    } catch (err) {
      console.error("Clear session error:", err);
    }
    setMessages([]);
    setStarted(false);
    setInput("");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>

      {/* Header */}
      <header className="flex-none bg-white border-b border-[var(--border)] px-5 flex items-center justify-between h-14 sticky top-0 z-10">
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-md bg-[var(--red)] flex items-center justify-center">
            <Car size={16} className="text-white" />
          </div>
          <div className="leading-none">
            <span className="font-bold text-[15px] text-[var(--text)] tracking-tight">car</span>
            <span className="font-bold text-[15px] text-[var(--red)] tracking-tight">wise</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {started && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-[12px] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)] rounded-lg px-3 py-1.5 transition-colors"
            >
              <RotateCcw size={12} />
              New Search
            </button>
          )}
          <div className="flex items-center gap-2 border-l border-[var(--border)] pl-3">
            <div className="flex items-center gap-1.5">
              {user?.picture ? (
                <img src={user.picture} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[var(--red-light)] flex items-center justify-center">
                  <User size={13} className="text-[var(--red)]" />
                </div>
              )}
              <span className="text-[12px] text-[var(--muted)] hidden sm:block max-w-[120px] truncate">
                {user?.name || user?.email}
              </span>
            </div>
            <button
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              className="text-[var(--muted)] hover:text-[var(--red)] transition-colors"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {!started && (
          <div className="flex-1 flex flex-col items-center justify-center px-5">
            <div className="text-center mb-8 max-w-lg">
              <p className="text-[11px] font-semibold text-[var(--red)] uppercase tracking-widest mb-3">
                AI-Powered Search
              </p>

              <h2 className="text-[28px] font-bold text-[var(--text)] leading-tight mb-2">
                Find the right car for you
              </h2>

              <p className="text-[13px] text-[var(--muted)] leading-relaxed">
                Tell us your budget, use case, or preferences and our AI will recommend the best cars.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 max-w-4xl">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => send(s)}
                  className="text-[11px] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)] rounded-lg px-3 py-1.5 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {started && (
          <div className="flex-1 overflow-y-auto px-5 py-6">
            {messages.map((msg, i) => (
              <Message key={i} msg={msg} />
            ))}

            {loading && <ThinkingIndicator />}

            <div ref={bottomRef} />
          </div>
        )}

        {/* Persistent Chat Input */}
        <div className="border-t border-[var(--border)] bg-white p-4">
          <div className="max-w-4xl mx-auto flex items-center gap-3">

            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask anything about cars..."
              className="flex-1 border border-[var(--border)] rounded-xl px-4 py-3 text-[13px] outline-none"
            />

            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="px-5 py-3 bg-[var(--red)] hover:bg-[var(--red-hover)] text-white rounded-xl text-[13px] font-semibold disabled:opacity-50"
            >
              {loading ? "Thinking..." : "Send"}
            </button>

          </div>
        </div>

      </main>
    </div>
  );
}
