from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=2, max_length=1000)
    road_id: str | None = None
    language: str = "en"


class ChatResponse(BaseModel):
    answer: str
    sources: list[str]
    mode: str
    suggestions: list[str] = Field(default_factory=list)


class ImageAnalysisResponse(BaseModel):
    damage_type: str
    severity: str
    confidence: float
    suggested_action: str
    summary: str
    mode: str


class GeoLocationDraft(BaseModel):
    latitude: float | None = None
    longitude: float | None = None
    geo_coordinates: str
    place_name: str
    area: str
    ward_name: str
    road_name: str
    district: str
    city: str
    state: str


class ComplaintMetadataDraft(BaseModel):
    date: str
    time: str
    timestamp: str


class SmartComplaintDraftResponse(BaseModel):
    road_id: str
    complaint_type: str
    severity: str
    confidence: float
    priority: str
    recommended_action: str
    generated_description: str
    location: GeoLocationDraft
    metadata: ComplaintMetadataDraft
    ai_mode: str


class RiskScoringResponse(BaseModel):
    road_id: str
    road_name: str
    risk_score: float
    risk_level: str
    recommendation: str
