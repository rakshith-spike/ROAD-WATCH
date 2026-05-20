from motor.motor_asyncio import AsyncIOMotorDatabase


class AlertRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.collection = db.alerts

    async def list_alerts(self, severity: str | None = None, status: str | None = None) -> list[dict]:
        query: dict = {}
        if severity:
            query["severity"] = severity
        if status:
            query["status"] = status
        cursor = self.collection.find(query, {"_id": 0}).sort("created_at", -1)
        return [item async for item in cursor]

    async def create(self, payload: dict) -> dict:
        await self.collection.insert_one(payload)
        return payload
