from datetime import datetime

from pydantic import BaseModel, Field


class Alert(BaseModel):
    id: str
    title: str
    message: str
    severity: str
    status: str
    created_at: datetime


class AlertCreate(BaseModel):
    title: str = Field(min_length=4, max_length=180)
    message: str = Field(min_length=4, max_length=600)
    severity: str = Field(pattern="^(low|medium|high|critical)$")
    status: str = Field(default="active", pattern="^(active|resolved)$")
