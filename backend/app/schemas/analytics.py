from pydantic import BaseModel


class AnalyticsSummary(BaseModel):
    roads_monitored: int
    avg_quality_score: float
    active_complaints: int
    sanctioned_budget_crore: float
    amount_spent_crore: float
    critical_roads: int
    budget_utilization_percent: float


class ContractorScore(BaseModel):
    contractor: str
    road: str
    quality_score: int
    complaints: int
    budget_utilization: float
