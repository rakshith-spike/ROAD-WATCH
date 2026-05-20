from fastapi import APIRouter, Depends

from app.auth.rbac import require_roles
from app.schemas.alerts import Alert, AlertCreate
from app.services.alert_service import AlertService
from app.services.factory import get_alert_service

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=list[Alert])
async def list_alerts(
    severity: str | None = None,
    status: str | None = None,
    service: AlertService = Depends(get_alert_service),
) -> list[Alert]:
    alerts = await service.list_alerts(severity, status)
    return [Alert(**item) for item in alerts]


@router.post("", response_model=Alert)
async def create_alert(
    payload: AlertCreate,
    _: dict = Depends(require_roles("government_admin", "super_admin")),
    service: AlertService = Depends(get_alert_service),
) -> Alert:
    alert = await service.create_alert(payload.model_dump())
    return Alert(**alert)
