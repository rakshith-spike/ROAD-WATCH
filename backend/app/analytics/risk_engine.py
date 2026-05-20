def road_risk_score(quality_score: int, complaints: int, status: str) -> float:
    status_weight = {
        "critical": 25,
        "construction": 12,
        "moderate": 6,
        "good": 0,
    }.get(status, 0)
    return round((100 - quality_score) + (complaints * 1.4) + status_weight, 2)


def risk_level(score: float) -> str:
    if score >= 90:
        return "critical"
    if score >= 70:
        return "high"
    if score >= 45:
        return "medium"
    return "low"
