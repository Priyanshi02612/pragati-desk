import { Menu } from "lucide-react";
import { NotificationBell } from "../dashboard/NotificationBell";

export const Topbar = ({ onMenuToggle }) => (
  <header className="mb-6 flex items-center justify-between gap-4">
    <div>
      <p className="text-sm font-medium uppercase tracking-[0.28em] text-brand-muted">
        Productivity Command Center
      </p>
      <h1 className="mt-2 text-3xl font-bold text-brand-text">PragatiDesk</h1>
    </div>

    <div className="flex items-center gap-3">
      <button
        className="rounded-2xl border border-white/70 bg-white/90 p-3 shadow-sm lg:hidden"
        onClick={onMenuToggle}
        type="button"
        aria-label="Toggle sidebar"
      >
        <Menu size={18} />
      </button>
      <NotificationBell />
    </div>
  </header>
);
