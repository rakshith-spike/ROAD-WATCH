from datetime import datetime
from uuid import uuid4

from app.repositories.alert_repository import AlertRepository


class AlertService:
    def __init__(self, repository: AlertRepository) -> None:
        self.repository = repository

    async def list_alerts(self, severity: str | None, status: str | None) -> list[dict]:
        return await self.repository.list_alerts(severity, status)

    async def create_alert(self, payload: dict) -> dict:
        alert = {
            "id": f"alert-{uuid4().hex[:8]}",
            "title": payload["title"],
            "message": payload["message"],
            "severity": payload["severity"],
            "status": payload.get("status", "active"),
            "created_at": datetime.utcnow(),
        }
        return await self.repository.create(alert)
