from fastapi import APIRouter, Depends, Query

from app.services.factory import get_road_service
from app.services.road_service import RoadService

router = APIRouter(prefix="/geospatial", tags=["geospatial"])


@router.get("/nearby-issues")
async def nearby_issues(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    radius_km: float = Query(default=3.0, gt=0, le=20),
    service: RoadService = Depends(get_road_service),
) -> list[dict]:
    return await service.nearby_issues(lat, lng, radius_km)
