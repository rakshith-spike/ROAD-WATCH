from motor.motor_asyncio import AsyncIOMotorDatabase


class UserRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.collection = db.users

    async def get_by_email(self, email: str) -> dict | None:
        return await self.collection.find_one({"email": email})

    async def get_by_id(self, user_id: str) -> dict | None:
        return await self.collection.find_one({"id": user_id})

    async def create(self, payload: dict) -> dict:
        await self.collection.insert_one(payload)
        return payload

    async def store_refresh_token(self, user_id: str, refresh_token: str) -> None:
        await self.collection.update_one({"id": user_id}, {"$set": {"refresh_token": refresh_token}})
