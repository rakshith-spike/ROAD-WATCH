from datetime import datetime


def _road(
    road_id: str,
    name: str,
    section: str,
    road_type: str,
    status: str,
    coordinates: list[dict],
    contractor: str,
    authority: str,
    budget: float,
    spent: float,
    last_repair: str,
    complaints: int,
    score: int,
    risks: list[str],
) -> dict:
    center = coordinates[len(coordinates) // 2]
    return {
        "id": road_id,
        "name": name,
        "section": section,
        "road_type": road_type,
        "status": status,
        "coordinates": coordinates,
        "center": center,
        "contractor": contractor,
        "authority": authority,
        "sanctioned_budget_crore": budget,
        "amount_spent_crore": spent,
        "last_repair": last_repair,
        "complaints": complaints,
        "quality_score": score,
        "risk_factors": risks,
    }


ROADS = [
    _road(
        "mg-road-sec-4",
        "MG Road",
        "Section 4",
        "city",
        "critical",
        [{"lat": 12.9758, "lng": 77.6062}, {"lat": 12.9755, "lng": 77.6178}, {"lat": 12.9751, "lng": 77.6265}],
        "RoadBuild Pvt Ltd",
        "BBMP Zone 3",
        2.4,
        1.9,
        "2023-03-12",
        14,
        28,
        ["Repeated potholes", "Drainage failure", "High traffic load"],
    ),
    _road(
        "hosur-road-km-8",
        "Hosur Road",
        "KM 8",
        "national_highway",
        "moderate",
        [{"lat": 12.9321, "lng": 77.6078}, {"lat": 12.9317, "lng": 77.6226}, {"lat": 12.9311, "lng": 77.637}],
        "InfraWorks Consortium",
        "NHAI Bengaluru Unit",
        3.1,
        2.05,
        "2023-08-28",
        7,
        61,
        ["Surface cracks", "Water logging near service lane"],
    ),
    _road(
        "outer-ring-road-n",
        "Outer Ring Road",
        "North",
        "arterial",
        "good",
        [{"lat": 12.985, "lng": 77.5898}, {"lat": 12.9852, "lng": 77.6302}, {"lat": 12.9855, "lng": 77.6701}],
        "CivicGrid Builders",
        "BDA Transport Cell",
        4.8,
        3.6,
        "2024-01-19",
        2,
        87,
        ["Minor shoulder wear"],
    ),
    _road(
        "whitefield-main-rd",
        "Whitefield Main Road",
        "ITPL approach",
        "city",
        "critical",
        [{"lat": 12.9698, "lng": 77.7208}, {"lat": 12.9691, "lng": 77.7356}, {"lat": 12.9684, "lng": 77.7495}],
        "MetroLink Infra",
        "BBMP Mahadevapura",
        3.6,
        2.88,
        "2022-12-18",
        22,
        24,
        ["Construction diversion", "Deep potholes", "Dust and loose gravel"],
    ),
    _road(
        "silk-board-flyover",
        "Silk Board Flyover",
        "Central loop",
        "flyover",
        "critical",
        [{"lat": 12.9178, "lng": 77.6224}, {"lat": 12.9162, "lng": 77.6237}, {"lat": 12.9149, "lng": 77.6254}],
        "SkyWay Repairs LLP",
        "BMRCL Coordination Cell",
        1.9,
        1.66,
        "2022-09-21",
        18,
        31,
        ["Expansion joint failure", "Night visibility issue", "High accident risk"],
    ),
]

COMPLAINTS = [
    {
        "id": "cmp-1001",
        "road_id": "mg-road-sec-4",
        "citizen_name": "Asha Rao",
        "phone": "9000000001",
        "issue_type": "Pothole",
        "description": "Two deep potholes near the signal are slowing traffic and damaging two-wheelers.",
        "latitude": 12.9754,
        "longitude": 77.6166,
        "status": "Assigned",
        "created_at": datetime(2026, 5, 17, 18, 30),
        "ai_priority": "Critical",
        "assigned_to": "BBMP Zone 3",
    }
]

CONTRACTORS = [
    {"name": "RoadBuild Pvt Ltd", "rating": 2.9, "completed_projects": 22, "pending_audits": 4, "risk_level": "high"},
    {"name": "InfraWorks Consortium", "rating": 3.8, "completed_projects": 31, "pending_audits": 1, "risk_level": "medium"},
    {"name": "CivicGrid Builders", "rating": 4.3, "completed_projects": 41, "pending_audits": 1, "risk_level": "low"},
    {"name": "MetroLink Infra", "rating": 2.7, "completed_projects": 18, "pending_audits": 5, "risk_level": "high"},
]

BUDGETS = [
    {"ward": "East", "allocated_crore": 12.5, "spent_crore": 9.8, "fiscal_year": 2026},
    {"ward": "West", "allocated_crore": 9.4, "spent_crore": 7.9, "fiscal_year": 2026},
    {"ward": "North", "allocated_crore": 11.8, "spent_crore": 8.2, "fiscal_year": 2026},
    {"ward": "South", "allocated_crore": 10.1, "spent_crore": 9.3, "fiscal_year": 2026},
]

ALERTS = [
    {
        "id": "alert-1001",
        "title": "Critical degradation on Whitefield Main Road",
        "message": "AI risk engine flagged sharp quality drop and complaint spikes.",
        "severity": "high",
        "status": "active",
        "created_at": datetime.utcnow(),
    }
]
