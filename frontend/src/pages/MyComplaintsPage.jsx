import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCircle2, ClipboardList, Clock3, Filter, MapPin, Search, Wrench } from "lucide-react";

import { PageTransition } from "../components/common/PageTransition";
import { SectionHeading } from "../components/common/SectionHeading";
import { api } from "../services/api";

function compactDescription(description = "") {
  return description.replace(/\s+/g, " ").trim();
}

function submittedDateTime(complaint) {
  const date = complaint?.captured_date || detailValue(complaint || {}, "Issue detected at").split(" ")[0] || "";
  const time = complaint?.captured_time || "";
  if (date && time) return `${date} ${time}`;
  if (date) return date;
  if (!complaint?.created_at) return "Time not available";
  return new Date(complaint.created_at).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function submittedDateOnly(complaint) {
  if (complaint?.captured_date) return complaint.captured_date;
  if (!complaint?.created_at) return "";
  return new Date(complaint.created_at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
}

function detailValue(item, label) {
  const compact = compactDescription(item.description || "");
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`${escaped}:\\s*(.*?)(?=\\s+(Damage Type|Severity|Location|Coordinates|Issue detected at|Recommended Action):|$)`, "i");
  return compact.match(pattern)?.[1]?.trim() || "";
}

function priorityTone(priority = "") {
  const lower = priority.toLowerCase();
  if (lower.includes("critical") || lower.includes("emergency")) return "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200";
  if (lower.includes("moderate") || lower.includes("immediate")) return "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200";
  return "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200";
}

function trackingSteps(complaint) {
  const status = (complaint?.status || "Assigned").toLowerCase();
  const completedInspection = ["inspection", "in progress", "resolved", "closed"].some((item) => status.includes(item));
  const completedRepair = ["resolved", "closed"].some((item) => status.includes(item));
  return [
    { label: "Complaint Submitted", detail: `RoadWatch received your AI generated report at ${submittedDateTime(complaint)}.`, done: true, icon: ClipboardList },
    { label: "Assigned to Authority", detail: complaint?.assigned_to || "Responsible authority assigned.", done: true, icon: CheckCircle2 },
    { label: "Inspection / Work Order", detail: "Field verification and maintenance scheduling.", done: completedInspection, icon: Clock3 },
    { label: "Repair Completed", detail: "Closure after road repair verification.", done: completedRepair, icon: Wrench },
  ];
}

function ComplaintSummary({ complaint }) {
  const damageType = detailValue(complaint, "Damage Type") || complaint.issue_type;
  const severity = complaint.severity || detailValue(complaint, "Severity") || complaint.ai_priority;
  const location = complaint.location_name || detailValue(complaint, "Location") || complaint.road_name;
  const coordinates = detailValue(complaint, "Coordinates") || [complaint.latitude, complaint.longitude].filter(Boolean).join(", ");
  const action = complaint.ai_recommended_action || detailValue(complaint, "Recommended Action");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white">{damageType}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{complaint.status} - {complaint.assigned_to}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityTone(complaint.ai_priority)}`}>{complaint.ai_priority}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Severity</p>
          <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">{severity}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Submitted</p>
          <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">{submittedDateTime(complaint)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-3 dark:border-white/10 sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Location</p>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{location || "Location stored with complaint"}</p>
          {coordinates && <p className="mt-2 font-mono text-xs text-slate-500 dark:text-slate-400">{coordinates}</p>}
        </div>
      </div>

      {action && <p className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:bg-white/5 dark:text-slate-300">{action}</p>}
    </div>
  );
}

export default function MyComplaintsPage() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("rw_access_token")) {
      toast.error("Please sign in to view your complaints");
      navigate("/auth", { state: { from: "/my-complaints" } });
      return;
    }

    async function loadComplaints() {
      setLoading(true);
      try {
        const data = await api.getMyComplaints();
        setComplaints(data);
        setSelectedId(data[0]?.id || "");
      } catch (error) {
        const message = error.message || "Could not load your complaints";
        toast.error(message);
        if (message.toLowerCase().includes("token") || message.toLowerCase().includes("unauthorized") || message.toLowerCase().includes("bearer")) {
          navigate("/auth", { state: { from: "/my-complaints" } });
        }
      } finally {
        setLoading(false);
      }
    }
    loadComplaints();
  }, [navigate]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return complaints.filter((item) => {
      const priorityOk = priorityFilter === "all" || item.ai_priority === priorityFilter;
      const statusOk = statusFilter === "all" || item.status === statusFilter;
      const haystack = `${item.issue_type} ${item.description} ${item.status} ${item.ai_priority} ${item.assigned_to}`.toLowerCase();
      return priorityOk && statusOk && (!needle || haystack.includes(needle));
    });
  }, [complaints, priorityFilter, query, statusFilter]);

  const selected = filtered.find((item) => item.id === selectedId) || filtered[0] || null;
  const priorityOptions = [...new Set(complaints.map((item) => item.ai_priority).filter(Boolean))];
  const statusOptions = [...new Set(complaints.map((item) => item.status).filter(Boolean))];

  return (
    <PageTransition>
      <div className="space-y-5 pb-8">
        <SectionHeading
          eyebrow="Citizen Tracking"
          title="My Complaints"
          description="Review your submitted road complaints, filter them quickly, and track each complaint's progress."
        />

        <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
          <section className="glass-panel space-y-4">
            <div className="grid gap-3">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Select Complaint</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5"
                value={selected?.id || ""}
                onChange={(event) => setSelectedId(event.target.value)}
              >
                {filtered.length === 0 && <option value="">No matching complaints</option>}
                {filtered.map((item) => (
                  <option key={item.id} value={item.id}>{item.issue_type} - {item.ai_priority} - {submittedDateOnly(item)}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 dark:border-white/10 dark:bg-white/5" placeholder="Search complaints" value={query} onChange={(event) => setQuery(event.target.value)} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="all">All status</option>
                  {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
                  <option value="all">All priority</option>
                  {priorityOptions.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-white"><Filter size={16} /> Your Results</div>
              {loading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading your complaints...</p>}
              {!loading && filtered.map((item) => (
                <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`w-full rounded-xl border p-3 text-left transition ${selected?.id === item.id ? "border-ink-800 bg-ink-900 text-white dark:border-mint-400 dark:bg-mint-500 dark:text-slate-950" : "border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"}`}>
                  <p className="font-semibold">{item.issue_type}</p>
                  <p className="mt-1 text-xs opacity-80">{item.ai_priority} - {item.status}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="glass-panel min-h-[520px]">
            {!selected ? (
              <div className="flex h-full min-h-[320px] items-center justify-center text-sm text-slate-500 dark:text-slate-400">No complaint selected</div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <ComplaintSummary complaint={selected} />
                <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                  <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white"><MapPin size={18} /> Tracking Progress</div>
                  <div className="mt-5 space-y-5">
                    {trackingSteps(selected).map((step, index) => {
                      const Icon = step.icon;
                      return (
                        <div key={step.label} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${step.done ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400 dark:bg-white/10"}`}><Icon size={16} /></div>
                            {index < trackingSteps(selected).length - 1 && <div className={`mt-2 h-10 w-px ${step.done ? "bg-emerald-300" : "bg-slate-200 dark:bg-white/10"}`} />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{step.label}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{step.detail}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </PageTransition>
  );
}