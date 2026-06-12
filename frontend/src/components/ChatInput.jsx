export default function ChatInput({ inputRef, value, onChange, onSend, loading }) {
  return (
    <div className="border-t border-[var(--border)] bg-white p-4">
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder="Ask anything about cars..."
          className="flex-1 border border-[var(--border)] rounded-xl px-4 py-3 text-[13px] outline-none"
        />

        <button
          onClick={() => onSend()}
          disabled={!value.trim() || loading}
          className="px-5 py-3 bg-[var(--red)] hover:bg-[var(--red-hover)] text-white rounded-xl text-[13px] font-semibold disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>
    </div>
  );
}
