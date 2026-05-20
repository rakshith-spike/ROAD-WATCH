from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=2, max_length=1000)
    road_id: str | None = None
    language: str = "en"


class ChatResponse(BaseModel):
    answer: str
    sources: list[str]
    mode: str


class ImageAnalysisResponse(BaseModel):
    damage_type: str
    severity: str
    confidence: float
    suggested_action: str
    summary: str
    mode: str


class RiskScoringResponse(BaseModel):
    road_id: str
    road_name: str
    risk_score: float
    risk_level: str
    recommendation: str
