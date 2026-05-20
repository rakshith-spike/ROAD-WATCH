import { Building2, ShieldCheck, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { AuthCard } from "../features/auth/AuthCard";

const ROLE_CAPABILITIES = [
  {
    title: "Citizen",
    icon: UserRound,
    items: ["File complaints with voice notes", "Track issue status and assigned authority"],
  },
  {
    title: "Contractor",
    icon: Building2,
    items: ["Update road quality and work progress", "Monitor pending audits and risk score"],
  },
  {
    title: "Government Admin",
    icon: ShieldCheck,
    items: ["Trigger emergency alerts", "Run budget anomaly governance operations"],
  },
];

export default function AuthPage() {
  const navigate = useNavigate();

  function handleAuthSuccess() {
    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="app-background flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="glass-panel">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">RoadWatch Access</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">Sign in to City Intelligence Command</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Professional access portal with role-based operations for citizens, contractors, and administrators.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {ROLE_CAPABILITIES.map((capability) => {
              const Icon = capability.icon;
              return (
                <article key={capability.title} className="rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-slate-700 dark:text-slate-200" />
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{capability.title}</p>
                  </div>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{capability.items[0]}</p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{capability.items[1]}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section>
          <AuthCard defaultMode="login" onSuccess={handleAuthSuccess} />
        </section>
      </div>
    </div>
  );
}
