from fastapi import APIRouter

from app.database.mongodb import get_database

router = APIRouter(prefix="/contractors", tags=["contractors"])


@router.get("")
async def list_contractors() -> list[dict]:
    db = get_database()
    return [item async for item in db.contractors.find({}, {"_id": 0})]
