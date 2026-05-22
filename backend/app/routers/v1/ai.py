from datetime import datetime
from math import asin, cos, radians, sin, sqrt

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.ai.engine import groq_chat
from app.database.mongodb import get_database
from app.repositories.road_repository import RoadRepository
from app.schemas.ai import (
    ChatRequest,
    ChatResponse,
    ComplaintMetadataDraft,
    GeoLocationDraft,
    ImageAnalysisResponse,
    RiskScoringResponse,
    SmartComplaintDraftResponse,
)
from app.services.ai_service import AIService
from app.services.image_analysis import normalize_image_analysis

router = APIRouter(prefix="/ai", tags=["ai"])


def _distance_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    radius = 6371
    d_lat = radians(lat2 - lat1)
    d_lng = radians(lng2 - lng1)
    a = sin(d_lat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lng / 2) ** 2
    return 2 * radius * asin(sqrt(a))


def _nearest_road(roads: list[dict], latitude: float, longitude: float) -> dict:
    return min(
        roads,
        key=lambda road: _distance_km(latitude, longitude, road["center"]["lat"], road["center"]["lng"]),
    )


def _selected_or_first_road(roads: list[dict], road_id: str | None) -> dict:
    if not roads:
        raise HTTPException(status_code=404, detail="No road records available for complaint routing")
    if road_id:
        selected = next((road for road in roads if road["id"] == road_id), None)
        if selected:
            return selected
    return roads[0]


def _priority(severity: str, damage_type: str) -> str:
    lower = f"{severity} {damage_type}".lower()
    if any(word in lower for word in ["critical", "collapse", "water damage"]):
        return "Emergency"
    if any(word in lower for word in ["high", "pothole", "crack"]):
        return "Immediate Action"
    return "Normal"


def _road_context(roads: list[dict], road_id: str | None) -> str:
    selected = [road for road in roads if road["id"] == road_id] if road_id else roads[:8]
    return "\n".join(
        (
            f"{road['name']} {road['section']}: status={road['status']}, score={road['quality_score']}, "
            f"complaints={road['complaints']}, contractor={road['contractor']}, authority={road['authority']}, "
            f"budget={road['sanctioned_budget_crore']}Cr, spent={road['amount_spent_crore']}Cr"
        )
        for road in selected
    )


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> ChatResponse:
    db = get_database()
    roads = [item async for item in db.roads.find({}, {"_id": 0})]
    session_id = payload.road_id or "global"
    context = _road_context(roads, payload.road_id)

    answer = ""
    suggestions: list[str] = []
    mode = "fallback"

    try:
        groq_result = await groq_chat(
            messages=[{"role": "user", "content": payload.message}],
            road_context=context,
            session_id=session_id,
        )
        if groq_result.get("reply"):
            answer = groq_result["reply"]
            suggestions = groq_result.get("suggestions", [])
            mode = groq_result.get("mode", "groq")
    except Exception:
        answer = ""

    if not answer:
        service = AIService()
        answer, mode = await service.answer(payload.message, roads, payload.road_id, payload.language, session_id=session_id)
        suggestions = [
            "Which road needs urgent intervention this week?",
            "Show contractor and budget risks for the worst corridor.",
            "Draft a citizen advisory for critical road complaints.",
        ]

    await db.ai_history.insert_one(
        {
            "user_id": "anonymous",
            "road_id": payload.road_id,
            "question": payload.message,
            "answer": answer,
            "suggestions": suggestions,
            "mode": mode,
            "created_at": datetime.utcnow(),
        }
    )

    return ChatResponse(answer=answer, suggestions=suggestions, sources=["MongoDB roads", "MongoDB complaints"], mode=mode)


@router.post("/analyze-image", response_model=ImageAnalysisResponse)
async def analyze_image(image: UploadFile = File(...), location_hint: str | None = Form(default=None)) -> ImageAnalysisResponse:
    service = AIService()
    image_bytes = await image.read()
    raw, mode = await service.analyze_image(image_bytes, image.content_type or "image/jpeg", location_hint)
    return normalize_image_analysis(raw, mode)


@router.post("/smart-complaint-draft", response_model=SmartComplaintDraftResponse)
async def smart_complaint_draft(
    image: UploadFile = File(...),
    latitude: float | None = Form(default=None),
    longitude: float | None = Form(default=None),
    road_id: str | None = Form(default=None),
) -> SmartComplaintDraftResponse:
    db = get_database()
    roads = [item async for item in db.roads.find({}, {"_id": 0})]
    has_gps = latitude is not None and longitude is not None
    road = _nearest_road(roads, latitude, longitude) if has_gps else _selected_or_first_road(roads, road_id)

    location_hint = (
        f"Actual GPS: {latitude}, {longitude}; nearest RoadWatch road: {road['name']} {road['section']}"
        if has_gps
        else f"GPS not available yet; selected RoadWatch road: {road['name']} {road['section']}"
    )

    service = AIService()
    image_bytes = await image.read()
    raw, mode = await service.analyze_image(image_bytes, image.content_type or "image/jpeg", location_hint)
    analysis = normalize_image_analysis(raw, mode)
    if analysis.mode == "fallback" and analysis.confidence == 0:
        raise HTTPException(status_code=502, detail=analysis.suggested_action)

    now = datetime.now()
    priority = _priority(analysis.severity, analysis.damage_type)
    place_name = f"{road['name']} {road['section']}"
    area = road["authority"].replace("BBMP ", "")
    city = "Bengaluru"
    state = "Karnataka"
    coordinates = f"{latitude}, {longitude}" if has_gps else "Location permission required"
    location_line = "Current GPS location" if has_gps else f"Selected road: {place_name}"

    generated_description = (
        "Road damage detected.\n\n"
        f"Damage Type: {analysis.damage_type}\n"
        f"Severity: {analysis.severity}\n\n"
        "Location:\n"
        f"{location_line},\n"
        f"{city}\n"
        f"Nearest road for routing: {place_name}\n\n"
        "Coordinates:\n"
        f"{coordinates}\n\n"
        "Issue detected at:\n"
        f"{now.strftime('%d-%m-%Y')}\n{now.strftime('%I:%M %p')}\n\n"
        f"Recommended Action:\n{analysis.suggested_action}"
    )

    return SmartComplaintDraftResponse(
        road_id=road["id"],
        complaint_type=analysis.damage_type,
        severity=analysis.severity,
        confidence=analysis.confidence,
        priority=priority,
        recommended_action=analysis.suggested_action,
        generated_description=generated_description,
        location=GeoLocationDraft(
            latitude=latitude if has_gps else None,
            longitude=longitude if has_gps else None,
            geo_coordinates=coordinates,
            place_name=f"{location_line}, {city}",
            area=area,
            ward_name=road["authority"],
            road_name=place_name,
            district=city,
            city=city,
            state=state,
        ),
        metadata=ComplaintMetadataDraft(
            date=now.strftime("%d-%m-%Y"),
            time=now.strftime("%I:%M %p"),
            timestamp=now.isoformat(timespec="seconds"),
        ),
        ai_mode=mode,
    )


@router.get("/road-risk/{road_id}", response_model=RiskScoringResponse)
async def road_risk(road_id: str) -> RiskScoringResponse:
    db = get_database()
    road = await RoadRepository(db).get_by_id(road_id)
    if not road:
        raise HTTPException(status_code=404, detail="Road not found")

    from app.analytics.risk_engine import risk_level, road_risk_score

    score = road_risk_score(road["quality_score"], road["complaints"], road["status"])
    recommendation = (
        "Escalate to emergency maintenance queue."
        if score >= 90
        else "Schedule contractor inspection and preventive maintenance within one week."
    )
    return RiskScoringResponse(
        road_id=road["id"],
        road_name=f"{road['name']} {road['section']}",
        risk_score=score,
        risk_level=risk_level(score),
        recommendation=recommendation,
    )
