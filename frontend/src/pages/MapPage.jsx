import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, Gauge, LocateFixed, MapPin, Mic, MicOff, Search } from "lucide-react";
import toast from "react-hot-toast";

import { SectionHeading } from "../components/common/SectionHeading";
import { SmartCityMap } from "../components/map/SmartCityMap";
import { PageTransition } from "../components/common/PageTransition";
import { useSmartRoadIntelligence } from "../hooks/useSmartRoadIntelligence";
import { RoadDetailPanel } from "../components/map/RoadDetailPanel";
import { haversineKm } from "../lib/geo";

const CONDITION_COLORS = {
  good: "#31d49f",
  moderate: "#f4c14f",
  critical: "#f75546",
  under_construction: "#f68f3c",
};

function riskBadgeClass(level) {
  if (level >= 85) return "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-200";
  if (level >= 65) return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200";
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200";
}

function trendFromRoad(road) {
  const base = road.citizenComplaints;
  return [
    { month: "Jan", complaints: Math.max(2, Math.round(base * 0.52)), accidents: Math.max(0, Math.round(road.accidentCount * 0.44)) },
    { month: "Feb", complaints: Math.max(2, Math.round(base * 0.63)), accidents: Math.max(0, Math.round(road.accidentCount * 0.58)) },
    { month: "Mar", complaints: Math.max(2, Math.round(base * 0.74)), accidents: Math.max(0, Math.round(road.accidentCount * 0.7)) },
    { month: "Apr", complaints: Math.max(2, Math.round(base * 0.82)), accidents: Math.max(0, Math.round(road.accidentCount * 0.88)) },
    { month: "May", complaints: Math.max(2, Math.round(base * 0.93)), accidents: Math.max(0, Math.round(road.accidentCount * 0.96)) },
    { month: "Jun", complaints: base, accidents: road.accidentCount },
  ];
}

export default function MapPage() {
  const { roads, contractors, wards, wardNames, summary, cityHealthScore, citizenTrustScore } = useSmartRoadIntelligence();
  const [selectedRoad, setSelectedRoad] = useState(roads[0] || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [listening, setListening] = useState(false);
  const [layerMode, setLayerMode] = useState("street");
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showWardOverlay, setShowWardOverlay] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyRoads, setNearbyRoads] = useState([]);
  const [distanceKm, setDistanceKm] = useState(4);
  const [filters, setFilters] = useState({
    condition: "all",
    severityBand: "all",
    contractor: "all",
    ward: "all",
    budgetBand: "all",
    accidentProneOnly: false,
    constructionOnly: false,
  });

  const contractorOptions = useMemo(() => contractors.map((item) => item.contractorName), [contractors]);

  const filteredRoads = useMemo(() => {
    return roads.filter((road) => {
      if (filters.condition !== "all" && road.roadCondition !== filters.condition) return false;
      if (filters.severityBand === "high" && road.severityScore < 70) return false;
      if (filters.severityBand === "moderate" && (road.severityScore < 40 || road.severityScore >= 70)) return false;
      if (filters.severityBand === "low" && road.severityScore >= 40) return false;
      if (filters.contractor !== "all" && road.contractorName !== filters.contractor) return false;
      if (filters.ward !== "all" && road.ward !== filters.ward) return false;

      if (filters.budgetBand === "high" && road.sanctionedBudget < 10) return false;
      if (filters.budgetBand === "medium" && (road.sanctionedBudget < 5 || road.sanctionedBudget >= 10)) return false;
      if (filters.budgetBand === "low" && road.sanctionedBudget >= 5) return false;

      if (filters.accidentProneOnly && road.accidentCount < 5) return false;
      if (filters.constructionOnly && road.roadCondition !== "under_construction") return false;

      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        road.roadName.toLowerCase().includes(query) ||
        road.contractorName.toLowerCase().includes(query) ||
        road.ward.toLowerCase().includes(query)
      );
    });
  }, [roads, filters, searchQuery]);

  const severityDistribution = useMemo(() => {
    const grouped = filteredRoads.reduce(
      (acc, road) => {
        acc[road.roadCondition] += 1;
        return acc;
      },
      { good: 0, moderate: 0, critical: 0, under_construction: 0 },
    );
    return [
      { name: "good", value: grouped.good },
      { name: "moderate", value: grouped.moderate },
      { name: "critical", value: grouped.critical },
      { name: "construction", value: grouped.under_construction },
    ];
  }, [filteredRoads]);

  const contractorPerformance = useMemo(
    () =>
      contractors.slice(0, 6).map((item) => ({
        name: item.contractorName.replace(" ", "\n"),
        rating: item.contractorRating,
        severity: Math.round(item.avgSeverity),
      })),
    [contractors],
  );

  const budgetUtilization = useMemo(
    () =>
      filteredRoads.slice(0, 8).map((road) => ({
        name: road.roadName.slice(0, 12),
        utilized: Number(((road.utilizedBudget / road.sanctionedBudget) * 100).toFixed(1)),
      })),
    [filteredRoads],
  );

  const complaintsTrend = useMemo(() => {
    const monthly = [
      { month: "Jan", complaints: 0, accidents: 0 },
      { month: "Feb", complaints: 0, accidents: 0 },
      { month: "Mar", complaints: 0, accidents: 0 },
      { month: "Apr", complaints: 0, accidents: 0 },
      { month: "May", complaints: 0, accidents: 0 },
      { month: "Jun", complaints: 0, accidents: 0 },
    ];
    filteredRoads.forEach((road) => {
      monthly[0].complaints += Math.round(road.citizenComplaints * 0.62);
      monthly[1].complaints += Math.round(road.citizenComplaints * 0.71);
      monthly[2].complaints += Math.round(road.citizenComplaints * 0.79);
      monthly[3].complaints += Math.round(road.citizenComplaints * 0.86);
      monthly[4].complaints += Math.round(road.citizenComplaints * 0.93);
      monthly[5].complaints += road.citizenComplaints;

      monthly[0].accidents += Math.round(road.accidentCount * 0.54);
      monthly[1].accidents += Math.round(road.accidentCount * 0.61);
      monthly[2].accidents += Math.round(road.accidentCount * 0.73);
      monthly[3].accidents += Math.round(road.accidentCount * 0.86);
      monthly[4].accidents += Math.round(road.accidentCount * 0.93);
      monthly[5].accidents += road.accidentCount;
    });
    return monthly;
  }, [filteredRoads]);

  const nearbySummary = useMemo(() => {
    if (!nearbyRoads.length) return null;
    const criticalRoads = nearbyRoads.filter((item) => item.roadCondition === "critical").length;
    const accidentHotspots = nearbyRoads.filter((item) => item.accidentCount >= 6).length;
    const avgQuality = nearbyRoads.reduce((sum, item) => sum + item.qualityScore, 0) / nearbyRoads.length;
    const congestion = nearbyRoads.filter((item) => item.trafficDensity >= 75).length;

    return {
      criticalRoads,
      accidentHotspots,
      avgQuality: Number(avgQuality.toFixed(1)),
      congestion,
      floodRiskHotspots: nearbyRoads.filter((item) => item.floodRisk >= 70).length,
      construction: nearbyRoads.filter((item) => item.roadCondition === "under_construction").length,
    };
  }, [nearbyRoads]);

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function startVoiceSearch() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      toast.error("Voice search unsupported in this browser");
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setListening(true);
    recognition.start();
    recognition.onresult = (event) => setSearchQuery(event.results[0][0].transcript);
    recognition.onerror = () => toast.error("Could not capture voice search");
    recognition.onend = () => setListening(false);
  }

  function findNearbyRoads(lat, lng, radiusKm = distanceKm) {
    const nearby = roads
      .map((road) => ({
        ...road,
        distanceKm: Number(haversineKm(lat, lng, road.latitude, road.longitude).toFixed(2)),
      }))
      .filter((road) => road.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
    setNearbyRoads(nearby);
    if (nearby[0]) setSelectedRoad(nearby[0]);
  }

  function locateMe() {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported in browser");
      return;
    }
    toast.loading("Finding your live location...", { id: "geo-locate" });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(point);
        findNearbyRoads(point.lat, point.lng);
        toast.success("Live location acquired. Nearby road intelligence loaded.", { id: "geo-locate" });
      },
      () => toast.error("Location permission denied", { id: "geo-locate" }),
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  const selectedRoadTrend = selectedRoad ? trendFromRoad(selectedRoad) : [];

  return (
    <PageTransition>
      <div className="space-y-5 pb-8">
        <SectionHeading
          eyebrow="Map Intelligence Command Center"
          title="AI-Powered Urban Road Intelligence and GIS Monitoring"
          description="Interactive road intelligence with severity heatmap, ward overlays, contractor accountability, budget transparency, and location-aware recommendations."
          action={
            <button
              type="button"
              onClick={locateMe}
              className="inline-flex items-center gap-2 rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white dark:bg-mint-600 dark:text-slate-950"
            >
              <LocateFixed className="h-4 w-4" />
              Live Geolocation
            </button>
          }
        />

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="glass-panel">
            <p className="text-xs uppercase text-slate-500">City Health Score</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{cityHealthScore}/100</p>
          </article>
          <article className="glass-panel">
            <p className="text-xs uppercase text-slate-500">Citizen Trust</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{citizenTrustScore}/100</p>
          </article>
          <article className="glass-panel">
            <p className="text-xs uppercase text-slate-500">Critical Roads</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{summary.criticalRoads}</p>
          </article>
          <article className="glass-panel">
            <p className="text-xs uppercase text-slate-500">Accident Hotspots</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{summary.accidentHotspots}</p>
          </article>
        </section>

        <section className="glass-panel space-y-3">
          <div className="grid gap-2 md:grid-cols-[1.3fr_0.7fr]">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm dark:border-white/10 dark:bg-white/5"
                  placeholder="Search roads, contractors, wards..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <button type="button" onClick={startVoiceSearch} className="rounded-xl border border-slate-200 px-3 dark:border-white/10">
                {listening ? <MicOff className="h-4 w-4 text-rose-500" /> : <Mic className="h-4 w-4" />}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5" value={layerMode} onChange={(event) => setLayerMode(event.target.value)}>
                <option value="street">Street</option>
                <option value="satellite">Satellite-like</option>
                <option value="weather">Weather overlay</option>
                <option value="traffic">Traffic overlay</option>
              </select>
              <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5" value={distanceKm} onChange={(event) => setDistanceKm(Number(event.target.value))}>
                <option value={3}>3 km radius</option>
                <option value={4}>4 km radius</option>
                <option value={5}>5 km radius</option>
              </select>
            </div>
          </div>

          <div className="grid gap-2 lg:grid-cols-3 xl:grid-cols-6">
            <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5" value={filters.condition} onChange={(event) => updateFilter("condition", event.target.value)}>
              <option value="all">All conditions</option>
              <option value="good">Good</option>
              <option value="moderate">Moderate</option>
              <option value="critical">Critical</option>
              <option value="under_construction">Construction</option>
            </select>
            <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5" value={filters.severityBand} onChange={(event) => updateFilter("severityBand", event.target.value)}>
              <option value="all">All severity</option>
              <option value="high">High (70+)</option>
              <option value="moderate">Moderate (40-69)</option>
              <option value="low">Low (0-39)</option>
            </select>
            <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5" value={filters.contractor} onChange={(event) => updateFilter("contractor", event.target.value)}>
              <option value="all">All contractors</option>
              {contractorOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5" value={filters.ward} onChange={(event) => updateFilter("ward", event.target.value)}>
              <option value="all">All wards</option>
              {wardNames.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5" value={filters.budgetBand} onChange={(event) => updateFilter("budgetBand", event.target.value)}>
              <option value="all">All budgets</option>
              <option value="high">High (10+ Cr)</option>
              <option value="medium">Medium (5-10 Cr)</option>
              <option value="low">Low (&lt;5 Cr)</option>
            </select>
            <div className="flex items-center gap-2 text-sm">
              <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 dark:border-white/10">
                <input type="checkbox" checked={filters.accidentProneOnly} onChange={(event) => updateFilter("accidentProneOnly", event.target.checked)} />
                Accident-prone
              </label>
              <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 dark:border-white/10">
                <input type="checkbox" checked={filters.constructionOnly} onChange={(event) => updateFilter("constructionOnly", event.target.checked)} />
                Construction
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => setShowHeatmap((prev) => !prev)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold dark:border-white/10">
              {showHeatmap ? "Hide heatmap" : "Show heatmap"}
            </button>
            <button type="button" onClick={() => setShowWardOverlay((prev) => !prev)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold dark:border-white/10">
              {showWardOverlay ? "Hide ward overlay" : "Show ward overlay"}
            </button>
          </div>
        </section>

        <div className="grid gap-4 2xl:grid-cols-[1.4fr_0.9fr]">
          <SmartCityMap
            roads={filteredRoads}
            wards={wards}
            selectedRoad={selectedRoad}
            onSelectRoad={setSelectedRoad}
            userLocation={userLocation}
            nearbyRoads={nearbyRoads}
            layerMode={layerMode}
            showHeatmap={showHeatmap}
            showWardOverlay={showWardOverlay}
          />

          <aside className="max-h-[630px] overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
              {selectedRoad ? (
                <RoadDetailPanel key={selectedRoad.roadId} road={selectedRoad} />
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-panel flex h-full min-h-[200px] flex-col items-center justify-center gap-3 text-center"
                >
                  <div className="rounded-full bg-slate-100 p-4 dark:bg-white/5">
                    <MapPin className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select a road on the map</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">Click any road segment or marker to view its full intelligence profile.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </aside>
        </div>

        {nearbySummary ? (
          <section className="glass-panel">
            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Nearby Roads Summary ({distanceKm} km)</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-xl border border-slate-200 p-3 dark:border-white/10"><p className="text-xs text-slate-500">Critical nearby roads</p><p className="text-xl font-bold">{nearbySummary.criticalRoads}</p></article>
              <article className="rounded-xl border border-slate-200 p-3 dark:border-white/10"><p className="text-xs text-slate-500">Accident hotspots</p><p className="text-xl font-bold">{nearbySummary.accidentHotspots}</p></article>
              <article className="rounded-xl border border-slate-200 p-3 dark:border-white/10"><p className="text-xs text-slate-500">Avg road quality</p><p className="text-xl font-bold">{nearbySummary.avgQuality}/100</p></article>
              <article className="rounded-xl border border-slate-200 p-3 dark:border-white/10"><p className="text-xs text-slate-500">High congestion</p><p className="text-xl font-bold">{nearbySummary.congestion}</p></article>
            </div>
            <div className="mt-4 rounded-xl border border-slate-200 p-3 dark:border-white/10">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Roads near me recommendations</p>
              <div className="mt-2 space-y-2">
                {nearbyRoads.slice(0, 5).map((road) => (
                  <div key={`near-me-${road.roadId}`} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-white/5">
                    <p className="text-slate-700 dark:text-slate-200">{road.roadName} ({road.distanceKm} km)</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${riskBadgeClass(road.predictedFailureRisk)}`}>
                      {road.maintenancePriority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-2">
          <article className="glass-panel">
            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Severity Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={severityDistribution} dataKey="value" nameKey="name" innerRadius={52} outerRadius={92} paddingAngle={2}>
                    {severityDistribution.map((item) => (
                      <Cell key={item.name} fill={CONDITION_COLORS[item.name === "construction" ? "under_construction" : item.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="glass-panel">
            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Contractor Performance vs Severity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contractorPerformance}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rating" fill="#31d49f" />
                  <Bar dataKey="severity" fill="#f75546" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="glass-panel">
            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Budget Utilization</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetUtilization}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="utilized" fill="#f4c14f" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="glass-panel">
            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Complaints & Accident Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={complaintsTrend}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="complaints" stroke="#f75546" strokeWidth={2} />
                  <Line dataKey="accidents" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>

        <section className="glass-panel">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-mint-500" />
            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">AI Generated City Health Insights</h3>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
            <li className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-white/5">
              <AlertTriangle className="mr-2 inline h-4 w-4 text-rose-500" />
              Priority cluster detected across {summary.criticalRoads} critical corridors with monsoon-sensitive flood risk patterns.
            </li>
            <li className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-white/5">
              Contractor compliance is strongest where utilization stays below 88%; anomaly thresholds are rising in delayed projects.
            </li>
            <li className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-white/5">
              Citizen trust score is {citizenTrustScore}/100. Proactive status updates can lift trust by an estimated 8-12 points.
            </li>
          </ul>
        </section>
      </div>
    </PageTransition>
  );
}
