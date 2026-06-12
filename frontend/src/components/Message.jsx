import { Zap } from "lucide-react";
import CarCard from "./CarCard";
import { carKey } from "../utils/carHelpers";

export default function Message({ msg, selectedCars, onToggleCompare }) {
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
            {msg.cars.map((car, i) => {
              const key = carKey(car);
              const selected = selectedCars.some((c) => carKey(c) === key);
              const disabled = !selected && selectedCars.length >= 2;
              return (
                <CarCard
                  key={i}
                  car={car}
                  index={i}
                  selected={selected}
                  disabled={disabled}
                  onToggleCompare={onToggleCompare}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
