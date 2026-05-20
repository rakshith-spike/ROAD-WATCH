from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import get_settings


class MongoManager:
    def __init__(self) -> None:
        self.client: AsyncIOMotorClient | None = None
        self.db: AsyncIOMotorDatabase | None = None

    async def connect(self) -> None:
        settings = get_settings()
        self.client = AsyncIOMotorClient(settings.mongo_uri)
        self.db = self.client[settings.mongo_db_name]

    async def disconnect(self) -> None:
        if self.client:
            self.client.close()
            self.client = None
            self.db = None

    def get_db(self) -> AsyncIOMotorDatabase:
        if self.db is None:
            raise RuntimeError("Database not initialized. Call connect() first.")
        return self.db


mongo_manager = MongoManager()


def get_database() -> AsyncIOMotorDatabase:
    return mongo_manager.get_db()
