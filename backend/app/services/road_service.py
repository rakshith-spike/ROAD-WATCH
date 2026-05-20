from fastapi import HTTPException

from app.geospatial.proximity import haversine_km
from app.repositories.road_repository import RoadRepository


class RoadService:
    def __init__(self, repository: RoadRepository) -> None:
        self.repository = repository

    async def list_roads(
        self,
        status: str | None,
        road_type: str | None,
        page: int,
        page_size: int,
        sort_by: str,
        sort_order: str,
    ) -> tuple[list[dict], int]:
        order = -1 if sort_order == "desc" else 1
        return await self.repository.list_roads(status, road_type, page, page_size, sort_by, order)

    async def get_road(self, road_id: str) -> dict:
        road = await self.repository.get_by_id(road_id)
        if not road:
            raise HTTPException(status_code=404, detail="Road not found")
        return road

    async def create_road(self, payload: dict) -> dict:
        exists = await self.repository.get_by_id(payload["id"])
        if exists:
            raise HTTPException(status_code=409, detail="Road ID already exists")
        return await self.repository.create(payload)

    async def update_road(self, road_id: str, update_data: dict) -> dict:
        road = await self.repository.update(road_id, update_data)
        if not road:
            raise HTTPException(status_code=404, detail="Road not found")
        return road

    async def nearby_issues(self, lat: float, lng: float, radius_km: float = 3.0) -> list[dict]:
        roads, _ = await self.repository.list_roads(page_size=200)
        matches = []
        for road in roads:
            center = road.get("center", {})
            distance = haversine_km(lat, lng, center.get("lat", 0), center.get("lng", 0))
            if distance <= radius_km:
                matches.append({**road, "distance_km": round(distance, 2)})
        return sorted(matches, key=lambda item: item["distance_km"])
