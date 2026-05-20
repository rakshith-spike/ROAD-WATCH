import { AlertTriangle, IndianRupee, MapPinned, TrendingUp } from "lucide-react";

import { MetricCard } from "../components/cards/MetricCard";
import { EmptyState } from "../components/feedback/EmptyState";
import { PageTransition } from "../components/common/PageTransition";
import { SectionHeading } from "../components/common/SectionHeading";
import { usePlatform } from "../providers/PlatformProvider";

export default function DashboardPage() {
  const { summary, topRiskRoads, riskCards } = usePlatform();

  return (
    <PageTransition>
      <div className="space-y-6 pb-8">
        <SectionHeading
          eyebrow="Command Center"
          title="City Road Performance Dashboard"
          description="Unified monitoring for quality, budgets, complaints, and AI-prioritized maintenance action."
        />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Roads Monitored" value={summary?.roads_monitored ?? "--"} icon={MapPinned} />
          <MetricCard label="Average Quality" value={summary ? `${summary.avg_quality_score}/100` : "--"} tone="success" icon={TrendingUp} />
          <MetricCard label="Active Complaints" value={summary?.active_complaints ?? "--"} tone="danger" icon={AlertTriangle} />
          <MetricCard label="Budget Tracked" value={summary ? `Rs ${summary.sanctioned_budget_crore} Cr` : "--"} tone="warning" icon={IndianRupee} />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="glass-panel">
            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">AI Priority Roads</h3>
            <div className="mt-4 space-y-3">
              {topRiskRoads.map((road) => (
                <div key={road.id} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-slate-900 dark:text-white">{road.name}, {road.section}</p>
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{road.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Score {road.quality_score}/100 | Complaints {road.complaints}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="glass-panel">
            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Predictive Trend Cards</h3>
            {riskCards.length === 0 ? (
              <div className="mt-4">
                <EmptyState title="Risk feed unavailable" description="Risk cards appear when analytics service is online." />
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {riskCards.map((item) => (
                  <div key={item.road_id} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                    <p className="font-semibold text-slate-900 dark:text-white">{item.road_name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Risk {item.risk_score} ({item.risk_level})</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.predictive_note}</p>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>
      </div>
    </PageTransition>
  );
}
