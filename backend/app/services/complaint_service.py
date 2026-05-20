from datetime import datetime
from uuid import uuid4

from fastapi import HTTPException

from app.repositories.complaint_repository import ComplaintRepository
from app.repositories.road_repository import RoadRepository
from app.utils.sanitize import sanitize_text


class ComplaintService:
    def __init__(self, complaint_repo: ComplaintRepository, road_repo: RoadRepository) -> None:
        self.complaint_repo = complaint_repo
        self.road_repo = road_repo

    async def list_complaints(
        self,
        status: str | None,
        priority: str | None,
        page: int,
        page_size: int,
    ) -> tuple[list[dict], int]:
        return await self.complaint_repo.list_complaints(status, priority, page, page_size)

    async def create_complaint(self, payload: dict) -> dict:
        road = await self.road_repo.get_by_id(payload["road_id"])
        if not road:
            raise HTTPException(status_code=404, detail="Road not found")

        payload["description"] = sanitize_text(payload["description"])
        payload["id"] = f"cmp-{uuid4().hex[:8]}"
        payload["created_at"] = datetime.utcnow()
        payload["status"] = "Assigned"

        issue_type = payload["issue_type"].lower()
        payload["ai_priority"] = (
            "Critical"
            if road["quality_score"] < 35 or issue_type in {"pothole", "accident risk", "flooding"}
            else "Moderate"
        )
        payload["assigned_to"] = road["authority"]

        created = await self.complaint_repo.create(payload)

        new_complaint_count = max(0, int(road["complaints"]) + 1)
        next_quality = max(0, road["quality_score"] - (3 if payload["ai_priority"] == "Critical" else 1))
        await self.road_repo.update(
            road_id=road["id"],
            update_data={"complaints": new_complaint_count, "quality_score": next_quality},
        )

        return created
