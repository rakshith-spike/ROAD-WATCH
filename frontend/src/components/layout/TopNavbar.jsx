import { Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { normalizeRole } from "../../lib/roles";
import { useAuth } from "../../providers/AuthProvider";
import { useTheme } from "../../providers/ThemeProvider";

export function TopNavbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const displayRole = normalizeRole(user?.role);

  return (
    <header className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-white/40 bg-white/65 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">Smart City Platform</p>
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Road Intelligence & Public Safety</h2>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-100 dark:border-white/15 dark:bg-white/10 dark:text-slate-100"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        {user ? (
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-700 dark:text-slate-100">{user.full_name} ({displayRole})</p>
            <button
              type="button"
              onClick={() => navigate("/logout")}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 dark:border-white/15 dark:bg-white/10 dark:text-slate-100"
            >
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
