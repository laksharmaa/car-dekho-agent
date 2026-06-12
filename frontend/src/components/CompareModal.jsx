import { X, Trophy } from "lucide-react";
import StarRating from "./StarRating";
import { formatPrice, fuelColor } from "../utils/carHelpers";

// Rows config: label + accessor + optional "betterIs" to highlight the winning cell
// betterIs: "higher" | "lower" | null (no winner highlight)
const ROWS = [
  { label: "Price", betterIs: "lower", render: (c) => formatPrice(c.price) },
  { label: "Mileage", betterIs: "higher", render: (c) => `${c.mileage} km/l` },
  { label: "Safety Rating", betterIs: "higher", render: (c) => <StarRating rating={c.safetyRating} /> },
  { label: "Body Type", betterIs: null, render: (c) => c.bodyType },
  {
    label: "Fuel Type",
    betterIs: null,
    render: (c) => {
      const fc = fuelColor(c.fuelType);
      return (
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: fc.bg, color: fc.text }}>
          {c.fuelType}
        </span>
      );
    },
  },
  { label: "Description", betterIs: null, render: (c) => c.description },
];

function rawValue(car, label) {
  switch (label) {
    case "Price": return car.price;
    case "Mileage": return car.mileage;
    case "Safety Rating": return car.safetyRating;
    default: return null;
  }
}

function winningIndex(carA, carB, row) {
  if (!row.betterIs) return -1;
  const a = rawValue(carA, row.label);
  const b = rawValue(carB, row.label);
  if (a === b) return -1;
  if (row.betterIs === "higher") return a > b ? 0 : 1;
  return a < b ? 0 : 1;
}

export default function CompareModal({ cars, onClose, onRemove }) {
  const [carA, carB] = cars;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="text-[15px] font-bold text-[var(--text)]">Compare Cars</h2>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wide px-4 py-3 w-1/4">
                  Spec
                </th>
                {cars.map((car) => (
                  <th key={carKeyFallback(car)} className="text-left px-4 py-3 align-top">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[10.5px] text-[var(--muted)] font-medium uppercase tracking-wide">{car.brand}</p>
                        <p className="text-[14px] font-bold text-[var(--text)] leading-snug">{car.name}</p>
                      </div>
                      {onRemove && (
                        <button
                          onClick={() => onRemove(car)}
                          title="Remove from comparison"
                          className="text-[var(--muted)] hover:text-[var(--red)] transition-colors mt-0.5"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => {
                const winner = carB ? winningIndex(carA, carB, row) : -1;
                return (
                  <tr key={row.label} className="border-b border-[var(--border)] last:border-b-0">
                    <td className="px-4 py-3 text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wide align-top">
                      {row.label}
                    </td>
                    {cars.map((car, i) => (
                      <td
                        key={i}
                        className={`px-4 py-3 align-top text-[var(--text)] ${
                          winner === i ? "bg-[var(--red-light)]" : ""
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          {row.render(car)}
                          {winner === i && <Trophy size={12} className="text-[var(--red)]" />}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border)] text-right">
          <button
            onClick={onClose}
            className="text-[12px] font-semibold text-white bg-[var(--red)] hover:bg-[var(--red-hover)] rounded-lg px-4 py-2 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function carKeyFallback(car) {
  return car.name || `${car.brand}-${car.price}`;
}
