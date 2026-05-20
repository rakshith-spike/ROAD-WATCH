from fastapi import APIRouter, Depends, File, Form, UploadFile

from app.database.mongodb import get_database
from app.repositories.road_repository import RoadRepository
from app.schemas.ai import ChatRequest, ChatResponse, ImageAnalysisResponse, RiskScoringResponse
from app.services.ai_service import AIService
from app.services.image_analysis import normalize_image_analysis

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> ChatResponse:
    db = get_database()
    roads = [item async for item in db.roads.find({}, {"_id": 0})]
    service = AIService()
    answer, mode = await service.answer(payload.message, roads, payload.road_id, payload.language)

    await db.ai_history.insert_one(
        {
            "user_id": "anonymous",
            "road_id": payload.road_id,
            "question": payload.message,
            "answer": answer,
            "mode": mode,
            "created_at": __import__("datetime").datetime.utcnow(),
        }
    )

    return ChatResponse(answer=answer, sources=["MongoDB roads", "MongoDB complaints"], mode=mode)


@router.post("/analyze-image", response_model=ImageAnalysisResponse)
async def analyze_image(image: UploadFile = File(...), location_hint: str | None = Form(default=None)) -> ImageAnalysisResponse:
    service = AIService()
    image_bytes = await image.read()
    raw, mode = await service.analyze_image(image_bytes, image.content_type or "image/jpeg", location_hint)
    return normalize_image_analysis(raw, mode)


@router.get("/road-risk/{road_id}", response_model=RiskScoringResponse)
async def road_risk(road_id: str) -> RiskScoringResponse:
    db = get_database()
    road = await RoadRepository(db).get_by_id(road_id)
    if not road:
        from fastapi import HTTPException

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
