from motor.motor_asyncio import AsyncIOMotorDatabase


class AnalyticsRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.db = db

    async def summary(self) -> dict:
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "roads_monitored": {"$sum": 1},
                    "avg_quality_score": {"$avg": "$quality_score"},
                    "active_complaints": {"$sum": "$complaints"},
                    "sanctioned_budget_crore": {"$sum": "$sanctioned_budget_crore"},
                    "amount_spent_crore": {"$sum": "$amount_spent_crore"},
                    "critical_roads": {
                        "$sum": {"$cond": [{"$eq": ["$status", "critical"]}, 1, 0]}
                    },
                }
            }
        ]
        result = await self.db.roads.aggregate(pipeline).to_list(length=1)
        return result[0] if result else {}

    async def contractor_scores(self) -> list[dict]:
        pipeline = [
            {
                "$project": {
                    "_id": 0,
                    "contractor": "$contractor",
                    "road": {"$concat": ["$name", ", ", "$section"]},
                    "quality_score": "$quality_score",
                    "complaints": "$complaints",
                    "budget_utilization": {
                        "$round": [
                            {
                                "$multiply": [
                                    {"$divide": ["$amount_spent_crore", "$sanctioned_budget_crore"]},
                                    100,
                                ]
                            },
                            1,
                        ]
                    },
                }
            },
            {"$sort": {"quality_score": 1, "complaints": -1}},
        ]
        return await self.db.roads.aggregate(pipeline).to_list(length=200)

    async def monthly_trends(self) -> list[dict]:
        cursor = self.db.analytics.find({}, {"_id": 0}).sort("month", 1)
        return [item async for item in cursor]
