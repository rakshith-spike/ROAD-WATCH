from fastapi import APIRouter, Query

from app.services.intelligence_service import (
    generate_intelligence_alerts,
    generate_intelligence_roads,
    intelligence_snapshot,
)

router = APIRouter(prefix="/intelligence", tags=["intelligence"])


@router.get("/roads")
async def roads(limit: int = Query(default=120, ge=40, le=200)) -> list[dict]:
    return generate_intelligence_roads(total=limit)


@router.get("/alerts")
async def alerts(
    limit: int = Query(default=90, ge=20, le=150),
    severity: str | None = Query(default=None),
) -> list[dict]:
    rows = generate_intelligence_roads(total=120)
    items = generate_intelligence_alerts(rows, limit=limit)
    if severity:
        normalized = severity.lower().strip()
        items = [item for item in items if item["severity"] == normalized]
    return items


@router.get("/snapshot")
async def snapshot(limit: int = Query(default=120, ge=40, le=200)) -> dict:
    return intelligence_snapshot(limit=limit)
