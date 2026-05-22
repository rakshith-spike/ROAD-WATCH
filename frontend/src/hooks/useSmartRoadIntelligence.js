import { useEffect, useMemo, useState } from "react";

import { generateSmartRoadData, SMART_CONTRACTORS, WARD_BOUNDARIES } from "../data/smartRoadData";
import { api } from "../services/api";

export function useSmartRoadIntelligence() {
  const source = (import.meta.env.VITE_INTELLIGENCE_SOURCE || "local").toLowerCase().trim();
  const limit = Number(import.meta.env.VITE_INTELLIGENCE_LIMIT || 120);
  const localRoads = useMemo(() => generateSmartRoadData(limit), [limit]);
  const [remoteSnapshot, setRemoteSnapshot] = useState(null);

  useEffect(() => {
    let active = true;
    if (source !== "backend") return () => {
      active = false;
    };

    api
      .getIntelligenceSnapshot(limit)
      .then((snapshot) => {
        if (!active) return;
        setRemoteSnapshot(snapshot);
      })
      .catch(() => {
        if (!active) return;
        setRemoteSnapshot(null);
      });

    return () => {
      active = false;
    };
  }, [source, limit]);

  const roads = useMemo(() => {
    if (source === "backend" && remoteSnapshot?.roads?.length) {
      return remoteSnapshot.roads;
    }
    return localRoads;
  }, [source, remoteSnapshot, localRoads]);

  const contractors = useMemo(() => {
    const contractorMap = new Map();
    roads.forEach((road) => {
      if (!contractorMap.has(road.contractorName)) {
        contractorMap.set(road.contractorName, {
          contractorName: road.contractorName,
          contractorCompany: road.contractorCompany,
          contractorContact: road.contractorContact,
          contractorRating: road.contractorRating,
          projectEngineer: road.projectEngineer,
          maintenanceAgency: road.maintenanceAgency,
          assignedRoads: 0,
          avgSeverity: 0,
          avgUtilization: 0,
        });
      }
      const current = contractorMap.get(road.contractorName);
      current.assignedRoads += 1;
      current.avgSeverity += road.severityScore;
      current.avgUtilization += road.sanctionedBudget ? (road.utilizedBudget / road.sanctionedBudget) * 100 : 0;
    });

    return [...contractorMap.values()].map((item) => ({
      ...item,
      avgSeverity: Number((item.avgSeverity / item.assignedRoads).toFixed(1)),
      avgUtilization: Number((item.avgUtilization / item.assignedRoads).toFixed(1)),
    }));
  }, [roads]);

  const wards = useMemo(() => {
    if (source === "backend" && remoteSnapshot?.wards?.length) return remoteSnapshot.wards;
    return WARD_BOUNDARIES;
  }, [source, remoteSnapshot]);
  const zones = useMemo(() => {
    if (source === "backend" && remoteSnapshot?.zones?.length) return remoteSnapshot.zones;
    return [...new Set(wards.map((item) => item.zone))];
  }, [source, remoteSnapshot, wards]);
  const wardNames = useMemo(() => {
    if (source === "backend" && remoteSnapshot?.wardNames?.length) return remoteSnapshot.wardNames;
    return wards.map((item) => item.ward);
  }, [source, remoteSnapshot, wards]);

  const cityHealthScore = useMemo(() => {
    if (source === "backend" && typeof remoteSnapshot?.cityHealthScore === "number") {
      return remoteSnapshot.cityHealthScore;
    }
    const riskAvg = roads.reduce((sum, road) => sum + road.predictedFailureRisk, 0) / roads.length;
    return Math.max(18, Number((100 - riskAvg * 0.72).toFixed(1)));
  }, [source, remoteSnapshot, roads]);

  const citizenTrustScore = useMemo(() => {
    if (source === "backend" && typeof remoteSnapshot?.citizenTrustScore === "number") {
      return remoteSnapshot.citizenTrustScore;
    }
    const avgSatisfaction = roads.reduce((sum, road) => sum + road.citizenSatisfactionScore, 0) / roads.length;
    return Number(avgSatisfaction.toFixed(1));
  }, [source, remoteSnapshot, roads]);

  const summary = useMemo(() => {
    if (source === "backend" && remoteSnapshot?.summary) {
      return remoteSnapshot.summary;
    }
    const criticalRoads = roads.filter((road) => road.roadCondition === "critical").length;
    const constructionRoads = roads.filter((road) => road.roadCondition === "under_construction").length;
    const avgQuality = roads.reduce((sum, road) => sum + road.qualityScore, 0) / roads.length;
    const totalComplaints = roads.reduce((sum, road) => sum + road.citizenComplaints, 0);
    const accidentHotspots = roads.filter((road) => road.accidentCount >= 6).length;

    return {
      totalRoads: roads.length,
      criticalRoads,
      constructionRoads,
      avgQuality: Number(avgQuality.toFixed(1)),
      totalComplaints,
      accidentHotspots,
      cityHealthScore,
      citizenTrustScore,
    };
  }, [source, remoteSnapshot, roads, cityHealthScore, citizenTrustScore]);

  return {
    roads,
    contractors,
    wards,
    zones,
    wardNames,
    summary,
    cityHealthScore,
    citizenTrustScore,
    contractorCatalog: SMART_CONTRACTORS,
  };
}
