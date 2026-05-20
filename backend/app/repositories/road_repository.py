from motor.motor_asyncio import AsyncIOMotorDatabase

from app.utils.pagination import pagination_skip_limit


class RoadRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.collection = db.roads

    async def list_roads(
        self,
        status: str | None = None,
        road_type: str | None = None,
        page: int = 1,
        page_size: int = 50,
        sort_by: str = "quality_score",
        sort_order: int = 1,
    ) -> tuple[list[dict], int]:
        query: dict = {}
        if status:
            query["status"] = status
        if road_type:
            query["road_type"] = road_type

        skip, limit = pagination_skip_limit(page, page_size)
        cursor = self.collection.find(query, {"_id": 0}).sort(sort_by, sort_order).skip(skip).limit(limit)
        items = [item async for item in cursor]
        total = await self.collection.count_documents(query)
        return items, total

    async def get_by_id(self, road_id: str) -> dict | None:
        return await self.collection.find_one({"id": road_id}, {"_id": 0})

    async def create(self, payload: dict) -> dict:
        await self.collection.insert_one(payload)
        return payload

    async def update(self, road_id: str, update_data: dict) -> dict | None:
        await self.collection.update_one({"id": road_id}, {"$set": update_data})
        return await self.get_by_id(road_id)
