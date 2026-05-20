import { ArrowRight, Bot, MapPinned, ShieldCheck, Siren } from "lucide-react";
import { Link } from "react-router-dom";

import { MetricCard } from "../components/cards/MetricCard";
import { PageTransition } from "../components/common/PageTransition";
import { SectionHeading } from "../components/common/SectionHeading";
import { isAdminRole, normalizeRole } from "../lib/roles";
import { useAuth } from "../providers/AuthProvider";
import { usePlatform } from "../providers/PlatformProvider";

export default function HomePage() {
  const { user } = useAuth();
  const { summary } = usePlatform();
  const role = normalizeRole(user?.role);
  const adminMode = isAdminRole(role);

  return (
    <PageTransition>
      <div className="space-y-6 pb-8">
        <SectionHeading
          eyebrow="RoadWatch 2.0"
          title="AI-powered Road Intelligence and Public Safety Platform"
          description="Built for citizens, contractors, and government agencies to monitor road quality, budgets, and accountability with real-time geospatial intelligence."
          action={
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white dark:bg-mint-600 dark:text-slate-950"
            >
              Open Command Center
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="glass-panel">
            <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Smart City Demo Narrative</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              RoadWatch supports citizen reporting, contractor accountability, predictive risk scoring, emergency response, and governance-grade transparency.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link to="/map" className="rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
                <MapPinned className="mb-2 h-5 w-5" />
                Smart GIS Map
              </Link>
              <Link to="/complaints" className="rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
                <Siren className="mb-2 h-5 w-5" />
                Citizen Complaints
              </Link>
              <Link to="/assistant" className="rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
                <Bot className="mb-2 h-5 w-5" />
                AI Civic Assistant
              </Link>
              <Link to="/admin" className="rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
                <ShieldCheck className="mb-2 h-5 w-5" />
                Governance View
              </Link>
            </div>
          </article>

          <article className="glass-panel">
            <h4 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Road Health Snapshot</h4>
            <div className="mt-4 space-y-3">
              <MetricCard label="Roads Monitored" value={summary?.roads_monitored ?? "--"} />
              <MetricCard label="Avg Quality" value={summary ? `${summary.avg_quality_score}/100` : "--"} tone="success" />
              <MetricCard label="Active Complaints" value={summary?.active_complaints ?? "--"} tone="danger" />
            </div>
          </article>
        </section>

        <section className="glass-panel">
          <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Role-Specific Capabilities</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Signed in as <span className="font-semibold text-slate-900 dark:text-white">{role}</span>. Your workspace is tailored for this role.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <article className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
              <p className="font-semibold text-slate-900 dark:text-white">Citizen & Contractor Scope</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">File complaints, monitor alerts, use map intelligence, and track analytics trends.</p>
            </article>
            <article className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 dark:border-emerald-600/40 dark:bg-emerald-950/20">
              <p className="font-semibold text-slate-900 dark:text-white">Admin-Only Scope</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {adminMode
                  ? "Enabled: emergency alert broadcast, budget anomaly governance, and road quality override tools."
                  : "Requires government_admin or super_admin access."}
              </p>
            </article>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
