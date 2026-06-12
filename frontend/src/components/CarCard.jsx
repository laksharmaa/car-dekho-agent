import { Gauge, Shield, ChevronRight, Car, Check } from "lucide-react";
import StarRating from "./StarRating";
import { formatPrice, fuelColor } from "../utils/carHelpers";

export default function CarCard({ car, index, selected, onToggleCompare, disabled }) {
  const fc = fuelColor(car.fuelType);

  return (
    <div
      className={`fade-in stagger-${Math.min(index + 1, 3)} bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200 ${
        selected ? "border-[var(--red)] ring-1 ring-[var(--red)]" : "border-[var(--border)]"
      }`}
    >
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
          <div className="flex items-center gap-3">
            <button className="text-[12px] font-semibold text-[var(--red)] hover:underline flex items-center gap-0.5">
              View Details <ChevronRight size={13} />
            </button>
            <button
              onClick={() => onToggleCompare(car)}
              disabled={disabled}
              title={disabled ? "You can compare up to 2 cars at a time" : "Compare this car"}
              className={`flex items-center gap-1.5 text-[12px] font-semibold rounded-lg px-2.5 py-1.5 border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                selected
                  ? "bg-[var(--red)] border-[var(--red)] text-white"
                  : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--text)]"
              }`}
            >
              <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
                selected ? "bg-white border-white" : "border-[var(--muted)]"
              }`}>
                {selected && <Check size={10} className="text-[var(--red)]" strokeWidth={3} />}
              </span>
              Compare
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
