from motor.motor_asyncio import AsyncIOMotorDatabase

from app.utils.pagination import pagination_skip_limit


class ComplaintRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.collection = db.complaints

    async def list_complaints(
        self,
        status: str | None = None,
        priority: str | None = None,
        page: int = 1,
        page_size: int = 50,
    ) -> tuple[list[dict], int]:
        query: dict = {}
        if status:
            query["status"] = status
        if priority:
            query["ai_priority"] = priority

        skip, limit = pagination_skip_limit(page, page_size)
        cursor = self.collection.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit)
        items = [item async for item in cursor]
        total = await self.collection.count_documents(query)
        return items, total

    async def create(self, payload: dict) -> dict:
        await self.collection.insert_one(payload)
        return payload

    async def update(self, complaint_id: str, update_data: dict) -> dict | None:
        await self.collection.update_one({"id": complaint_id}, {"$set": update_data})
        return await self.collection.find_one({"id": complaint_id}, {"_id": 0})
