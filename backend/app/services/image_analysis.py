import json
import re

from app.schemas.ai import ImageAnalysisResponse

VALID_DAMAGE_TYPES = [
    "Pothole",
    "Road Crack",
    "Road Debris",
    "Surface Damage",
    "Water Damage",
    "Road Collapse",
    "No Road Damage",
]

SEVERITY_LEVELS = ["Critical", "High", "Moderate", "Low", "Needs Review"]

DAMAGE_PATTERNS = [
    (r"\bpotholes?\b|\broad hole\b|\bdeep hole\b", "Pothole"),
    (r"\broad cracks?\b|\bcracks?\b|\blinear crack\b", "Road Crack"),
    (r"\bdebris\b|\bstones?\b|\bgarbage\b|\bfallen material\b", "Road Debris"),
    (r"\bwater damage\b|\bwaterlogging\b|\bwater logging\b|\bflood(?:ing)?\b", "Water Damage"),
    (r"\broad collapse\b|\bcollapsed\b|\bsinkhole\b|\bsevere road failure\b", "Road Collapse"),
    (r"\bsurface damage\b|\buneven road\b|\bbroken surface\b", "Surface Damage"),
    (r"\bno road damage\b|\bno visible damage\b", "No Road Damage"),
]


def _parse_json(raw_text: str) -> dict | None:
    text = raw_text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?", "", text).strip()
        text = re.sub(r"```$", "", text).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            return None
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            return None


def _pick_damage_type(raw_text: str, parsed: dict | None) -> str:
    if parsed:
        value = str(parsed.get("damage_type", "")).strip().lower()
        for damage_type in VALID_DAMAGE_TYPES:
            if value == damage_type.lower():
                return damage_type

    lower = raw_text.lower()
    for pattern, damage_type in DAMAGE_PATTERNS:
        if re.search(pattern, lower):
            return damage_type
    return "Needs Review"


def _pick_severity(raw_text: str, parsed: dict | None, damage_type: str) -> str:
    if damage_type in {"No Road Damage", "Needs Review"}:
        return "Needs Review"

    if parsed:
        value = str(parsed.get("severity", "")).strip().lower()
        for severity in SEVERITY_LEVELS:
            if value == severity.lower():
                return severity

    lower = raw_text.lower()
    if any(word in lower for word in ["critical", "collapse", "collapsed", "danger", "severe"]):
        return "Critical"
    if any(word in lower for word in ["high", "deep", "large", "major"]):
        return "High"
    if any(word in lower for word in ["low", "minor", "small"]):
        return "Low"
    return "Moderate"


def _pick_confidence(parsed: dict | None, mode: str) -> float:
    if parsed:
        try:
            value = float(parsed.get("confidence", 0))
            return round(value / 100, 2) if value > 1 else round(value, 2)
        except (TypeError, ValueError):
            pass
    return 0.82 if mode in {"grok", "gemini"} else 0.62 if mode in {"local", "fallback"} else 0.0


def normalize_image_analysis(raw_text: str, mode: str) -> ImageAnalysisResponse:
    if raw_text.startswith("AI_VISION_UNAVAILABLE"):
        return ImageAnalysisResponse(
            damage_type="Needs Review",
            severity="Needs Review",
            confidence=0.0,
            suggested_action="AI vision could not analyze this image. Check the configured vision key/model and try again.",
            summary=raw_text[:700],
            mode="fallback",
        )

    parsed = _parse_json(raw_text)
    damage_type = _pick_damage_type(raw_text, parsed)
    severity = _pick_severity(raw_text, parsed, damage_type)
    confidence = _pick_confidence(parsed, mode)
    suggested_action = str(parsed.get("suggested_action", "")) if parsed else ""
    summary = str(parsed.get("summary", "")) if parsed else ""

    if not suggested_action:
        suggested_action = "Inspect the reported location and schedule road maintenance based on severity."
    if not summary:
        summary = raw_text[:700]

    return ImageAnalysisResponse(
        damage_type=damage_type,
        severity=severity,
        confidence=confidence,
        suggested_action=suggested_action[:300],
        summary=summary[:700],
        mode=mode,
    )
