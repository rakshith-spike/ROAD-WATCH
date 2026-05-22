import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  Construction,
  Download,
  ExternalLink,
  FileText,
  Flag,
  Gauge,
  HardHat,
  IndianRupee,
  Layers,
  MapPin,
  MessageSquareWarning,
  Shield,
  ShieldAlert,
  Star,
  TrendingUp,
  Truck,
  User,
  Wifi,
  Wind,
  Zap,
} from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function trendFromRoad(road) {
  const base = road.citizenComplaints;
  return [
    { month: "Jan", v: Math.max(2, Math.round(base * 0.52)) },
    { month: "Feb", v: Math.max(2, Math.round(base * 0.63)) },
    { month: "Mar", v: Math.max(2, Math.round(base * 0.74)) },
    { month: "Apr", v: Math.max(2, Math.round(base * 0.82)) },
    { month: "May", v: Math.max(2, Math.round(base * 0.93)) },
    { month: "Jun", v: base },
  ];
}

const CONDITION_META = {
  good: { label: "Good", color: "#10b981", glow: "#10b98130", dot: "bg-emerald-400" },
  moderate: { label: "Moderate", color: "#f59e0b", glow: "#f59e0b30", dot: "bg-amber-400" },
  critical: { label: "Critical", color: "#ef4444", glow: "#ef444430", dot: "bg-red-500" },
  under_construction: { label: "Under Construction", color: "#f97316", glow: "#f9731630", dot: "bg-orange-400" },
};

function conditionMeta(road) {
  return CONDITION_META[road.roadCondition] || CONDITION_META.moderate;
}

function riskColor(score) {
  if (score >= 80) return { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30" };
  if (score >= 55) return { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" };
  return { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" };
}

function riskLabel(score) {
  if (score >= 80) return "Critical";
  if (score >= 55) return "Moderate";
  return "Low";
}

function ProgressBar({ value, max = 100, color = "#10b981", label, sublabel }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const barColor =
    pct >= 85 ? "#ef4444" : pct >= 60 ? "#f59e0b" : "#10b981";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">{label}</span>
        <span className="text-white font-bold tabular-nums">
          {sublabel || `${pct}%`}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${barColor})` }}
        />
      </div>
    </div>
  );
}

function MeterRing({ value, max = 100, label, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
          <motion.circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
          {value}
        </span>
      </div>
      <span className="text-[10px] text-slate-400 text-center leading-tight">{label}</span>
    </div>
  );
}

function StatusBadge({ condition }) {
  const meta = conditionMeta({ roadCondition: condition });
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border"
      style={{
        background: meta.glow,
        color: meta.color,
        borderColor: meta.color + "40",
      }}
    >
      <span className={`inline-block w-1.5 h-1.5 rounded-full animate-pulse ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function AIInsightCard({ road }) {
  const risk = road.predictedFailureRisk;
  const isHighRisk = risk >= 75;
  const isMedRisk = risk >= 50;

  const insight =
    isHighRisk
      ? `${road.roadName} shows repeated structural stress patterns despite ₹${road.sanctionedBudget} Cr allocation. Possible contractor quality deviation or material substitution detected.`
      : isMedRisk
      ? `Moderate wear trajectory detected. Monsoon preparedness score is below threshold. Preventive intervention recommended within 2–3 weeks.`
      : `Road health is stable. Routine monitoring cycle sufficient. No anomalies detected in budget or contractor compliance.`;

  return (
    <div
      className="relative overflow-hidden rounded-xl p-3.5 border"
      style={{
        background: isHighRisk
          ? "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))"
          : isMedRisk
          ? "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04))"
          : "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))",
        borderColor: isHighRisk ? "#ef444430" : isMedRisk ? "#f59e0b30" : "#10b98130",
      }}
    >
      <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
        <Brain className="w-full h-full" />
      </div>
      <div className="flex items-start gap-2.5">
        <div
          className="mt-0.5 rounded-lg p-1.5 shrink-0"
          style={{
            background: isHighRisk ? "#ef44441a" : isMedRisk ? "#f59e0b1a" : "#10b9811a",
          }}
        >
          <Brain
            className="w-4 h-4"
            style={{ color: isHighRisk ? "#ef4444" : isMedRisk ? "#f59e0b" : "#10b981" }}
          />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: isHighRisk ? "#f87171" : isMedRisk ? "#fcd34d" : "#6ee7b7" }}>
            AI Risk Assessment · {Math.round(road.aiConfidence * 100)}% confidence
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">{insight}</p>
          <p className="mt-1.5 text-[10px] text-slate-500">{road.recommendedAction}</p>
        </div>
      </div>
    </div>
  );
}

function TimelineSection({ road }) {
  const events = [
    { icon: FileText, label: "Tender Approved", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), done: true },
    { icon: Construction, label: "Construction Started", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), done: true },
    { icon: CheckCircle2, label: "Quality Inspection", date: road.lastInspectionDate, done: true },
    { icon: HardHat, label: "Last Repair / Patch", date: road.maintenanceHistory?.[0]?.date || "N/A", done: road.roadCondition !== "under_construction" },
    { icon: CalendarCheck, label: "Next Inspection", date: road.nextInspectionDate, done: false },
  ];

  return (
    <div className="space-y-2">
      {events.map((ev, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div
              className={`rounded-full p-1.5 ${ev.done ? "bg-emerald-500/20" : "bg-white/8"}`}
            >
              <ev.icon className={`w-3 h-3 ${ev.done ? "text-emerald-400" : "text-slate-500"}`} />
            </div>
            {i < events.length - 1 && (
              <div className={`w-px h-4 mt-0.5 ${ev.done ? "bg-emerald-500/30" : "bg-white/10"}`} />
            )}
          </div>
          <div className="pb-2">
            <p className={`text-xs font-semibold ${ev.done ? "text-slate-200" : "text-slate-500"}`}>{ev.label}</p>
            <p className="text-[10px] text-slate-500">{ev.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-start gap-2.5 py-1.5 border-b border-white/5 last:border-0">
      <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${accent || "text-slate-500"}`} />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-xs text-slate-200 font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function RoadDetailPanel({ road }) {
  const [activeTab, setActiveTab] = useState("overview");
  const trendData = trendFromRoad(road);
  const meta = conditionMeta(road);
  const riskC = riskColor(road.predictedFailureRisk);
  const budgetPct = Math.min(110, Math.round((road.utilizedBudget / road.sanctionedBudget) * 100));

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "analytics", label: "Analytics" },
    { id: "history", label: "Timeline" },
  ];

  const MATERIALS = ["Bituminous Concrete", "WBM Base", "GSB Layer", "Cement Grouting", "DBM Mix"];
  const materialsSeed = road.roadId?.charCodeAt(road.roadId.length - 1) || 0;
  const materials = MATERIALS.slice(0, 2 + (materialsSeed % 3));

  return (
    <motion.div
      key={road.roadId}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col h-full"
      style={{
        background: "linear-gradient(160deg, rgba(15,23,42,0.96) 0%, rgba(15,23,42,0.99) 100%)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: `1px solid ${meta.color}22`,
        boxShadow: `0 0 0 1px ${meta.color}15, 0 24px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)`,
        borderRadius: "1.25rem",
      }}
    >
      {/* Header Image */}
      <div className="relative h-36 rounded-t-[1.25rem] overflow-hidden shrink-0">
        <img
          src={road.roadImages[0]}
          alt={road.roadName}
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.6) saturate(0.8)" }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, transparent 30%, rgba(15,23,42,0.95) 100%)`,
          }}
        />
        {/* Glow border top */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${meta.color}60, transparent)` }}
        />

        {/* Header badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 bg-black/40 rounded-lg px-2 py-1 backdrop-blur-sm">
            {road.roadId}
          </span>
          <StatusBadge condition={road.roadCondition} />
        </div>

        {/* Road name at bottom of image */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-base font-bold text-white leading-tight drop-shadow-lg line-clamp-1">
            {road.roadName}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span className="text-[11px] text-slate-300">
              {road.ward} Ward · {road.zone} Zone
            </span>
          </div>
        </div>
      </div>

      {/* Quick score strip */}
      <div
        className="grid grid-cols-3 divide-x shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", divideColor: "rgba(255,255,255,0.06)" }}
      >
        {[
          { label: "Quality", value: road.qualityScore, suffix: "/100", color: road.qualityScore >= 70 ? "#10b981" : road.qualityScore >= 45 ? "#f59e0b" : "#ef4444" },
          { label: "AI Risk", value: road.predictedFailureRisk, suffix: "/100", color: road.predictedFailureRisk >= 70 ? "#ef4444" : road.predictedFailureRisk >= 45 ? "#f59e0b" : "#10b981" },
          { label: "Traffic", value: road.trafficDensity, suffix: "%", color: road.trafficDensity >= 75 ? "#ef4444" : road.trafficDensity >= 50 ? "#f59e0b" : "#10b981" },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center py-2.5 px-1">
            <span className="text-lg font-black tabular-nums leading-none" style={{ color: item.color }}>
              {item.value}
              <span className="text-[10px] font-semibold text-slate-500">{item.suffix}</span>
            </span>
            <span className="text-[9px] uppercase tracking-wider text-slate-500 mt-0.5 font-semibold">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div
        className="flex items-center gap-0.5 px-3 py-2 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative flex-1 rounded-lg py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-200"
            style={{
              color: activeTab === tab.id ? "#fff" : "rgba(148,163,184,0.7)",
              background: activeTab === tab.id ? `${meta.color}20` : "transparent",
            }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute inset-x-2 bottom-0.5 h-px rounded-full"
                style={{ background: meta.color }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content - scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scroll-smooth" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
              className="p-3.5 space-y-3.5"
            >
              {/* AI Insight */}
              <AIInsightCard road={road} />

              {/* Meters */}
              <div className="grid grid-cols-4 gap-2 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <MeterRing value={road.qualityScore} label="Quality" color="#10b981" />
                <MeterRing value={road.predictedFailureRisk} label="AI Risk" color={road.predictedFailureRisk >= 70 ? "#ef4444" : "#f59e0b"} />
                <MeterRing value={road.citizenSatisfactionScore || Math.max(10, 100 - road.severityScore)} label="Satisfaction" color="#3b82f6" />
                <MeterRing value={road.corruptionRiskScore} label="Corruption" color={road.corruptionRiskScore >= 70 ? "#ef4444" : "#f59e0b"} />
              </div>

              {/* Budget bars */}
              <div className="rounded-xl p-3.5 space-y-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Budget Transparency</span>
                </div>
                <ProgressBar value={budgetPct} max={100} color="#f59e0b" label="Budget Utilized" sublabel={`${budgetPct}% · ₹${road.utilizedBudget} Cr`} />
                <ProgressBar value={road.trafficDensity} color="#3b82f6" label="Traffic Density" sublabel={`${road.trafficDensity}%`} />
                <ProgressBar value={road.floodRisk} color="#8b5cf6" label="Flood Risk" sublabel={`${road.floodRisk}%`} />
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider">Sanctioned</p>
                    <p className="text-sm font-black text-white">₹{road.sanctionedBudget} Cr</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider">Last Tender</p>
                    <p className="text-sm font-black text-white">₹{road.lastTenderCost} Cr</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider">Repair Cost</p>
                    <p className="text-sm font-black text-amber-400">₹{road.repairCost} Cr</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider">Delay Days</p>
                    <p className={`text-sm font-black ${road.delayDays > 30 ? "text-red-400" : "text-slate-200"}`}>{road.delayDays}d</p>
                  </div>
                </div>
              </div>

              {/* Info grid */}
              <div className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contractor Accountability</span>
                </div>
                <InfoRow icon={HardHat} label="Contractor" value={road.contractorName} accent="text-blue-400" />
                <InfoRow icon={Building2} label="Company" value={road.contractorCompany} />
                <InfoRow icon={User} label="Site Engineer" value={road.projectEngineer} />
                <InfoRow icon={Star} label="Rating" value={`${road.contractorRating}/5 · ${road.previousProjects} projects`} accent="text-amber-400" />
                <InfoRow icon={ShieldAlert} label="Blacklisted Risk" value={road.blacklistedRisk?.toUpperCase()} accent={road.blacklistedRisk === "high" ? "text-red-400" : "text-slate-500"} />
                <InfoRow icon={Truck} label="Maintenance Agency" value={road.maintenanceAgency} />
              </div>

              {/* Road details */}
              <div className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Road Profile</span>
                </div>
                <InfoRow icon={AlertTriangle} label="Potholes" value={`${road.potholeCount} detected`} accent={road.potholeCount > 15 ? "text-red-400" : "text-amber-400"} />
                <InfoRow icon={Flag} label="Accidents" value={`${road.accidentCount} incidents`} accent={road.accidentCount > 6 ? "text-red-400" : "text-slate-500"} />
                <InfoRow icon={MessageSquareWarning} label="Citizen Complaints" value={`${road.citizenComplaints} total`} accent="text-orange-400" />
                <InfoRow icon={Wind} label="Air Quality Index" value={`${road.airQualityNearby} AQI`} />
                <InfoRow icon={Wifi} label="Drainage" value={road.drainageCondition?.toUpperCase()} accent={road.drainageCondition === "poor" ? "text-red-400" : "text-slate-400"} />
                <InfoRow icon={Layers} label="Road Importance" value={road.roadImportance?.toUpperCase()} accent="text-purple-400" />
                <div className="pt-2">
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1.5">Materials Used</p>
                  <div className="flex flex-wrap gap-1">
                    {materials.map((m) => (
                      <span key={m} className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(139,92,246,0.15)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.25)" }}>
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status badges row */}
              <div className="flex flex-wrap gap-1.5">
                {(() => {
                  const rc = riskColor(road.corruptionRiskScore);
                  return (
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${rc.bg} ${rc.text} ${rc.border}`}>
                      Corruption: {riskLabel(road.corruptionRiskScore)}
                    </span>
                  );
                })()}
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  road.maintenancePriority === "Emergency"
                    ? "bg-red-500/15 text-red-400 border-red-500/30"
                    : road.maintenancePriority === "High"
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                }`}>
                  Priority: {road.maintenancePriority}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-500/15 text-slate-400 border border-slate-500/30">
                  {road.roadImportance?.toUpperCase()} ROAD
                </span>
              </div>

              {/* Next inspection */}
              <div className="rounded-xl px-3.5 py-3 flex items-center gap-3" style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
                <CalendarCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">Next Scheduled Inspection</p>
                  <p className="text-xs font-bold text-blue-300">{road.nextInspectionDate}</p>
                </div>
                <span className="ml-auto text-[10px] text-slate-500">{road.lastInspectionDate}</span>
              </div>
            </motion.div>
          )}

          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="p-3.5 space-y-3.5"
            >
              {/* Complaint trend chart */}
              <div className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Complaint Trend (6 Months)</span>
                </div>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <defs>
                        <linearGradient id="trendGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="month"
                        tick={{ fill: "rgba(148,163,184,0.7)", fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(15,23,42,0.9)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                          color: "#e2e8f0",
                          fontSize: 11,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="v"
                        stroke="url(#trendGrad)"
                        strokeWidth={2}
                        dot={{ fill: "#ef4444", r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: "#f97316" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Score comparison */}
              <div className="rounded-xl p-3.5 space-y-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2 mb-0.5">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Multi-Metric Analysis</span>
                </div>
                <ProgressBar value={road.severityScore} color="#ef4444" label="Severity Score" />
                <ProgressBar value={road.qualityScore} color="#10b981" label="Quality Score" />
                <ProgressBar value={road.citizenSatisfactionScore || Math.max(10, 100 - road.severityScore)} color="#3b82f6" label="Citizen Satisfaction" />
                <ProgressBar value={road.corruptionRiskScore} color="#f59e0b" label="Corruption Risk" />
                <ProgressBar value={road.floodRisk} color="#8b5cf6" label="Flood Risk" />
                <ProgressBar value={road.trafficDensity} color="#06b6d4" label="Traffic Density" />
              </div>

              {/* Budget pie-like stats */}
              <div className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Financial Breakdown</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: "Sanctioned", value: `₹${road.sanctionedBudget} Cr`, color: "#10b981" },
                    { label: "Utilized", value: `₹${road.utilizedBudget} Cr`, color: budgetPct > 100 ? "#ef4444" : "#f59e0b" },
                    { label: "Tender Cost", value: `₹${road.lastTenderCost} Cr`, color: "#3b82f6" },
                    { label: "Repair Cost", value: `₹${road.repairCost} Cr`, color: "#f97316" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg p-2.5" style={{ background: `${item.color}12`, border: `1px solid ${item.color}25` }}>
                      <p className="text-[9px] text-slate-500 uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-black mt-0.5" style={{ color: item.color }}>{item.value}</p>
                    </div>
                  ))}
                </div>
                {budgetPct > 100 && (
                  <div className="mt-2.5 rounded-lg px-2.5 py-2 flex items-center gap-2" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <p className="text-[10px] text-red-300 font-semibold">Budget overrun detected · {budgetPct - 100}% over sanctioned limit</p>
                  </div>
                )}
              </div>

              {/* Contractor stats */}
              <div className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <HardHat className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contractor Performance</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center rounded-lg p-2" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
                    <span className="text-xl font-black text-violet-400">{road.contractorRating}</span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider">Rating /5</span>
                  </div>
                  <div className="flex flex-col items-center rounded-lg p-2" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                    <span className="text-xl font-black text-blue-400">{road.previousProjects}</span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider">Projects</span>
                  </div>
                  <div className="flex flex-col items-center rounded-lg p-2" style={{ background: road.delayDays > 30 ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", border: road.delayDays > 30 ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(16,185,129,0.2)" }}>
                    <span className={`text-xl font-black ${road.delayDays > 30 ? "text-red-400" : "text-emerald-400"}`}>{road.delayDays}d</span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider">Delay</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="p-3.5 space-y-3.5"
            >
              {/* Timeline */}
              <div className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Project Lifecycle</span>
                </div>
                <TimelineSection road={road} />
              </div>

              {/* Maintenance history */}
              <div className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Construction className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Maintenance Log</span>
                </div>
                <div className="space-y-2">
                  {(road.maintenanceHistory || []).map((item, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="w-2 h-2 rounded-full bg-cyan-500 shrink-0" />
                      <span className="text-xs text-slate-200 font-semibold flex-1">{item.stage}</span>
                      <span className="text-[10px] text-slate-500">{item.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Road images */}
              <div className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Road Imagery</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[road.roadImages[0], road.droneImages?.[0], road.complaintPhotos?.[0], road.roadImages[1]].filter(Boolean).slice(0, 4).map((src, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden aspect-video">
                      <img src={src} alt={`Road image ${i + 1}`} className="w-full h-full object-cover" style={{ filter: "brightness(0.75) saturate(0.85)" }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute bottom-1 left-1.5 text-[9px] text-white/70 font-semibold">
                        {["Current", "Drone", "Complaint", "Archive"][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status banner */}
              <div
                className="rounded-xl p-3.5"
                style={{
                  background: road.projectStatus === "delayed"
                    ? "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.04))"
                    : road.projectStatus === "work_in_progress"
                    ? "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.04))"
                    : "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.04))",
                  border: road.projectStatus === "delayed"
                    ? "1px solid rgba(239,68,68,0.25)"
                    : road.projectStatus === "work_in_progress"
                    ? "1px solid rgba(245,158,11,0.25)"
                    : "1px solid rgba(16,185,129,0.25)",
                }}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" style={{ color: road.projectStatus === "delayed" ? "#ef4444" : road.projectStatus === "work_in_progress" ? "#f59e0b" : "#10b981" }} />
                  <p className="text-xs font-bold text-slate-200">
                    Project Status: <span className="uppercase">{road.projectStatus?.replace("_", " ")}</span>
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 ml-6">Est. completion: {road.estimatedCompletion}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div
        className="shrink-0 p-3 grid grid-cols-2 gap-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <button
          className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all hover:opacity-90 active:scale-95"
          style={{ background: `linear-gradient(135deg, ${meta.color}cc, ${meta.color}88)`, color: "#000" }}
        >
          <FileText className="w-3.5 h-3.5" />
          Full Report
        </button>
        <button
          className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all hover:opacity-90 active:scale-95"
          style={{ background: "rgba(239,68,68,0.2)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Report Issue
        </button>
        <button
          className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all hover:opacity-90 active:scale-95"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(148,163,184,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Download className="w-3.5 h-3.5" />
          Download PDF
        </button>
        <button
          className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all hover:opacity-90 active:scale-95"
          style={{ background: "rgba(59,130,246,0.15)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.3)" }}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Track Contractor
        </button>
      </div>
    </motion.div>
  );
}
