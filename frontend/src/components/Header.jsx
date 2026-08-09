import { RotateCcw, Car, LogOut, User } from "lucide-react";

export default function Header({ started, onReset, user, onLogout }) {
  return (
    <header className="flex-none bg-white border-b border-[var(--border)] px-5 flex items-center justify-between h-14 sticky top-0 z-10">
      <div className="flex items-center gap-1.5">
        <div className="w-8 h-8 rounded-md bg-[var(--red)] flex items-center justify-center">
          <Car size={16} className="text-white" />
        </div>
        <div className="leading-none">
          <span className="font-bold text-[15px] text-[var(--text)] tracking-tight">car</span>
          <span className="font-bold text-[15px] text-[var(--red)] tracking-tight">agent</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {started && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-[12px] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)] rounded-lg px-3 py-1.5 transition-colors"
          >
            <RotateCcw size={12} />
            New Search
          </button>
        )}
        <div className="flex items-center gap-2 border-l border-[var(--border)] pl-3">
          <div className="flex items-center gap-1.5">
            {user?.picture ? (
              <img src={user.picture} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[var(--red-light)] flex items-center justify-center">
                <User size={13} className="text-[var(--red)]" />
              </div>
            )}
            <span className="text-[12px] text-[var(--muted)] hidden sm:block max-w-[120px] truncate">
              {user?.name || user?.email}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="text-[var(--muted)] hover:text-[var(--red)] transition-colors"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
