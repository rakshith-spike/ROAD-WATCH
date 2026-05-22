import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, BellRing, Building2, Clock3, Hospital, Loader2, ShieldAlert, Siren, Volume2, VolumeX } from "lucide-react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import toast from "react-hot-toast";

import { PageTransition } from "../components/common/PageTransition";
import { SectionHeading } from "../components/common/SectionHeading";
import { useSmartRoadIntelligence } from "../hooks/useSmartRoadIntelligence";
import { alertStats, areaEmergencyRanking, buildSmartAlerts } from "../lib/alertEngine";

const PRIORITY_CLASS = {
  critical: "bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-700/50",
  high: "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-700/40",
  medium: "bg-sky-100 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-700/40",
  low: "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-700/40",
};

function simulateDispatch(selectedAlert) {
  const baseMinutes = selectedAlert.severity === "critical" ? 9 : selectedAlert.severity === "high" ? 16 : 24;
  return {
    teams: [
      { unit: "Rapid Road Response", eta: `${baseMinutes} mins` },
      { unit: "Traffic Control Unit", eta: `${baseMinutes + 4} mins` },
      { unit: "Civic Safety Patrol", eta: `${baseMinutes + 7} mins` },
    ],
    nearestHospital: selectedAlert.nearbyHospital,
    nearestPolice: selectedAlert.nearbyPoliceStation,
    nearestFireStation: selectedAlert.nearbyFireStation,
  };
}

function formatTime(value) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AlertsPage() {
  const { roads, summary } = useSmartRoadIntelligence();
  const [severityFilter, setSeverityFilter] = useState("all");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showSosModal, setShowSosModal] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const alerts = useMemo(() => buildSmartAlerts(roads), [roads]);
  const topAlerts = useMemo(() => alerts.slice(0, 60), [alerts]);
  const stats = useMemo(() => alertStats(topAlerts), [topAlerts]);
  const rankedAreas = useMemo(() => areaEmergencyRanking(topAlerts), [topAlerts]);

  const filteredAlerts = useMemo(
    () => topAlerts.filter((item) => (severityFilter === "all" ? true : item.severity === severityFilter)),
    [topAlerts, severityFilter],
  );

  const topRiskRoads = useMemo(() => [...roads].sort((a, b) => b.predictedFailureRisk - a.predictedFailureRisk).slice(0, 6), [roads]);
  const delayedRepairs = useMemo(() => [...roads].filter((road) => road.delayDays >= 45).sort((a, b) => b.delayDays - a.delayDays).slice(0, 6), [roads]);

  useEffect(() => {
    const timer = setInterval(() => {
      const critical = topAlerts.filter((item) => item.severity === "critical").slice(0, 1);
      if (critical[0]) {
        setUnreadCount((prev) => prev + 1);
        toast(`Critical update: ${critical[0].roadName}`, { id: "critical-live" });
        if (soundEnabled) {
          try {
            const audioContext = new window.AudioContext();
            const oscillator = audioContext.createOscillator();
            oscillator.type = "sine";
            oscillator.frequency.value = 780;
            oscillator.connect(audioContext.destination);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.11);
          } catch {
            // no-op
          }
        }
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [topAlerts, soundEnabled]);

  const tickerBase = filteredAlerts
    .slice(0, 8)
    .map((item) => `[${item.severity.toUpperCase()}] ${item.roadName} - ${item.category}`)
    .join("  •  ");
  const tickerText = `${tickerBase}  •  ${tickerBase}`;

  async function triggerSos() {
    setShowSosModal(true);
    setDispatching(true);
    setDispatchResult(null);
    const fallbackAlert = filteredAlerts[0] || topAlerts[0];
    setTimeout(() => {
      setDispatchResult(simulateDispatch(fallbackAlert));
      setDispatching(false);
      toast.success("Emergency dispatch simulation started");
    }, 1600);
  }

  return (
    <PageTransition>
      <div className="space-y-5 pb-8">
        <SectionHeading
          eyebrow="City Command Center"
          title="Real-Time Alerts and AI Emergency Prioritization"
          description="Live civic risk intelligence for potholes, accidents, flooding, negligence, and budget anomalies."
          action={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSoundEnabled((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold dark:border-white/10"
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                {soundEnabled ? "Sound ON" : "Sound OFF"}
              </button>
              <button type="button" onClick={triggerSos} className="inline-flex items-center gap-2 rounded-xl bg-coral-500 px-4 py-2 text-sm font-semibold text-white">
                <Siren className="h-4 w-4" />
                Emergency SOS
              </button>
            </div>
          }
        />

        <div className="critical-ticker-wrap">
          <div className="critical-ticker-track">{tickerText}</div>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <article className="glass-panel"><p className="text-xs uppercase text-slate-500">Critical incidents</p><p className="mt-1 text-2xl font-bold">{stats.critical}</p></article>
          <article className="glass-panel"><p className="text-xs uppercase text-slate-500">High priority</p><p className="mt-1 text-2xl font-bold">{stats.high}</p></article>
          <article className="glass-panel"><p className="text-xs uppercase text-slate-500">Complaint spikes</p><p className="mt-1 text-2xl font-bold">{stats.complaintSpikes}</p></article>
          <article className="glass-panel"><p className="text-xs uppercase text-slate-500">Negligence trackers</p><p className="mt-1 text-2xl font-bold">{stats.contractorNegligence}</p></article>
          <article className="glass-panel">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase text-slate-500">Unread alerts</p>
              {unreadCount > 0 ? <BellRing className="h-4 w-4 text-rose-500 animate-pulse" /> : null}
            </div>
            <p className="mt-1 text-2xl font-bold">{unreadCount}</p>
          </article>
        </section>

        <div className="flex gap-2">
          {["all", "critical", "high", "medium", "low"].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setSeverityFilter(level)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                severityFilter === level ? "bg-ink-900 text-white dark:bg-mint-600 dark:text-slate-950" : "bg-white/70 dark:bg-white/10"
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="grid gap-4 2xl:grid-cols-[1.35fr_0.95fr]">
          <section className="space-y-3">
            {filteredAlerts.slice(0, 16).map((alert) => (
              <motion.article
                key={alert.id}
                whileHover={{ y: -2 }}
                className={`glass-panel cursor-pointer ${alert.severity === "critical" ? "critical-alert-blink" : ""}`}
                onClick={() => {
                  setSelectedAlert(alert);
                  setUnreadCount((prev) => Math.max(0, prev - 1));
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold text-slate-900 dark:text-white">{alert.title}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{alert.aiSummary}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${PRIORITY_CLASS[alert.severity]}`}>{alert.severity}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-white/10">{alert.affectedArea}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-white/10">Priority score: {alert.priorityScore}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-white/10">{formatTime(alert.timestamp)}</span>
                </div>
              </motion.article>
            ))}
          </section>

          <aside className="space-y-4">
            <section className="glass-panel">
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Active Emergencies Map</h3>
              <MapContainer center={[12.9716, 77.5946]} zoom={11} className="mt-3 h-64 rounded-xl">
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {topAlerts.slice(0, 25).map((alert) => (
                  <CircleMarker
                    key={alert.id}
                    center={[alert.road.latitude, alert.road.longitude]}
                    radius={alert.severity === "critical" ? 8 : alert.severity === "high" ? 6 : 4}
                    pathOptions={{
                      color: alert.severity === "critical" ? "#f75546" : alert.severity === "high" ? "#f4c14f" : "#31d49f",
                      fillColor: alert.severity === "critical" ? "#ff998f" : alert.severity === "high" ? "#f9d77f" : "#89efcf",
                      fillOpacity: 0.86,
                    }}
                  >
                    <Popup>
                      <p className="text-xs font-semibold">{alert.roadName}</p>
                      <p className="text-xs">{alert.severity.toUpperCase()} - {alert.category}</p>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </section>

            <section className="glass-panel">
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Area-wise Emergency Ranking</h3>
              <div className="mt-3 space-y-2">
                {rankedAreas.map((row) => (
                  <div key={row.ward} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-white/5">
                    <p>{row.ward}</p>
                    <p className="font-semibold">{row.weightedRisk}/100 · {row.incidents} incidents</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-panel">
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Top Risky Roads</h3>
              <div className="mt-3 space-y-2">
                {topRiskRoads.map((road) => (
                  <div key={road.roadId} className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-white/10">
                    <p className="font-semibold">{road.roadName}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">Risk {road.predictedFailureRisk} · {road.ward}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-panel">
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Delayed Repair Tracking</h3>
              <div className="mt-3 space-y-2">
                {delayedRepairs.map((road) => (
                  <div key={`delay-${road.roadId}`} className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-white/10">
                    <p className="font-semibold">{road.roadName}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{road.delayDays} days delay · {road.contractorName}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>

        <section className="glass-panel">
          <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">AI Emergency Insights</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
            <li className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-white/5">
              <ShieldAlert className="mr-2 inline h-4 w-4 text-rose-500" />
              {stats.critical} critical incidents need immediate lane-level diversion and night patch dispatch.
            </li>
            <li className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-white/5">
              <Building2 className="mr-2 inline h-4 w-4 text-amber-500" />
              Contractor negligence trend detected in delayed works above 45 days with high complaint density.
            </li>
            <li className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-white/5">
              <Clock3 className="mr-2 inline h-4 w-4 text-sky-500" />
              Estimated city response stabilization window: 18-26 hours if top 10 incidents are resolved in SLA.
            </li>
            <li className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-white/5">
              <AlertTriangle className="mr-2 inline h-4 w-4 text-coral-500" />
              City health snapshot: {summary.totalRoads} monitored roads, {summary.criticalRoads} critical sections, {summary.totalComplaints} complaints in pipeline.
            </li>
          </ul>
        </section>
      </div>

      {selectedAlert ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-3 py-8 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/20 bg-white/95 p-5 shadow-glass dark:bg-ink-900/95">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white">{selectedAlert.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{selectedAlert.aiSummary}</p>
              </div>
              <button type="button" onClick={() => setSelectedAlert(null)} className="rounded-lg border border-slate-200 px-3 py-1 text-sm dark:border-white/20">
                Close
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <section className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                <p className="text-xs uppercase tracking-wide text-slate-500">Issue Details</p>
                <p className="mt-2 text-sm">Affected road: {selectedAlert.roadName}</p>
                <p className="text-sm">Area: {selectedAlert.affectedArea}</p>
                <p className="text-sm">Estimated impact: {selectedAlert.estimatedImpact}</p>
                <p className="text-sm">Authority response: {selectedAlert.authorityResponse}</p>
              </section>

              <section className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                <p className="text-xs uppercase tracking-wide text-slate-500">Emergency Services</p>
                <p className="mt-2 text-sm"><Hospital className="mr-2 inline h-4 w-4" />{selectedAlert.nearbyHospital}</p>
                <p className="text-sm"><ShieldAlert className="mr-2 inline h-4 w-4" />{selectedAlert.nearbyPoliceStation}</p>
                <p className="text-sm"><Siren className="mr-2 inline h-4 w-4" />{selectedAlert.nearbyFireStation}</p>
              </section>

              <section className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                <p className="text-xs uppercase tracking-wide text-slate-500">Contractor + Timeline</p>
                <p className="mt-2 text-sm">Assigned contractor: {selectedAlert.contractorName}</p>
                <p className="text-sm">Repair timeline: {selectedAlert.repairTimeline}</p>
                <p className="text-sm">Delayed repair impact: {selectedAlert.delayedRepairHours} hours</p>
              </section>

              <section className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                <p className="text-xs uppercase tracking-wide text-slate-500">AI Risk Analysis</p>
                <p className="mt-2 text-sm">{selectedAlert.aiRiskAnalysis}</p>
                <p className="mt-1 text-sm">Recommended action: {selectedAlert.recommendedAction}</p>
                <p className="mt-1 text-sm">Citizen reports: {selectedAlert.citizenReports}</p>
              </section>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {selectedAlert.photos.map((photo) => (
                <img key={photo} src={photo} alt={selectedAlert.title} className="h-44 w-full rounded-xl object-cover" />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {showSosModal ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-3 py-8 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-white/95 p-5 shadow-glass dark:bg-ink-900/95">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Emergency Dispatch Console</h3>
              <button type="button" onClick={() => setShowSosModal(false)} className="rounded-lg border border-slate-200 px-3 py-1 text-sm dark:border-white/20">
                Close
              </button>
            </div>

            {dispatching ? (
              <div className="mt-6 flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                <Loader2 className="h-5 w-5 animate-spin text-coral-500" />
                Simulating live dispatch routing, nearest teams, and response ETA...
              </div>
            ) : null}

            {dispatchResult ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-slate-200 p-3 text-sm dark:border-white/10">
                  <p className="font-semibold">Nearest response teams</p>
                  {dispatchResult.teams.map((team) => (
                    <p key={team.unit} className="mt-1">{team.unit}: ETA {team.eta}</p>
                  ))}
                </div>
                <div className="rounded-xl border border-slate-200 p-3 text-sm dark:border-white/10">
                  <p>Hospital: {dispatchResult.nearestHospital}</p>
                  <p>Police: {dispatchResult.nearestPolice}</p>
                  <p>Fire Station: {dispatchResult.nearestFireStation}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </PageTransition>
  );
}
