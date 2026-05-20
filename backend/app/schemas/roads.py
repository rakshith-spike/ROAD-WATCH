from datetime import date
from enum import Enum

from pydantic import BaseModel, Field

from app.schemas.common import Coordinates


class RoadStatus(str, Enum):
    good = "good"
    moderate = "moderate"
    critical = "critical"
    construction = "construction"


class RoadType(str, Enum):
    city = "city"
    arterial = "arterial"
    state_highway = "state_highway"
    national_highway = "national_highway"
    flyover = "flyover"
    underpass = "underpass"


class RepairEvent(BaseModel):
    date: date
    work: str
    cost_crore: float
    status: str


class RoadBase(BaseModel):
    name: str
    section: str
    road_type: RoadType
    status: RoadStatus
    coordinates: list[Coordinates]
    center: Coordinates
    contractor: str
    authority: str
    sanctioned_budget_crore: float
    amount_spent_crore: float
    last_repair: date
    complaints: int
    quality_score: int = Field(ge=0, le=100)
    risk_factors: list[str]


class Road(RoadBase):
    id: str


class RoadCreate(RoadBase):
    id: str = Field(min_length=4, max_length=64)


class RoadUpdate(BaseModel):
    status: RoadStatus | None = None
    complaints: int | None = Field(default=None, ge=0)
    quality_score: int | None = Field(default=None, ge=0, le=100)
    amount_spent_crore: float | None = None
    risk_factors: list[str] | None = None
