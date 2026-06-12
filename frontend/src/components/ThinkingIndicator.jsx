import { Zap } from "lucide-react";

export default function ThinkingIndicator() {
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
