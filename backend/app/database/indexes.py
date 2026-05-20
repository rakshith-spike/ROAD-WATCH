from motor.motor_asyncio import AsyncIOMotorDatabase


async def create_indexes(db: AsyncIOMotorDatabase) -> None:
    await db.users.create_index("email", unique=True)
    await db.users.create_index("role")

    await db.roads.create_index("id", unique=True)
    await db.roads.create_index([("status", 1), ("road_type", 1)])
    await db.roads.create_index([("center.lat", 1), ("center.lng", 1)])

    await db.complaints.create_index("id", unique=True)
    await db.complaints.create_index([("road_id", 1), ("created_at", -1)])
    await db.complaints.create_index([("status", 1), ("ai_priority", 1)])

    await db.contractors.create_index("name", unique=True)
    await db.alerts.create_index([("severity", 1), ("created_at", -1)])
    await db.ai_history.create_index([("user_id", 1), ("created_at", -1)])
    await db.maintenance_logs.create_index([("road_id", 1), ("date", -1)])
