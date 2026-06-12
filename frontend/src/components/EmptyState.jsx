import { SUGGESTIONS } from "../constants/suggestions";

export default function EmptyState({ onSuggestionClick }) {
  return (
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
            onClick={() => onSuggestionClick(s)}
            className="text-[11px] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)] rounded-lg px-3 py-1.5 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
