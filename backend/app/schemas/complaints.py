from datetime import datetime

from pydantic import BaseModel, Field


class ComplaintCreate(BaseModel):
    road_id: str
    citizen_name: str = Field(min_length=2, max_length=80)
    phone: str = Field(min_length=6, max_length=20)
    issue_type: str
    description: str = Field(min_length=8, max_length=1400)
    latitude: float
    longitude: float
    severity: str | None = None
    priority: str | None = None
    location_name: str | None = None
    area: str | None = None
    ward_name: str | None = None
    road_name: str | None = None
    district: str | None = None
    city: str | None = None
    state: str | None = None
    captured_date: str | None = None
    captured_time: str | None = None
    captured_timestamp: str | None = None
    gps_source: str | None = None
    ai_recommended_action: str | None = None


class Complaint(ComplaintCreate):
    id: str
    user_id: str | None = None
    status: str
    created_at: datetime
    ai_priority: str
    assigned_to: str


class ComplaintUpdate(BaseModel):
    status: str | None = None
    assigned_to: str | None = None