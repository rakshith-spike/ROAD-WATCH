from fastapi import APIRouter, Depends, Query

from app.auth.rbac import require_roles
from app.schemas.common import PaginationMeta
from app.schemas.roads import Road, RoadCreate, RoadUpdate
from app.services.factory import get_road_service
from app.services.road_service import RoadService

router = APIRouter(prefix="/roads", tags=["roads"])


@router.get("", response_model=list[Road])
async def list_roads(
    status: str | None = None,
    road_type: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=100, ge=1, le=200),
    sort_by: str = "quality_score",
    sort_order: str = Query(default="asc", pattern="^(asc|desc)$"),
    service: RoadService = Depends(get_road_service),
) -> list[Road]:
    roads, _ = await service.list_roads(status, road_type, page, page_size, sort_by, sort_order)
    return [Road(**road) for road in roads]


@router.get("/paged")
async def list_roads_paged(
    status: str | None = None,
    road_type: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=200),
    sort_by: str = "quality_score",
    sort_order: str = Query(default="asc", pattern="^(asc|desc)$"),
    service: RoadService = Depends(get_road_service),
) -> dict:
    roads, total = await service.list_roads(status, road_type, page, page_size, sort_by, sort_order)
    return {"items": roads, "meta": PaginationMeta(page=page, page_size=page_size, total=total)}


@router.get("/{road_id}", response_model=Road)
async def get_road(road_id: str, service: RoadService = Depends(get_road_service)) -> Road:
    return Road(**(await service.get_road(road_id)))


@router.post("", response_model=Road)
async def create_road(
    payload: RoadCreate,
    _: dict = Depends(require_roles("government_admin", "super_admin")),
    service: RoadService = Depends(get_road_service),
) -> Road:
    road = await service.create_road(payload.model_dump())
    return Road(**road)


@router.patch("/{road_id}", response_model=Road)
async def update_road(
    road_id: str,
    payload: RoadUpdate,
    _: dict = Depends(require_roles("contractor", "government_admin", "super_admin")),
    service: RoadService = Depends(get_road_service),
) -> Road:
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    updated = await service.update_road(road_id, update_data)
    return Road(**updated)
