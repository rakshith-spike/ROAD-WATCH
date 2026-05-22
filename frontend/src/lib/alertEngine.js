const ALERT_CATEGORIES = [
  "pothole emergency",
  "accident hotspot",
  "flooding",
  "traffic congestion",
  "contractor negligence",
  "delayed repair",
  "budget anomaly",
  "citizen complaint spike",
  "illegal road digging",
  "bridge risk",
  "drainage failure",
];

const AUTHORITIES = [
  "BBMP Emergency Works Cell",
  "Bengaluru Traffic Police",
  "Ward Engineering Response Unit",
  "Storm Water Control Authority",
  "City Road Safety Taskforce",
];

function round(value) {
  return Number(value.toFixed(1));
}

function computePriorityScore(road) {
  const utilizationPercent = road.sanctionedBudget ? (road.utilizedBudget / road.sanctionedBudget) * 100 : 0;
  const score =
    road.citizenComplaints * 0.72 +
    road.accidentCount * 6.8 +
    road.trafficDensity * 0.48 +
    road.floodRisk * 0.44 +
    road.severityScore * 0.58 +
    (road.roadImportance === "highway" || road.roadImportance === "arterial" ? 12 : 4) +
    Math.max(0, utilizationPercent - 90) * 0.75;
  return Math.min(100, round(score));
}

function getPriorityBand(score) {
  if (score >= 85) return "critical";
  if (score >= 65) return "high";
  if (score >= 42) return "medium";
  return "low";
}

function pickCategory(road) {
  if (road.floodRisk >= 75 && road.drainageCondition === "poor") return "flooding";
  if (road.accidentCount >= 7) return "accident hotspot";
  if (road.potholeCount >= 18) return "pothole emergency";
  if (road.delayDays >= 60) return "delayed repair";
  if (road.corruptionRiskScore >= 82) return "budget anomaly";
  if (road.citizenComplaints >= 30) return "citizen complaint spike";
  if (road.roadCondition === "under_construction") return "illegal road digging";
  return ALERT_CATEGORIES[Math.floor((road.severityScore + road.floodRisk) % ALERT_CATEGORIES.length)];
}

function summaryFor(category, road, score) {
  return `AI detected ${category} pattern at ${road.roadName}, ${road.ward}. Priority ${score}/100 with ${road.citizenComplaints} complaints and ${road.accidentCount} accident reports.`;
}

function recommendationFor(category, priority) {
  if (priority === "critical") {
    return "Dispatch emergency patch and traffic diversion team within 30 minutes, publish civic advisory.";
  }
  if (category === "budget anomaly") {
    return "Initiate tender and spend audit, cross-verify measurement book and contractor billing.";
  }
  if (category === "flooding") {
    return "Deploy dewatering pumps and drainage desilting crew, activate rainfall watch.";
  }
  if (priority === "high") {
    return "Assign zonal engineer with 12-hour SLA and push incident status to citizen dashboard.";
  }
  return "Schedule mitigation in next maintenance sprint and monitor for escalation.";
}

function mockNearbyServices(road) {
  return {
    hospital: `${road.ward} General Hospital`,
    policeStation: `${road.ward} Traffic Police Station`,
    fireStation: `${road.zone} Zone Fire Response Unit`,
  };
}

export function buildSmartAlerts(roads) {
  const sorted = [...roads]
    .map((road) => {
      const priorityScore = computePriorityScore(road);
      const priority = getPriorityBand(priorityScore);
      const category = pickCategory(road);
      const services = mockNearbyServices(road);
      const delayImpactHours = Math.max(1, Math.round((road.delayDays + road.accidentCount * 2) / 3));
      return {
        id: `ALT-${road.roadId}`,
        title: `${category.toUpperCase()} - ${road.roadName}`,
        category,
        severity: priority,
        priorityScore,
        timestamp: new Date(Date.now() - Math.round(priorityScore) * 180000).toISOString(),
        affectedArea: `${road.ward}, ${road.zone} Zone`,
        aiSummary: summaryFor(category, road, priorityScore),
        recommendedAction: recommendationFor(category, priority),
        assignedAuthority: AUTHORITIES[Math.floor((priorityScore + road.accidentCount) % AUTHORITIES.length)],
        estimatedImpact: `${Math.max(2, Math.round(priorityScore / 11))}K commuters at risk`,
        roadId: road.roadId,
        roadName: road.roadName,
        ward: road.ward,
        zone: road.zone,
        contractorName: road.contractorName,
        repairTimeline: `${Math.max(2, Math.round(priorityScore / 18))}-${Math.max(4, Math.round(priorityScore / 9))} hours`,
        authorityResponse: priority === "critical" ? "Escalated to command center" : "Assigned to zonal queue",
        citizenReports: road.citizenComplaints,
        photos: road.complaintPhotos.slice(0, 2),
        aiRiskAnalysis: `${road.predictedFailureRisk}% degradation risk in next 14 days`,
        nearbyHospital: services.hospital,
        nearbyPoliceStation: services.policeStation,
        nearbyFireStation: services.fireStation,
        delayedRepairHours: delayImpactHours,
        road,
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);

  return sorted.slice(0, 90);
}

export function alertStats(alerts) {
  const grouped = alerts.reduce(
    (acc, alert) => {
      acc.total += 1;
      acc[alert.severity] += 1;
      if (alert.category === "citizen complaint spike") acc.complaintSpikes += 1;
      if (alert.category === "contractor negligence" || alert.category === "delayed repair") acc.contractorNegligence += 1;
      return acc;
    },
    {
      total: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      complaintSpikes: 0,
      contractorNegligence: 0,
    },
  );

  return grouped;
}

export function areaEmergencyRanking(alerts, limit = 6) {
  const map = new Map();
  alerts.forEach((alert) => {
    if (!map.has(alert.ward)) {
      map.set(alert.ward, { ward: alert.ward, incidents: 0, weightedRisk: 0 });
    }
    const row = map.get(alert.ward);
    row.incidents += 1;
    row.weightedRisk += alert.priorityScore;
  });
  return [...map.values()]
    .map((item) => ({ ...item, weightedRisk: round(item.weightedRisk / item.incidents) }))
    .sort((a, b) => b.weightedRisk - a.weightedRisk)
    .slice(0, limit);
}
