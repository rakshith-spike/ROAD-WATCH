import { useCallback, useEffect, useMemo, useState } from "react";

import { MOCK_COMPLAINTS, buildComplaintInsights } from "../data/mockComplaints";
import { api } from "../services/api";

// ─── Minimal mock roads for offline mode ────────────────────────────────────
const MOCK_ROADS = [
  {
    id: "mg-road-sec-4",
    name: "MG Road",
    section: "Section 4",
    road_type: "city",
    status: "critical",
    coordinates: [{ lat: 12.9758, lng: 77.6062 }, { lat: 12.9755, lng: 77.6178 }, { lat: 12.9751, lng: 77.6265 }],
    center: { lat: 12.9755, lng: 77.6178 },
    contractor: "RoadBuild Pvt Ltd",
    authority: "BBMP Zone 3",
    sanctioned_budget_crore: 2.4,
    amount_spent_crore: 1.9,
    last_repair: "2023-03-12",
    complaints: 14,
    quality_score: 28,
    risk_factors: ["Repeated potholes", "Drainage failure", "High traffic load"],
  },
  {
    id: "hosur-road-km-8",
    name: "Hosur Road",
    section: "KM 8",
    road_type: "national_highway",
    status: "moderate",
    coordinates: [{ lat: 12.9321, lng: 77.6078 }, { lat: 12.9317, lng: 77.6226 }, { lat: 12.9311, lng: 77.637 }],
    center: { lat: 12.9317, lng: 77.6226 },
    contractor: "InfraWorks Consortium",
    authority: "NHAI Bengaluru Unit",
    sanctioned_budget_crore: 3.1,
    amount_spent_crore: 2.05,
    last_repair: "2023-08-28",
    complaints: 7,
    quality_score: 61,
    risk_factors: ["Surface cracks", "Water logging near service lane"],
  },
  {
    id: "outer-ring-road-n",
    name: "Outer Ring Road",
    section: "North",
    road_type: "arterial",
    status: "good",
    coordinates: [{ lat: 12.985, lng: 77.5898 }, { lat: 12.9852, lng: 77.6302 }, { lat: 12.9855, lng: 77.6701 }],
    center: { lat: 12.9852, lng: 77.6302 },
    contractor: "CivicGrid Builders",
    authority: "BBMP North Zone",
    sanctioned_budget_crore: 5.2,
    amount_spent_crore: 3.1,
    last_repair: "2024-01-10",
    complaints: 3,
    quality_score: 74,
    risk_factors: ["Minor surface wear"],
  },
];

const MOCK_SUMMARY = {
  total_roads: 12,
  critical_roads: 3,
  under_repair: 4,
  resolved_this_month: 7,
  total_complaints: 24,
  avg_quality_score: 54,
  budget_utilization: 72,
};

const MOCK_CONTRACTORS = [
  { name: "RoadBuild Pvt Ltd", rating: 3.8, active_projects: 3, completed: 12, budget_crore: 8.2 },
  { name: "InfraWorks Consortium", rating: 4.1, active_projects: 2, completed: 9, budget_crore: 6.5 },
  { name: "CivicGrid Builders", rating: 4.5, active_projects: 1, completed: 15, budget_crore: 11.0 },
];

const MOCK_ALERTS = [
  { id: "alt-001", severity: "critical", message: "MG Road Section 4 pothole cluster — immediate repair required.", road_id: "mg-road-sec-4", created_at: new Date().toISOString() },
  { id: "alt-002", severity: "high", message: "Hosur Road surface cracking approaching failure threshold.", road_id: "hosur-road-km-8", created_at: new Date().toISOString() },
];

const MOCK_TRENDS = [
  { month: "Dec", complaints: 18, resolved: 14 },
  { month: "Jan", complaints: 22, resolved: 19 },
  { month: "Feb", complaints: 16, resolved: 15 },
  { month: "Mar", complaints: 28, resolved: 22 },
  { month: "Apr", complaints: 31, resolved: 25 },
  { month: "May", complaints: 24, resolved: 18 },
];

export function useRoadWatchPlatform() {
  const [roads, setRoads] = useState([]);
  const [summary, setSummary] = useState(null);
  const [contractors, setContractors] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [complaintInsights, setComplaintInsights] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [riskCards, setRiskCards] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingMockData, setUsingMockData] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [roadsData, summaryData, contractorData, complaintData, complaintInsightsData, alertsData, trendsData, riskData] =
        await Promise.all([
          api.getRoads(),
          api.getSummary(),
          api.getContractors(),
          api.getComplaints(),
          api.getComplaintInsights().catch(() => null),
          api.getAlerts().catch(() => []),
          api.getMonthlyTrends().catch(() => []),
          api.getRiskCards().catch(() => []),
        ]);

      setRoads(roadsData);
      setSummary(summaryData);
      setContractors(contractorData);
      setComplaints(complaintData);
      setComplaintInsights(complaintInsightsData);
      setAlerts(alertsData);
      setTrends(trendsData);
      setRiskCards(riskData);
      setUsingMockData(false);
    } catch {
      // Backend unavailable — load mock/demo data so the UI still works
      setRoads(MOCK_ROADS);
      setSummary(MOCK_SUMMARY);
      setContractors(MOCK_CONTRACTORS);
      setComplaints(MOCK_COMPLAINTS);
      setComplaintInsights(buildComplaintInsights(MOCK_COMPLAINTS));
      setAlerts(MOCK_ALERTS);
      setTrends(MOCK_TRENDS);
      setRiskCards([]);
      setUsingMockData(true);
      setError(""); // Clear error — mock data loaded successfully
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const topRiskRoads = useMemo(() => {
    return [...roads].sort((a, b) => a.quality_score - b.quality_score).slice(0, 5);
  }, [roads]);

  // Mock-aware complaint operations
  const addMockComplaint = useCallback((newComplaint) => {
    setComplaints((prev) => {
      const updated = [newComplaint, ...prev];
      setComplaintInsights(buildComplaintInsights(updated));
      return updated;
    });
  }, []);

  const updateMockComplaint = useCallback((id, updates) => {
    setComplaints((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      setComplaintInsights(buildComplaintInsights(updated));
      return updated;
    });
  }, []);

  return {
    roads,
    summary,
    contractors,
    complaints,
    complaintInsights,
    alerts,
    trends,
    riskCards,
    topRiskRoads,
    loading,
    error,
    usingMockData,
    refresh,
    addMockComplaint,
    updateMockComplaint,
  };
}
