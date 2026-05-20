from pydantic import BaseModel


class DamageDetectionResult(BaseModel):
    damage_type: str
    severity: str
    confidence: float
    model_name: str


async def classify_road_damage(_: bytes) -> DamageDetectionResult:
    # Placeholder for future YOLOv8/OpenCV inference pipeline.
    return DamageDetectionResult(
        damage_type="potholes",
        severity="moderate",
        confidence=0.51,
        model_name="placeholder-yolov8",
    )
