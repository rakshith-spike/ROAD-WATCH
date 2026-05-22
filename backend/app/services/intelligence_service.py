from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
import math
from random import Random


@dataclass(frozen=True)
class WardSeed:
    ward: str
    zone: str
    lat: float
    lng: float


WARDS: list[WardSeed] = [
    WardSeed("Mahadevapura", "East", 12.9898, 77.7034),
    WardSeed("Whitefield", "East", 12.9698, 77.7499),
    WardSeed("KR Puram", "East", 13.0089, 77.6958),
    WardSeed("Indiranagar", "East", 12.9784, 77.6408),
    WardSeed("BTM Layout", "South", 12.9156, 77.6101),
    WardSeed("Jayanagar", "South", 12.9250, 77.5938),
    WardSeed("Banashankari", "South", 12.9181, 77.5739),
    WardSeed("Rajajinagar", "West", 12.9916, 77.5557),
    WardSeed("Vijayanagar", "West", 12.9719, 77.5332),
    WardSeed("Yeshwanthpur", "North", 13.0289, 77.5512),
    WardSeed("Hebbal", "North", 13.0358, 77.5970),
    WardSeed("RT Nagar", "North", 13.0216, 77.5946),
    WardSeed("Malleshwaram", "Central", 13.0034, 77.5686),
    WardSeed("Shivajinagar", "Central", 12.9857, 77.6033),
    WardSeed("Basavanagudi", "South", 12.9422, 77.5736),
]

CONTRACTORS = [
    {
        "contractorName": "Srinivas Infra",
        "contractorCompany": "Srinivas Urban Mobility Pvt Ltd",
        "contractorContact": "+91-98451-22431",
        "contractorRating": 4.4,
        "projectEngineer": "Engr. Pradeep Kulkarni",
        "maintenanceAgency": "BBMP East Maintenance Cell",
    },
    {
        "contractorName": "Namma Roads Consortium",
        "contractorCompany": "Namma Roads Consortium LLP",
        "contractorContact": "+91-98860-77192",
        "contractorRating": 3.8,
        "projectEngineer": "Engr. Keerthana Rao",
        "maintenanceAgency": "Urban Road Renewal Unit",
    },
    {
        "contractorName": "Civic Edge Projects",
        "contractorCompany": "Civic Edge Projects Ltd",
        "contractorContact": "+91-97310-55990",
        "contractorRating": 4.1,
        "projectEngineer": "Engr. Mohammed Arif",
        "maintenanceAgency": "BBMP Central Works Division",
    },
    {
        "contractorName": "Metro Corridor Works",
        "contractorCompany": "Metro Corridor Works Pvt Ltd",
        "contractorContact": "+91-96068-22241",
        "contractorRating": 3.5,
        "projectEngineer": "Engr. Bhavana Iyer",
        "maintenanceAgency": "Karnataka Highway Operations",
    },
    {
        "contractorName": "Kaveri Infra Tech",
        "contractorCompany": "Kaveri Infra Tech Systems",
        "contractorContact": "+91-99168-14503",
        "contractorRating": 4.7,
        "projectEngineer": "Engr. Aditya Narayanan",
        "maintenanceAgency": "BBMP Smart Streets Taskforce",
    },
    {
        "contractorName": "South Grid Civil",
        "contractorCompany": "South Grid Civil & Transport",
        "contractorContact": "+91-98447-99803",
        "contractorRating": 3.9,
        "projectEngineer": "Engr. Shweta Prasad",
        "maintenanceAgency": "Bengaluru Road Safety Mission",
    },
]

ROAD_PREFIXES = [
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
]

ROAD_SUFFIXES = [
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
]


def _date_shift(days_offset: int) -> str:
    return (date.today() + timedelta(days=days_offset)).isoformat()


def _ward_boundary(ward: WardSeed) -> list[list[float]]:
    lat_pad = 0.013
    lng_pad = 0.016
    return [
        [ward.lat - lat_pad, ward.lng - lng_pad],
        [ward.lat - lat_pad, ward.lng + lng_pad],
        [ward.lat + lat_pad, ward.lng + lng_pad],
        [ward.lat + lat_pad, ward.lng - lng_pad],
    ]


def _road_condition(severity_score: int, randomizer: Random) -> str:
    if severity_score > 80:
        return "critical"
    if severity_score > 60:
        return "under_construction" if randomizer.random() > 0.55 else "moderate"
    if severity_score > 35:
        return "moderate"
    return "good"


def _road_coordinates(lat: float, lng: float, randomizer: Random) -> list[list[float]]:
    angle = randomizer.random() * 6.283185307
    step = 0.006 + randomizer.random() * 0.003
    return [
        [lat - (step * math.sin(angle)), lng - (step * math.cos(angle))],
        [lat, lng],
        [lat + (step * math.sin(angle)), lng + (step * math.cos(angle))],
    ]


def generate_intelligence_roads(total: int = 120, seed: int = 20260521) -> list[dict]:
    randomizer = Random(seed)
    roads: list[dict] = []
    for index in range(total):
        ward = WARDS[index % len(WARDS)]
        contractor = CONTRACTORS[index % len(CONTRACTORS)]
        road_id = f"RW-BLR-{index + 1:04d}"

        latitude = round(ward.lat + (randomizer.random() - 0.5) * 0.028, 6)
        longitude = round(ward.lng + (randomizer.random() - 0.5) * 0.034, 6)
        severity_score = randomizer.randint(18, 96)
        condition = _road_condition(severity_score, randomizer)

        pothole_count = randomizer.randint(0, 34 if condition == "critical" else 16)
        accident_count = randomizer.randint(0, 12 if condition == "critical" else 7)
        complaints = randomizer.randint(pothole_count, pothole_count + 36)
        traffic_density = randomizer.randint(20, 98)
        flood_risk = randomizer.randint(8, 95)
        drainage = ["good", "moderate", "poor"][randomizer.randint(0, 2)]
        air_quality = randomizer.randint(38, 181)

        sanctioned_lakhs = randomizer.randint(220, 2800)
        utilized_percent = randomizer.randint(32, 111)
        utilized_lakhs = round((sanctioned_lakhs * utilized_percent) / 100)
        repair_lakhs = randomizer.randint(18, max(40, round(utilized_lakhs * 0.38)))
        tender_lakhs = randomizer.randint(35, max(60, repair_lakhs + 120))
        delay_days = randomizer.randint(0, 120) if condition == "under_construction" else randomizer.randint(0, 45)
        corruption_risk = min(99, round(utilized_percent * 0.45 + delay_days * 0.38 + randomizer.random() * 16))
        status = "work_in_progress" if condition == "under_construction" else ("delayed" if delay_days > 25 else "active")

        risk = min(
            100,
            round(severity_score * 0.35 + pothole_count * 1.9 + accident_count * 4.4 + utilized_percent * 0.25 + flood_risk * 0.2),
        )
        priority = "Emergency" if risk >= 85 else ("High" if risk >= 65 else ("Medium" if risk >= 45 else "Routine"))
        recommendation = (
            "Deploy emergency patch unit, diversion signage, and 48-hour contractor audit."
            if risk >= 85
            else (
                "Prioritize monsoon-ready resurfacing and weekly safety inspections."
                if risk >= 65
                else (
                    "Schedule preventive maintenance and citizen communication update."
                    if risk >= 45
                    else "Maintain normal patrol cycle and quarterly quality checks."
                )
            )
        )

        road_name = f"{ROAD_PREFIXES[index % len(ROAD_PREFIXES)]} {ROAD_SUFFIXES[randomizer.randint(0, len(ROAD_SUFFIXES) - 1)]}"

        roads.append(
            {
                "roadId": road_id,
                "roadName": road_name,
                "ward": ward.ward,
                "zone": ward.zone,
                "latitude": latitude,
                "longitude": longitude,
                "severityScore": severity_score,
                "roadCondition": condition,
                "potholeCount": pothole_count,
                "accidentCount": accident_count,
                "citizenComplaints": complaints,
                "trafficDensity": traffic_density,
                "floodRisk": flood_risk,
                "drainageCondition": drainage,
                "airQualityNearby": air_quality,
                "lastInspectionDate": _date_shift(-randomizer.randint(2, 80)),
                "nextInspectionDate": _date_shift(randomizer.randint(7, 75)),
                "contractorName": contractor["contractorName"],
                "contractorCompany": contractor["contractorCompany"],
                "contractorContact": contractor["contractorContact"],
                "contractorRating": contractor["contractorRating"],
                "projectEngineer": contractor["projectEngineer"],
                "maintenanceAgency": contractor["maintenanceAgency"],
                "sanctionedBudget": round(sanctioned_lakhs / 100, 2),
                "utilizedBudget": round(utilized_lakhs / 100, 2),
                "repairCost": round(repair_lakhs / 100, 2),
                "lastTenderCost": round(tender_lakhs / 100, 2),
                "projectStatus": status,
                "estimatedCompletion": _date_shift(randomizer.randint(12, 140)),
                "delayDays": delay_days,
                "corruptionRiskScore": corruption_risk,
                "aiPrediction": (
                    "High fracture propagation risk in upcoming rainfall cycle."
                    if condition == "critical"
                    else (
                        "Post-construction settlement risk likely for 3-4 weeks."
                        if condition == "under_construction"
                        else (
                            "Surface wear expected to accelerate under heavy traffic lanes."
                            if condition == "moderate"
                            else "Stable pavement health with minor localized wear."
                        )
                    )
                ),
                "predictedFailureRisk": risk,
                "maintenancePriority": priority,
                "recommendedAction": recommendation,
                "aiConfidence": round(0.72 + (risk / 1000) * 2.1, 2),
                "roadImages": [
                    f"https://picsum.photos/seed/road-{road_id.lower()}/960/540",
                    f"https://picsum.photos/seed/road-alt-{road_id.lower()}/960/540",
                ],
                "droneImages": [f"https://picsum.photos/seed/drone-{road_id.lower()}/960/540"],
                "complaintPhotos": [
                    f"https://picsum.photos/seed/complaint-{road_id.lower()}/960/540",
                    f"https://picsum.photos/seed/complaint-alt-{road_id.lower()}/960/540",
                ],
                "coordinates": _road_coordinates(latitude, longitude, randomizer),
                "qualityScore": max(12, 100 - severity_score + randomizer.randint(-6, 8)),
                "citizenSatisfactionScore": max(8, min(94, 100 - severity_score + randomizer.randint(-15, 10))),
                "roadImportance": ["arterial", "city", "highway", "connector"][randomizer.randint(0, 3)],
                "blacklistedRisk": "high" if corruption_risk > 80 else ("moderate" if corruption_risk > 58 else "low"),
                "previousProjects": randomizer.randint(4, 41),
                "maintenanceHistory": [
                    {"stage": "Patching", "date": _date_shift(-randomizer.randint(5, 110))},
                    {"stage": "Drainage Audit", "date": _date_shift(-randomizer.randint(3, 95))},
                    {"stage": "Surface Scan", "date": _date_shift(-randomizer.randint(2, 75))},
                ],
            }
        )
    return roads


def generate_ward_boundaries() -> list[dict]:
    return [{"ward": item.ward, "zone": item.zone, "boundary": _ward_boundary(item)} for item in WARDS]


def _alert_priority(road: dict) -> float:
    utilization_percent = (road["utilizedBudget"] / road["sanctionedBudget"]) * 100 if road["sanctionedBudget"] else 0
    score = (
        road["citizenComplaints"] * 0.72
        + road["accidentCount"] * 6.8
        + road["trafficDensity"] * 0.48
        + road["floodRisk"] * 0.44
        + road["severityScore"] * 0.58
        + (12 if road["roadImportance"] in {"highway", "arterial"} else 4)
        + max(0, utilization_percent - 90) * 0.75
    )
    return round(min(100, score), 1)


def generate_intelligence_alerts(roads: list[dict], limit: int = 90) -> list[dict]:
    authorities = [
        "BBMP Emergency Works Cell",
        "Bengaluru Traffic Police",
        "Ward Engineering Response Unit",
        "Storm Water Control Authority",
        "City Road Safety Taskforce",
    ]

    alerts: list[dict] = []
    for road in roads:
        score = _alert_priority(road)
        severity = "critical" if score >= 85 else ("high" if score >= 65 else ("medium" if score >= 42 else "low"))
        if road["floodRisk"] >= 75 and road["drainageCondition"] == "poor":
            category = "flooding"
        elif road["accidentCount"] >= 7:
            category = "accident hotspot"
        elif road["potholeCount"] >= 18:
            category = "pothole emergency"
        elif road["delayDays"] >= 60:
            category = "delayed repair"
        elif road["corruptionRiskScore"] >= 82:
            category = "budget anomaly"
        else:
            category = "citizen complaint spike"

        alerts.append(
            {
                "id": f"ALT-{road['roadId']}",
                "title": f"{category.upper()} - {road['roadName']}",
                "category": category,
                "severity": severity,
                "priorityScore": score,
                "timestamp": f"{_date_shift(-1)}T12:00:00Z",
                "affectedArea": f"{road['ward']}, {road['zone']} Zone",
                "aiSummary": (
                    f"AI detected {category} at {road['roadName']} with {road['citizenComplaints']} complaints and "
                    f"{road['accidentCount']} accident reports."
                ),
                "recommendedAction": (
                    "Dispatch emergency patch and traffic diversion team within 30 minutes."
                    if severity == "critical"
                    else "Assign zonal engineer and citizen update SLA."
                ),
                "assignedAuthority": authorities[(int(score) + road["accidentCount"]) % len(authorities)],
                "estimatedImpact": f"{max(2, round(score / 11))}K commuters at risk",
                "roadId": road["roadId"],
                "roadName": road["roadName"],
                "ward": road["ward"],
                "zone": road["zone"],
                "contractorName": road["contractorName"],
                "repairTimeline": f"{max(2, round(score / 18))}-{max(4, round(score / 9))} hours",
                "authorityResponse": "Escalated to command center" if severity == "critical" else "Assigned to zonal queue",
                "citizenReports": road["citizenComplaints"],
                "photos": road["complaintPhotos"][:2],
                "aiRiskAnalysis": f"{road['predictedFailureRisk']}% degradation risk in next 14 days",
                "nearbyHospital": f"{road['ward']} General Hospital",
                "nearbyPoliceStation": f"{road['ward']} Traffic Police Station",
                "nearbyFireStation": f"{road['zone']} Zone Fire Response Unit",
                "delayedRepairHours": max(1, round((road["delayDays"] + road["accidentCount"] * 2) / 3)),
                "road": road,
            }
        )

    alerts.sort(key=lambda item: item["priorityScore"], reverse=True)
    return alerts[:limit]


def intelligence_snapshot(limit: int = 120) -> dict:
    roads = generate_intelligence_roads(total=max(40, min(200, limit)))
    boundaries = generate_ward_boundaries()
    alerts = generate_intelligence_alerts(roads)

    contractor_map: dict[str, dict] = {}
    for road in roads:
        row = contractor_map.setdefault(
            road["contractorName"],
            {
                "contractorName": road["contractorName"],
                "contractorCompany": road["contractorCompany"],
                "contractorContact": road["contractorContact"],
                "contractorRating": road["contractorRating"],
                "projectEngineer": road["projectEngineer"],
                "maintenanceAgency": road["maintenanceAgency"],
                "assignedRoads": 0,
                "avgSeverity": 0.0,
                "avgUtilization": 0.0,
            },
        )
        row["assignedRoads"] += 1
        row["avgSeverity"] += road["severityScore"]
        row["avgUtilization"] += (road["utilizedBudget"] / road["sanctionedBudget"]) * 100 if road["sanctionedBudget"] else 0

    contractors = []
    for row in contractor_map.values():
        total = row["assignedRoads"]
        row["avgSeverity"] = round(row["avgSeverity"] / total, 1)
        row["avgUtilization"] = round(row["avgUtilization"] / total, 1)
        contractors.append(row)

    avg_risk = sum(road["predictedFailureRisk"] for road in roads) / len(roads)
    city_health_score = max(18, round(100 - avg_risk * 0.72, 1))
    citizen_trust_score = round(sum(road["citizenSatisfactionScore"] for road in roads) / len(roads), 1)

    summary = {
        "totalRoads": len(roads),
        "criticalRoads": len([road for road in roads if road["roadCondition"] == "critical"]),
        "constructionRoads": len([road for road in roads if road["roadCondition"] == "under_construction"]),
        "avgQuality": round(sum(road["qualityScore"] for road in roads) / len(roads), 1),
        "totalComplaints": sum(road["citizenComplaints"] for road in roads),
        "accidentHotspots": len([road for road in roads if road["accidentCount"] >= 6]),
        "cityHealthScore": city_health_score,
        "citizenTrustScore": citizen_trust_score,
    }

    return {
        "roads": roads,
        "contractors": contractors,
        "wards": boundaries,
        "zones": sorted({item.zone for item in WARDS}),
        "wardNames": [item.ward for item in WARDS],
        "summary": summary,
        "cityHealthScore": city_health_score,
        "citizenTrustScore": citizen_trust_score,
        "alerts": alerts,
    }
