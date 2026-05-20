import { useState } from "react";
import toast from "react-hot-toast";

import { PageTransition } from "../components/common/PageTransition";
import { SectionHeading } from "../components/common/SectionHeading";
import { usePlatform } from "../providers/PlatformProvider";
import { api } from "../services/api";

export default function AlertsPage() {
  const { alerts } = usePlatform();
  const [severity, setSeverity] = useState("all");

  const filtered = alerts.filter((item) => (severity === "all" ? true : item.severity === severity));

  async function triggerSos() {
    try {
      const result = await api.triggerSos();
      toast.success(result.message || "SOS triggered");
    } catch {
      toast.error("SOS endpoint is protected. Login as authorized role to trigger.");
    }
  }

  return (
    <PageTransition>
      <div className="space-y-5 pb-8">
        <SectionHeading
          eyebrow="City Alerts"
          title="Emergency Alerts and AI Prioritization Feed"
          description="Public safety stream for emergency response and incident awareness."
          action={
            <button type="button" onClick={triggerSos} className="rounded-xl bg-coral-500 px-4 py-2 text-sm font-semibold text-white">
              Emergency SOS
            </button>
          }
        />

        <div className="flex gap-2">
          {["all", "low", "medium", "high", "critical"].map((item) => (
            <button key={item} type="button" onClick={() => setSeverity(item)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${severity === item ? "bg-ink-900 text-white dark:bg-mint-600 dark:text-slate-950" : "bg-white/70 dark:bg-white/10"}`}>
              {item}
            </button>
          ))}
        </div>

        <section className="space-y-3">
          {filtered.map((alert) => (
            <article key={alert.id} className="glass-panel">
              <div className="flex items-center justify-between gap-3">
                <p className="font-display text-lg font-semibold text-slate-900 dark:text-white">{alert.title}</p>
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{alert.severity}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{alert.message}</p>
            </article>
          ))}
        </section>
      </div>
    </PageTransition>
  );
}
