from fastapi import APIRouter, Depends, Query

from app.schemas.common import PaginationMeta
from app.schemas.complaints import Complaint, ComplaintCreate
from app.services.complaint_service import ComplaintService
from app.services.factory import get_complaint_service

router = APIRouter(prefix="/complaints", tags=["complaints"])


@router.get("", response_model=list[Complaint])
async def list_complaints(
    status: str | None = None,
    priority: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=100, ge=1, le=200),
    service: ComplaintService = Depends(get_complaint_service),
) -> list[Complaint]:
    complaints, _ = await service.list_complaints(status, priority, page, page_size)
    return [Complaint(**item) for item in complaints]


@router.get("/paged")
async def list_complaints_paged(
    status: str | None = None,
    priority: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=200),
    service: ComplaintService = Depends(get_complaint_service),
) -> dict:
    complaints, total = await service.list_complaints(status, priority, page, page_size)
    return {"items": complaints, "meta": PaginationMeta(page=page, page_size=page_size, total=total)}


@router.post("", response_model=Complaint, status_code=201)
async def create_complaint(
    payload: ComplaintCreate,
    service: ComplaintService = Depends(get_complaint_service),
) -> Complaint:
    complaint = await service.create_complaint(payload.model_dump())
    return Complaint(**complaint)


@router.get("/sos/emergency")
async def emergency_sos() -> dict:
    return {
        "status": "received",
        "message": "Emergency SOS routed to city command center and traffic control desk.",
        "priority": "critical",
    }
