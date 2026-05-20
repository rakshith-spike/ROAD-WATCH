from datetime import datetime

from pydantic import BaseModel, Field


class Coordinates(BaseModel):
    lat: float
    lng: float


class PaginationMeta(BaseModel):
    page: int = Field(ge=1)
    page_size: int = Field(ge=1, le=200)
    total: int = Field(ge=0)


class PaginatedResponse(BaseModel):
    items: list[dict]
    meta: PaginationMeta


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    timestamp: datetime
