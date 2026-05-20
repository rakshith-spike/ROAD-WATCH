import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { PageTransition } from "../components/common/PageTransition";
import { SectionHeading } from "../components/common/SectionHeading";
import { isAdminRole, normalizeRole } from "../lib/roles";
import { useAuth } from "../providers/AuthProvider";
import { usePlatform } from "../providers/PlatformProvider";
import { api } from "../services/api";

function parseApiError(err) {
  if (!err?.message) return "Request failed";
  try {
    const data = JSON.parse(err.message);
    return data.detail || err.message;
  } catch {
    return err.message;
  }
}

export default function AdminPage() {
  const { user } = useAuth();
  const { roads, refresh } = usePlatform();
  const [transparency, setTransparency] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [updatingRoad, setUpdatingRoad] = useState(false);
  const [creatingAlert, setCreatingAlert] = useState(false);
  const [roadOps, setRoadOps] = useState({
    road_id: "",
    status: "",
    quality_score: "",
    complaints: "",
    amount_spent_crore: "",
    risk_factors: "",
  });
  const [alertForm, setAlertForm] = useState({
    title: "",
    message: "",
    severity: "high",
    status: "active",
  });

  const role = normalizeRole(user?.role);
  const hasFullAdminAccess = isAdminRole(role);
  const selectedRoad = useMemo(() => roads.find((item) => item.id === roadOps.road_id), [roads, roadOps.road_id]);

  useEffect(() => {
    api.getTransparency().then(setTransparency).catch(() => setTransparency(null));
    api.getBudgetAnomalies().then(setAnomalies).catch(() => setAnomalies([]));
  }, []);

  useEffect(() => {
    if (!roadOps.road_id && roads.length > 0) {
      setRoadOps((current) => ({ ...current, road_id: roads[0].id }));
    }
  }, [roads, roadOps.road_id]);

  function notifyAuth() {
    if (hasFullAdminAccess) {
      toast.success(`Admin access active as ${role}.`, { id: "admin-rbac" });
      return;
    }
    toast("For full admin APIs, login as government_admin or super_admin.", { id: "admin-rbac" });
  }

  function updateRoadField(field, value) {
    setRoadOps((current) => ({ ...current, [field]: value }));
  }

  function updateAlertField(field, value) {
    setAlertForm((current) => ({ ...current, [field]: value }));
  }

  async function handleRoadUpdate(event) {
    event.preventDefault();
    if (!hasFullAdminAccess) {
      notifyAuth();
      return;
    }
    if (!roadOps.road_id) {
      toast.error("Select a road first");
      return;
    }

    const payload = {};
    if (roadOps.status) payload.status = roadOps.status;
    if (roadOps.quality_score !== "") payload.quality_score = Number(roadOps.quality_score);
    if (roadOps.complaints !== "") payload.complaints = Number(roadOps.complaints);
    if (roadOps.amount_spent_crore !== "") payload.amount_spent_crore = Number(roadOps.amount_spent_crore);
    if (roadOps.risk_factors.trim()) payload.risk_factors = roadOps.risk_factors.split(",").map((item) => item.trim()).filter(Boolean);

    if (Object.keys(payload).length === 0) {
      toast.error("Enter at least one field to update");
      return;
    }

    setUpdatingRoad(true);
    try {
      await api.updateRoad(roadOps.road_id, payload);
      toast.success("Road updated successfully");
      await refresh();
      setRoadOps((current) => ({
        ...current,
        quality_score: "",
        complaints: "",
        amount_spent_crore: "",
        risk_factors: "",
      }));
    } catch (err) {
      toast.error(parseApiError(err));
    } finally {
      setUpdatingRoad(false);
    }
  }

  async function handleAlertCreate(event) {
    event.preventDefault();
    if (!hasFullAdminAccess) {
      notifyAuth();
      return;
    }

    setCreatingAlert(true);
    try {
      await api.createAlert(alertForm);
      toast.success("Alert broadcasted to operations feed");
      await refresh();
      setAlertForm({
        title: "",
        message: "",
        severity: "high",
        status: "active",
      });
    } catch (err) {
      toast.error(parseApiError(err));
    } finally {
      setCreatingAlert(false);
    }
  }

  return (
    <PageTransition>
      <div className="space-y-5 pb-8">
        <SectionHeading
          eyebrow="Government Console"
          title="Public Transparency and Budget Governance"
          description="Built for BBMP/NHAI decision makers to inspect utilization, anomalies, and citizen engagement metrics."
          action={
            <button type="button" onClick={notifyAuth} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-white/10">
              {hasFullAdminAccess ? "Admin Access Active" : "RBAC Info"}
            </button>
          }
        />

        {transparency ? (
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <article className="glass-panel"><p className="text-xs uppercase text-slate-500">Roads</p><p className="mt-1 text-2xl font-bold">{transparency.roads_monitored}</p></article>
            <article className="glass-panel"><p className="text-xs uppercase text-slate-500">Complaints</p><p className="mt-1 text-2xl font-bold">{transparency.complaints_registered}</p></article>
            <article className="glass-panel"><p className="text-xs uppercase text-slate-500">Resolved</p><p className="mt-1 text-2xl font-bold">{transparency.complaints_resolved}</p></article>
            <article className="glass-panel"><p className="text-xs uppercase text-slate-500">Engagement</p><p className="mt-1 text-2xl font-bold">{transparency.citizen_engagement_score}</p></article>
          </section>
        ) : null}

        <section className="glass-panel">
          <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Budget Anomaly Detection</h3>
          <div className="mt-3 space-y-3">
            {anomalies.map((item) => (
              <article key={item.ward} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                <p className="font-semibold text-slate-900 dark:text-white">{item.ward} Ward - {item.utilization_percent}% utilized</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.ai_hint}</p>
              </article>
            ))}
            {anomalies.length === 0 ? <p className="text-sm text-slate-600 dark:text-slate-300">No anomaly records available or admin authorization required.</p> : null}
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <form onSubmit={handleRoadUpdate} className="glass-panel space-y-3">
            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Admin Action: Road Quality Override</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">Only admins can override road status, complaint load, and budget spend.</p>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5"
              value={roadOps.road_id}
              onChange={(event) => updateRoadField("road_id", event.target.value)}
            >
              {roads.map((road) => (
                <option key={road.id} value={road.id}>{road.name} · {road.section}</option>
              ))}
            </select>
            <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" value={roadOps.status} onChange={(event) => updateRoadField("status", event.target.value)}>
              <option value="">No status change</option>
              <option value="good">good</option>
              <option value="moderate">moderate</option>
              <option value="critical">critical</option>
              <option value="construction">construction</option>
            </select>
            <div className="grid gap-2 sm:grid-cols-2">
              <input type="number" min="0" max="100" className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" placeholder={`Quality (${selectedRoad?.quality_score ?? "--"})`} value={roadOps.quality_score} onChange={(event) => updateRoadField("quality_score", event.target.value)} />
              <input type="number" min="0" className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" placeholder={`Complaints (${selectedRoad?.complaints ?? "--"})`} value={roadOps.complaints} onChange={(event) => updateRoadField("complaints", event.target.value)} />
            </div>
            <input type="number" min="0" step="0.1" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" placeholder="Amount spent (crore)" value={roadOps.amount_spent_crore} onChange={(event) => updateRoadField("amount_spent_crore", event.target.value)} />
            <input className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" placeholder="Risk factors (comma-separated)" value={roadOps.risk_factors} onChange={(event) => updateRoadField("risk_factors", event.target.value)} />
            <button type="submit" disabled={updatingRoad} className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-mint-600 dark:text-slate-950">
              {updatingRoad ? "Updating..." : "Apply Override"}
            </button>
          </form>

          <form onSubmit={handleAlertCreate} className="glass-panel space-y-3">
            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Admin Action: Emergency Alert Broadcast</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">Publish new civic alerts to the operations feed with severity controls.</p>
            <input required className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" placeholder="Alert title" value={alertForm.title} onChange={(event) => updateAlertField("title", event.target.value)} />
            <textarea required rows={4} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" placeholder="Operational message..." value={alertForm.message} onChange={(event) => updateAlertField("message", event.target.value)} />
            <div className="grid gap-2 sm:grid-cols-2">
              <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" value={alertForm.severity} onChange={(event) => updateAlertField("severity", event.target.value)}>
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
                <option value="critical">critical</option>
              </select>
              <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5" value={alertForm.status} onChange={(event) => updateAlertField("status", event.target.value)}>
                <option value="active">active</option>
                <option value="resolved">resolved</option>
              </select>
            </div>
            <button type="submit" disabled={creatingAlert} className="rounded-xl bg-coral-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {creatingAlert ? "Publishing..." : "Publish Alert"}
            </button>
          </form>
        </section>
      </div>
    </PageTransition>
  );
}
