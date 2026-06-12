import { X, GitCompareArrows } from "lucide-react";
import { carKey } from "../utils/carHelpers";

export default function CompareBar({ selectedCars, onRemove, onOpenCompare, onClear }) {
  if (selectedCars.length === 0) return null;

  return (
    <div className="border-t border-[var(--border)] bg-white px-4 pt-3">
      <div className="max-w-4xl mx-auto flex items-center gap-3 flex-wrap pb-1">
        <span className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wide">
          Compare ({selectedCars.length}/2)
        </span>

        {selectedCars.map((car) => (
          <div
            key={carKey(car)}
            className="flex items-center gap-1.5 bg-[var(--red-light)] text-[var(--text)] text-[12px] font-medium pl-3 pr-1.5 py-1 rounded-full border border-[var(--red-light)]"
          >
            {car.name}
            <button
              onClick={() => onRemove(car)}
              className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/60 text-[var(--muted)] hover:text-[var(--text)]"
              title="Remove from comparison"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        <div className="ml-auto flex items-center gap-2">
          {selectedCars.length > 0 && (
            <button
              onClick={onClear}
              className="text-[12px] text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={onOpenCompare}
            disabled={selectedCars.length !== 2}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-[var(--red)] hover:bg-[var(--red-hover)] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg px-3 py-1.5 transition-colors"
          >
            <GitCompareArrows size={13} />
            Compare Now
          </button>
        </div>
      </div>
    </div>
  );
}
