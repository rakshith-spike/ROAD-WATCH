from datetime import datetime

from pydantic import BaseModel, Field


class ComplaintCreate(BaseModel):
    road_id: str
    citizen_name: str = Field(min_length=2, max_length=80)
    phone: str = Field(min_length=6, max_length=20)
    issue_type: str
    description: str = Field(min_length=8, max_length=1000)
    latitude: float
    longitude: float


class Complaint(ComplaintCreate):
    id: str
    status: str
    created_at: datetime
    ai_priority: str
    assigned_to: str


class ComplaintUpdate(BaseModel):
    status: str | None = None
    assigned_to: str | None = None
