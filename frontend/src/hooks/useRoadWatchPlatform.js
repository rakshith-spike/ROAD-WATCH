import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "../services/api";

export function useRoadWatchPlatform() {
  const [roads, setRoads] = useState([]);
  const [summary, setSummary] = useState(null);
  const [contractors, setContractors] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [riskCards, setRiskCards] = useState([]);
  const [trends, setTrends] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [roadsData, summaryData, contractorData, complaintData, alertsData, trendsData, riskData] = await Promise.all([
        api.getRoads(),
        api.getSummary(),
        api.getContractors(),
        api.getComplaints(),
        api.getAlerts().catch(() => []),
        api.getMonthlyTrends().catch(() => []),
        api.getRiskCards().catch(() => []),
      ]);

      setRoads(roadsData);
      setSummary(summaryData);
      setContractors(contractorData);
      setComplaints(complaintData);
      setAlerts(alertsData);
      setTrends(trendsData);
      setRiskCards(riskData);
    } catch (err) {
      setError(err.message || "Unable to reach backend");
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

  return {
    roads,
    summary,
    contractors,
    complaints,
    alerts,
    trends,
    riskCards,
    topRiskRoads,
    loading,
    error,
    refresh,
  };
}
