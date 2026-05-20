from fastapi import APIRouter, File, UploadFile

from app.cv.placeholders import classify_road_damage

router = APIRouter(prefix="/cv", tags=["computer-vision"])


@router.post("/detect-damage")
async def detect_damage(image: UploadFile = File(...)) -> dict:
    image_bytes = await image.read()
    result = await classify_road_damage(image_bytes)
    return result.model_dump()
