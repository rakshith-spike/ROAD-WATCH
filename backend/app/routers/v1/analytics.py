from fastapi import APIRouter, Depends

from app.analytics.risk_engine import risk_level, road_risk_score
from app.schemas.analytics import AnalyticsSummary, ContractorScore
from app.services.analytics_service import AnalyticsService
from app.services.factory import get_analytics_service, get_road_service
from app.services.road_service import RoadService

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
async def summary(service: AnalyticsService = Depends(get_analytics_service)) -> AnalyticsSummary:
    data = await service.summary()
    return AnalyticsSummary(**data)


@router.get("/contractors", response_model=list[ContractorScore])
async def contractor_scores(service: AnalyticsService = Depends(get_analytics_service)) -> list[ContractorScore]:
    items = await service.contractor_scores()
    return [ContractorScore(**item) for item in items]


@router.get("/monthly-trends")
async def monthly_trends(service: AnalyticsService = Depends(get_analytics_service)) -> list[dict]:
    return await service.monthly_trends()


@router.get("/risk-cards")
async def risk_cards(road_service: RoadService = Depends(get_road_service)) -> list[dict]:
    roads, _ = await road_service.list_roads(status=None, road_type=None, page=1, page_size=200, sort_by="quality_score", sort_order="asc")
    cards = []
    for road in roads:
        score = road_risk_score(road["quality_score"], road["complaints"], road["status"])
        cards.append(
            {
                "road_id": road["id"],
                "road_name": f"{road['name']} {road['section']}",
                "risk_score": score,
                "risk_level": risk_level(score),
                "predictive_note": "Failure risk rises quickly if monsoon drainage maintenance is delayed.",
            }
        )
    return sorted(cards, key=lambda item: item["risk_score"], reverse=True)[:6]
