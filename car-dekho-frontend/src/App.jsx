import { useState, useRef, useEffect } from "react";
import {
  Search, Gauge, Fuel, Shield, ChevronRight,
  RotateCcw, Car, Zap, X
} from "lucide-react";

const API_URL = "http://localhost:5000/api/chat";

const SUGGESTIONS = [
  "Best SUV under ₹15 lakhs for a family",
  "Fuel-efficient car for daily city commute",
  "Safe hatchback under ₹7 lakhs",
  "Hybrid car with the best mileage",
];

function formatPrice(p) {
  if (p >= 100000) return `₹${(p / 100000).toFixed(2)} Lakh`;
  return `₹${(p / 1000).toFixed(0),000}`;
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
      {[1,2,3,4,5].map((s) => (
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
    <div className={`fade-in stagger-${Math.min(index + 1, 3)} bg-white border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer`}>
      {/* Top color strip by body type */}
      <div className="h-1" style={{ background: car.bodyType === "SUV" ? "#E8102A" : car.bodyType === "Sedan" ? "#1d4ed8" : "#15803d" }} />

      <div className="p-4">
        {/* Brand + Name */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <span className="text-[11px] text-[var(--muted)] font-medium uppercase tracking-wide">{car.brand}</span>
            <h3 className="text-[15px] font-semibold text-[var(--text)] leading-snug">{car.name}</h3>
          </div>
          <span
            className="text-[11px] font-medium px-2 py-0.5 rounded-full mt-0.5"
            style={{ background: fc.bg, color: fc.text }}
          >
            {car.fuelType}
          </span>
        </div>

        {/* Description */}
        <p className="text-[12.5px] text-[var(--muted)] leading-relaxed mb-3 line-clamp-2">{car.description}</p>

        {/* Stats row */}
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

        {/* Price */}
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
      {/* AI label */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-7 h-7 rounded-full bg-[var(--red-light)] flex items-center justify-center">
          <Zap size={13} className="text-[var(--red)]" />
        </div>
        <span className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">AI Recommendation</span>
      </div>

      {/* Recommendation text */}
      {msg.recommendation && (
        <div className="bg-white border border-[var(--border)] rounded-xl px-4 py-3 mb-3 text-[13px] text-[var(--text)] leading-relaxed">
          {msg.recommendation}
        </div>
      )}

      {/* Cars */}
      {msg.cars && msg.cars.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">
            {msg.cars.length} Matching Cars
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {msg.cars.map((car, i) => (
              <CarCard key={i} car={car} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (query) => {
    const q = (query || input).trim();
    if (!q || loading) return;
    setStarted(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", recommendation: data.recommendation, cars: data.cars },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", recommendation: "Could not connect to server. Please make sure the backend is running on port 5000.", cars: [] },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const reset = () => { setMessages([]); setStarted(false); setInput(""); };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>

      {/* Header — CarDekho style */}
      <header className="flex-none bg-white border-b border-[var(--border)] px-5 py-0 flex items-center justify-between h-14 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          {/* Logo lockup */}
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-md bg-[var(--red)] flex items-center justify-center">
              <Car size={16} className="text-white" />
            </div>
            <div className="leading-none">
              <span className="font-bold text-[15px] text-[var(--text)] tracking-tight">car</span>
              <span className="font-bold text-[15px] text-[var(--red)] tracking-tight">wise</span>
            </div>
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
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {!started ? (
          /* Landing */
          <div className="flex-1 flex flex-col items-center justify-center px-5 pb-16">
            {/* Hero */}
            <div className="text-center mb-8 max-w-lg">
              <p className="text-[11px] font-semibold text-[var(--red)] uppercase tracking-widest mb-3">AI-Powered Search</p>
              <h2 className="text-[28px] font-bold text-[var(--text)] leading-tight mb-2">
                Find the right car for you
              </h2>
              <p className="text-[13px] text-[var(--muted)] leading-relaxed">
                Tell us your budget, use case, or preferences and our AI will recommend the best cars from our database.
              </p>
            </div>

            {/* Search bar (hero) */}
            <div className="w-full max-w-xl mb-5">
              <div className="flex items-center bg-white border-2 border-[var(--red)] rounded-xl overflow-hidden shadow-sm">
                <Search size={17} className="ml-4 text-[var(--muted)] flex-none" />
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="E.g. best SUV under ₹15 lakhs for family use"
                  className="flex-1 px-3 py-3.5 text-[13px] text-[var(--text)] outline-none placeholder-[var(--muted)] bg-transparent"
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  className="m-1.5 px-5 py-2 bg-[var(--red)] hover:bg-[var(--red-hover)] disabled:opacity-40 text-white text-[13px] font-semibold rounded-lg transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Quick suggestions */}
            <div className="w-full max-w-xl">
              <p className="text-[11px] text-[var(--muted)] font-medium mb-2">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s)}
                    className="text-[12px] text-[var(--text)] border border-[var(--border)] bg-white hover:border-[var(--red)] hover:text-[var(--red)] rounded-full px-3.5 py-1.5 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Chat thread */
          <div className="flex-1 overflow-y-auto px-4 pt-5">
            <div className="max-w-3xl mx-auto">
              {messages.map((msg, i) => <Message key={i} msg={msg} />)}
              {loading && <ThinkingIndicator />}
              <div ref={bottomRef} className="h-4" />
            </div>
          </div>
        )}

        {/* Bottom input (only when chat started) */}
        {started && (
          <div className="flex-none bg-white border-t border-[var(--border)] px-4 py-3">
            <div className="max-w-3xl mx-auto flex items-center gap-2">
              <div className="flex-1 flex items-center bg-[var(--surface-2)] border border-[var(--border)] rounded-xl overflow-hidden focus-within:border-[var(--red)] transition-colors">
                <Search size={14} className="ml-3 text-[var(--muted)] flex-none" />
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask a follow-up…"
                  className="flex-1 px-2.5 py-2.5 text-[13px] text-[var(--text)] outline-none placeholder-[var(--muted)] bg-transparent"
                />
                {input && (
                  <button onClick={() => setInput("")} className="mr-2 text-[var(--muted)] hover:text-[var(--text)]">
                    <X size={13} />
                  </button>
                )}
              </div>
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="px-4 py-2.5 bg-[var(--red)] hover:bg-[var(--red-hover)] disabled:opacity-40 text-white text-[13px] font-semibold rounded-xl transition-colors whitespace-nowrap"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
