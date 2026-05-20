from app.schemas.ai import ImageAnalysisResponse


DAMAGE_TYPES = {
    "crack": "cracks",
    "water": "flooding",
    "flood": "flooding",
    "debris": "debris",
    "marking": "faded markings",
}


def normalize_image_analysis(raw_text: str, mode: str) -> ImageAnalysisResponse:
    lower = raw_text.lower()

    damage_type = "potholes"
    for keyword, value in DAMAGE_TYPES.items():
        if keyword in lower:
            damage_type = value
            break

    severity = "Critical" if any(word in lower for word in ["critical", "danger", "severe", "deep"]) else "Moderate"

    return ImageAnalysisResponse(
        damage_type=damage_type,
        severity=severity,
        confidence=0.86 if mode == "gemini" else 0.62,
        suggested_action="Barricade the segment, assign inspection, and start time-bound maintenance.",
        summary=raw_text[:700],
        mode=mode,
    )
