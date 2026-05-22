const WARDS = [
  { ward: "Mahadevapura", zone: "East", center: { lat: 12.9898, lng: 77.7034 } },
  { ward: "Whitefield", zone: "East", center: { lat: 12.9698, lng: 77.7499 } },
  { ward: "KR Puram", zone: "East", center: { lat: 13.0089, lng: 77.6958 } },
  { ward: "Indiranagar", zone: "East", center: { lat: 12.9784, lng: 77.6408 } },
  { ward: "BTM Layout", zone: "South", center: { lat: 12.9156, lng: 77.6101 } },
  { ward: "Jayanagar", zone: "South", center: { lat: 12.925, lng: 77.5938 } },
  { ward: "Banashankari", zone: "South", center: { lat: 12.9181, lng: 77.5739 } },
  { ward: "Rajajinagar", zone: "West", center: { lat: 12.9916, lng: 77.5557 } },
  { ward: "Vijayanagar", zone: "West", center: { lat: 12.9719, lng: 77.5332 } },
  { ward: "Yeshwanthpur", zone: "North", center: { lat: 13.0289, lng: 77.5512 } },
  { ward: "Hebbal", zone: "North", center: { lat: 13.0358, lng: 77.597 } },
  { ward: "RT Nagar", zone: "North", center: { lat: 13.0216, lng: 77.5946 } },
  { ward: "Malleshwaram", zone: "Central", center: { lat: 13.0034, lng: 77.5686 } },
  { ward: "Shivajinagar", zone: "Central", center: { lat: 12.9857, lng: 77.6033 } },
  { ward: "Basavanagudi", zone: "South", center: { lat: 12.9422, lng: 77.5736 } },
];

const CONTRACTORS = [
  {
    contractorName: "Srinivas Infra",
    contractorCompany: "Srinivas Urban Mobility Pvt Ltd",
    contractorContact: "+91-98451-22431",
    contractorRating: 4.4,
    projectEngineer: "Engr. Pradeep Kulkarni",
    maintenanceAgency: "BBMP East Maintenance Cell",
  },
  {
    contractorName: "Namma Roads Consortium",
    contractorCompany: "Namma Roads Consortium LLP",
    contractorContact: "+91-98860-77192",
    contractorRating: 3.8,
    projectEngineer: "Engr. Keerthana Rao",
    maintenanceAgency: "Urban Road Renewal Unit",
  },
  {
    contractorName: "Civic Edge Projects",
    contractorCompany: "Civic Edge Projects Ltd",
    contractorContact: "+91-97310-55990",
    contractorRating: 4.1,
    projectEngineer: "Engr. Mohammed Arif",
    maintenanceAgency: "BBMP Central Works Division",
  },
  {
    contractorName: "Metro Corridor Works",
    contractorCompany: "Metro Corridor Works Pvt Ltd",
    contractorContact: "+91-96068-22241",
    contractorRating: 3.5,
    projectEngineer: "Engr. Bhavana Iyer",
    maintenanceAgency: "Karnataka Highway Operations",
  },
  {
    contractorName: "Kaveri Infra Tech",
    contractorCompany: "Kaveri Infra Tech Systems",
    contractorContact: "+91-99168-14503",
    contractorRating: 4.7,
    projectEngineer: "Engr. Aditya Narayanan",
    maintenanceAgency: "BBMP Smart Streets Taskforce",
  },
  {
    contractorName: "South Grid Civil",
    contractorCompany: "South Grid Civil & Transport",
    contractorContact: "+91-98447-99803",
    contractorRating: 3.9,
    projectEngineer: "Engr. Shweta Prasad",
    maintenanceAgency: "Bengaluru Road Safety Mission",
  },
];

const ROAD_PREFIXES = [
  "Old Airport",
  "Outer Ring",
  "Hosur",
  "Bannerghatta",
  "Tumakuru",
  "Mysuru",
  "Bellary",
  "Magadi",
  "Kanakapura",
  "NICE Link",
  "Varthur",
  "Sarjapur",
  "100 Feet",
  "80 Feet",
  "Service Lane",
];

const ROAD_SUFFIXES = [
  "Main Road",
  "Cross",
  "Junction",
  "Flyover Approach",
  "Underpass Link",
  "Signal Corridor",
  "Metro Feeder",
  "Commercial Stretch",
  "Hospital Stretch",
  "School Zone Road",
];

function seededRandom(seed) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 48271) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function randomInt(rand, min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function toCurrency(amountLakhs) {
  return Number((amountLakhs / 100).toFixed(2));
}

function dateShift(daysOffset) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().slice(0, 10);
}

function buildWardBoundary(center) {
  const latPad = 0.013;
  const lngPad = 0.016;
  return [
    [center.lat - latPad, center.lng - lngPad],
    [center.lat - latPad, center.lng + lngPad],
    [center.lat + latPad, center.lng + lngPad],
    [center.lat + latPad, center.lng - lngPad],
  ];
}

function pickCondition(rand, severityScore) {
  if (severityScore > 80) return "critical";
  if (severityScore > 60) return rand() > 0.55 ? "under_construction" : "moderate";
  if (severityScore > 35) return "moderate";
  return "good";
}

function buildTimelineDate(rand) {
  const pastDays = randomInt(rand, 2, 80);
  const futureDays = randomInt(rand, 7, 75);
  return {
    lastInspectionDate: dateShift(-pastDays),
    nextInspectionDate: dateShift(futureDays),
  };
}

function buildRoadPolyline(lat, lng, rand) {
  const angle = rand() * Math.PI * 2;
  const step = 0.006 + rand() * 0.003;
  return [
    [lat - Math.sin(angle) * step, lng - Math.cos(angle) * step],
    [lat, lng],
    [lat + Math.sin(angle) * step, lng + Math.cos(angle) * step],
  ];
}

function buildMedia(seedId) {
  return {
    roadImages: [
      `https://picsum.photos/seed/road-${seedId}/960/540`,
      `https://picsum.photos/seed/road-alt-${seedId}/960/540`,
    ],
    droneImages: [`https://picsum.photos/seed/drone-${seedId}/960/540`],
    complaintPhotos: [
      `https://picsum.photos/seed/complaint-${seedId}/960/540`,
      `https://picsum.photos/seed/complaint-alt-${seedId}/960/540`,
    ],
  };
}

function buildAiSummary(condition, severityScore, potholes, accidents, budgetUtilization, floodRisk) {
  const risk = Math.min(
    100,
    Math.round(severityScore * 0.35 + potholes * 1.9 + accidents * 4.4 + budgetUtilization * 0.25 + floodRisk * 0.2),
  );
  const priority = risk >= 85 ? "Emergency" : risk >= 65 ? "High" : risk >= 45 ? "Medium" : "Routine";
  const action =
    risk >= 85
      ? "Deploy emergency patch unit, diversion signage, and 48-hour contractor audit."
      : risk >= 65
        ? "Prioritize monsoon-ready resurfacing and weekly safety inspections."
        : risk >= 45
          ? "Schedule preventive maintenance and citizen communication update."
          : "Maintain normal patrol cycle and quarterly quality checks.";

  const prediction =
    condition === "critical"
      ? "High fracture propagation risk in upcoming rainfall cycle."
      : condition === "under_construction"
        ? "Post-construction settlement risk likely for 3-4 weeks."
        : condition === "moderate"
          ? "Surface wear expected to accelerate under heavy traffic lanes."
          : "Stable pavement health with minor localized wear.";

  return {
    predictedFailureRisk: risk,
    maintenancePriority: priority,
    recommendedAction: action,
    aiPrediction: prediction,
    aiConfidence: Number((0.72 + (risk / 1000) * 2.1).toFixed(2)),
  };
}

export const WARD_BOUNDARIES = WARDS.map((item) => ({
  ward: item.ward,
  zone: item.zone,
  boundary: buildWardBoundary(item.center),
}));

export function generateSmartRoadData(total = 120, seed = 20260520) {
  const rand = seededRandom(seed);
  const rows = [];

  for (let index = 0; index < total; index += 1) {
    const ward = WARDS[index % WARDS.length];
    const contractor = CONTRACTORS[index % CONTRACTORS.length];
    const roadId = `RW-BLR-${String(index + 1).padStart(4, "0")}`;

    const latitude = Number((ward.center.lat + (rand() - 0.5) * 0.028).toFixed(6));
    const longitude = Number((ward.center.lng + (rand() - 0.5) * 0.034).toFixed(6));

    const severityScore = randomInt(rand, 18, 96);
    const roadCondition = pickCondition(rand, severityScore);
    const potholeCount = randomInt(rand, 0, roadCondition === "critical" ? 34 : 16);
    const accidentCount = randomInt(rand, 0, roadCondition === "critical" ? 12 : 7);
    const citizenComplaints = randomInt(rand, potholeCount, potholeCount + 36);
    const trafficDensity = randomInt(rand, 20, 98);
    const floodRisk = randomInt(rand, 8, 95);
    const drainageCondition = ["good", "moderate", "poor"][randomInt(rand, 0, 2)];
    const airQualityNearby = randomInt(rand, 38, 181);
    const sanctionedBudgetLakhs = randomInt(rand, 220, 2800);
    const utilizedPercent = randomInt(rand, 32, 111);
    const utilizedBudgetLakhs = Math.round((sanctionedBudgetLakhs * utilizedPercent) / 100);
    const repairCostLakhs = randomInt(rand, 18, Math.max(40, Math.round(utilizedBudgetLakhs * 0.38)));
    const lastTenderCostLakhs = randomInt(rand, 35, Math.max(60, repairCostLakhs + 120));
    const delayDays = roadCondition === "under_construction" ? randomInt(rand, 0, 120) : randomInt(rand, 0, 45);
    const corruptionRiskScore = Math.min(99, Math.round(utilizedPercent * 0.45 + delayDays * 0.38 + rand() * 16));
    const projectStatus = roadCondition === "under_construction" ? "work_in_progress" : delayDays > 25 ? "delayed" : "active";
    const estimatedCompletion = dateShift(randomInt(rand, 12, 140));

    const roadName = `${ROAD_PREFIXES[index % ROAD_PREFIXES.length]} ${ROAD_SUFFIXES[randomInt(rand, 0, ROAD_SUFFIXES.length - 1)]}`;
    const timeline = buildTimelineDate(rand);
    const media = buildMedia(roadId.toLowerCase());
    const ai = buildAiSummary(
      roadCondition,
      severityScore,
      potholeCount,
      accidentCount,
      utilizedPercent,
      floodRisk,
    );
    const coordinates = buildRoadPolyline(latitude, longitude, rand);

    rows.push({
      roadId,
      roadName,
      ward: ward.ward,
      zone: ward.zone,
      latitude,
      longitude,
      severityScore,
      roadCondition,
      potholeCount,
      accidentCount,
      citizenComplaints,
      trafficDensity,
      floodRisk,
      drainageCondition,
      airQualityNearby,
      lastInspectionDate: timeline.lastInspectionDate,
      nextInspectionDate: timeline.nextInspectionDate,
      contractorName: contractor.contractorName,
      contractorCompany: contractor.contractorCompany,
      contractorContact: contractor.contractorContact,
      contractorRating: contractor.contractorRating,
      projectEngineer: contractor.projectEngineer,
      maintenanceAgency: contractor.maintenanceAgency,
      sanctionedBudget: toCurrency(sanctionedBudgetLakhs),
      utilizedBudget: toCurrency(utilizedBudgetLakhs),
      repairCost: toCurrency(repairCostLakhs),
      lastTenderCost: toCurrency(lastTenderCostLakhs),
      projectStatus,
      estimatedCompletion,
      delayDays,
      corruptionRiskScore,
      aiPrediction: ai.aiPrediction,
      predictedFailureRisk: ai.predictedFailureRisk,
      maintenancePriority: ai.maintenancePriority,
      recommendedAction: ai.recommendedAction,
      aiConfidence: ai.aiConfidence,
      roadImages: media.roadImages,
      droneImages: media.droneImages,
      complaintPhotos: media.complaintPhotos,
      coordinates,
      qualityScore: Math.max(12, 100 - severityScore + randomInt(rand, -6, 8)),
      citizenSatisfactionScore: Math.max(8, Math.min(94, 100 - severityScore + randomInt(rand, -15, 10))),
      roadImportance: ["arterial", "city", "highway", "connector"][randomInt(rand, 0, 3)],
      blacklistedRisk: corruptionRiskScore > 80 ? "high" : corruptionRiskScore > 58 ? "moderate" : "low",
      previousProjects: randomInt(rand, 4, 41),
      maintenanceHistory: [
        { stage: "Patching", date: dateShift(-randomInt(rand, 5, 110)) },
        { stage: "Drainage Audit", date: dateShift(-randomInt(rand, 3, 95)) },
        { stage: "Surface Scan", date: dateShift(-randomInt(rand, 2, 75)) },
      ],
    });
  }

  return rows;
}

export const SMART_CONTRACTORS = CONTRACTORS;
