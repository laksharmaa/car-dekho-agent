import { Car, LogIn } from "lucide-react";

export default function LoginScreen({ onLogin }) {
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
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-2 bg-[var(--red)] hover:bg-[var(--red-hover)] text-white text-[13px] font-semibold py-2.5 rounded-xl transition-colors"
        >
          <LogIn size={15} />
          Sign in to continue
        </button>
      </div>
    </div>
  );
}
