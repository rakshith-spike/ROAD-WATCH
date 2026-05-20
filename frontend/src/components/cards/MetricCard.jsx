import { motion } from "framer-motion";

export function MetricCard({ label, value, helper, tone = "default", icon: Icon }) {
  const toneMap = {
    default: "from-slate-50 to-slate-100 dark:from-white/5 dark:to-white/10",
    success: "from-emerald-50 to-mint-300/40 dark:from-emerald-900/20 dark:to-mint-500/20",
    warning: "from-amber-50 to-amberx-400/30 dark:from-amber-950/20 dark:to-amber-700/20",
    danger: "from-rose-50 to-coral-400/30 dark:from-rose-950/20 dark:to-coral-500/20",
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-panel bg-gradient-to-br ${toneMap[tone] || toneMap.default}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
          {helper ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{helper}</p> : null}
        </div>
        {Icon ? (
          <div className="rounded-xl bg-white/70 p-2 dark:bg-white/10">
            <Icon className="h-5 w-5 text-slate-700 dark:text-slate-100" />
          </div>
        ) : null}
      </div>
    </motion.article>
  );
}
