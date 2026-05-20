from datetime import datetime

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.data.seed_data import ALERTS, BUDGETS, COMPLAINTS, CONTRACTORS, ROADS


async def seed_database_if_empty(db: AsyncIOMotorDatabase) -> None:
    if await db.roads.count_documents({}) == 0:
        await db.roads.insert_many(ROADS)

    if await db.complaints.count_documents({}) == 0:
        await db.complaints.insert_many(COMPLAINTS)

    if await db.contractors.count_documents({}) == 0:
        await db.contractors.insert_many(CONTRACTORS)

    if await db.budgets.count_documents({}) == 0:
        await db.budgets.insert_many(BUDGETS)

    if await db.alerts.count_documents({}) == 0:
        await db.alerts.insert_many(ALERTS)

    if await db.analytics.count_documents({}) == 0:
        now = datetime.utcnow()
        sample = [
            {"month": "Jan", "complaints": 42, "quality_index": 68, "created_at": now},
            {"month": "Feb", "complaints": 51, "quality_index": 64, "created_at": now},
            {"month": "Mar", "complaints": 58, "quality_index": 61, "created_at": now},
            {"month": "Apr", "complaints": 47, "quality_index": 66, "created_at": now},
            {"month": "May", "complaints": 63, "quality_index": 59, "created_at": now},
        ]
        await db.analytics.insert_many(sample)
