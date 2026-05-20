from typing import TypedDict


class RoadDocument(TypedDict, total=False):
    id: str
    name: str
    section: str
    road_type: str
    status: str
    coordinates: list[dict]
    center: dict
    contractor: str
    authority: str
    sanctioned_budget_crore: float
    amount_spent_crore: float
    last_repair: str
    complaints: int
    quality_score: int
    risk_factors: list[str]
