export default function Spinner() {
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
