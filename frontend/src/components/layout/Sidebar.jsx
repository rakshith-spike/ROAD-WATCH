import { AlertTriangle, Bot, Building2, ChartNoAxesCombined, ClipboardList, Gauge, Home, MapPinned, ShieldCheck } from "lucide-react";
import { NavLink } from "react-router-dom";

import { hasAnyRole, isAdminRole, normalizeRole } from "../../lib/roles";
import { useAuth } from "../../providers/AuthProvider";

const NAV_ITEMS = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/map", label: "Map Intelligence", icon: MapPinned },
  { to: "/analytics", label: "Analytics", icon: ChartNoAxesCombined },
  { to: "/assistant", label: "AI Assistant", icon: Bot },
  { to: "/complaints", label: "Complaints", icon: ClipboardList },
  { to: "/contractors", label: "Contractors", icon: Building2, roles: ["contractor", "government_admin", "super_admin"] },
  { to: "/alerts", label: "Alerts", icon: AlertTriangle },
  { to: "/admin", label: "Admin Console", icon: ShieldCheck, roles: ["government_admin", "super_admin"] },
];

export function Sidebar() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const navItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return hasAnyRole(role, item.roles);
  });

  return (
    <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-slate-200/80 bg-white/70 p-5 backdrop-blur xl:flex dark:border-white/10 dark:bg-slate-950/60">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-ink-700 to-mint-600 text-base font-bold text-white">RW</div>
        <div>
          <p className="font-display text-xl font-bold text-slate-900 dark:text-white">RoadWatch</p>
          <p className="text-xs text-slate-500 dark:text-slate-300">City Intelligence Command</p>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-900 dark:text-emerald-200">
        <p className="font-semibold">{isAdminRole(role) ? "Admin Operations Mode" : "Citizen Operations Mode"}</p>
        <p className="mt-1">
          {isAdminRole(role)
            ? "You can broadcast alerts, run governance checks, and manage road quality updates."
            : "You can report issues, track response progress, and monitor live city intelligence."}
        </p>
      </div>
    </aside>
  );
}
