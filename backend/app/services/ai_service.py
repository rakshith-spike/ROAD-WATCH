from app.ai.memory import memory_store
from app.ai.prompts import chat_prompt, image_prompt
from app.analytics.risk_engine import risk_level, road_risk_score
from app.core.config import get_settings


class AIService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.client = None
        if self.settings.resolved_gemini_key:
            try:
                from google import genai

                self.client = genai.Client(api_key=self.settings.resolved_gemini_key)
            except Exception:
                self.client = None

    @property
    def mode(self) -> str:
        return "gemini" if self.client else "fallback"

    def _road_context(self, roads: list[dict], road_id: str | None = None) -> str:
        selected = [road for road in roads if road["id"] == road_id] if road_id else roads
        return "\n".join(
            [
                (
                    f"{road['name']} {road['section']}: type={road['road_type']}, status={road['status']}, "
                    f"score={road['quality_score']}, complaints={road['complaints']}, "
                    f"contractor={road['contractor']}, authority={road['authority']}, "
                    f"budget={road['sanctioned_budget_crore']}Cr, spent={road['amount_spent_crore']}Cr"
                )
                for road in selected
            ]
        )

    def _fallback_answer(self, message: str, roads: list[dict], road_id: str | None) -> str:
        road = next((item for item in roads if item["id"] == road_id), None) if road_id else None
        if road:
            risk = road_risk_score(road["quality_score"], road["complaints"], road["status"])
            level = risk_level(risk)
            return (
                f"{road['name']} {road['section']} is currently {road['status']} with quality score {road['quality_score']}/100 "
                f"and {road['complaints']} active complaints. Budget utilization is "
                f"{round((road['amount_spent_crore'] / road['sanctioned_budget_crore']) * 100, 1)}%. "
                f"AI risk score: {risk} ({level}).\n\n"
                "Recommended action: conduct joint authority-contractor inspection within 48 hours, "
                "publish maintenance timeline, barricade unsafe segments, and track closure with citizen proof."
            )

        ranked = sorted(
            roads,
            key=lambda item: road_risk_score(item["quality_score"], item["complaints"], item["status"]),
            reverse=True,
        )
        top = ranked[0]
        return (
            f"Highest priority road is {top['name']} {top['section']} based on low score ({top['quality_score']}/100), "
            f"complaint volume ({top['complaints']}), and condition ({top['status']}).\n\n"
            "Recommended action: launch emergency patching, verify contractor accountability, and send a public alert."
        )

    async def answer(
        self,
        message: str,
        roads: list[dict],
        road_id: str | None = None,
        language: str = "en",
        session_id: str = "global",
    ) -> tuple[str, str]:
        memory_store.add(session_id, f"User: {message}")
        memory = memory_store.context(session_id)
        context = self._road_context(roads, road_id)
        fallback = self._fallback_answer(message, roads, road_id)

        if not self.client:
            answer = "[Gemini unavailable - using fallback analysis]\n\n" + fallback
            memory_store.add(session_id, f"Assistant: {answer}")
            return answer, "fallback"

        try:
            prompt = chat_prompt(context, memory, message, language)
            response = self.client.models.generate_content(model=self.settings.gemini_model, contents=prompt)
            answer = response.text or fallback
            memory_store.add(session_id, f"Assistant: {answer}")
            return answer, "gemini"
        except Exception as exc:
            answer = f"[Gemini error: {type(exc).__name__}]\n\n{fallback}"
            memory_store.add(session_id, f"Assistant: {answer}")
            return answer, "fallback"

    async def analyze_image(self, image_bytes: bytes, mime_type: str, location_hint: str | None = None) -> tuple[str, str]:
        fallback = (
            "damage_type: potholes; severity: moderate; confidence: 0.62; "
            "suggested_action: inspect and patch within 48 hours; "
            "summary: probable road-surface degradation with rider safety risk"
        )
        if not self.client:
            return fallback, "fallback"

        try:
            from google.genai import types

            prompt = image_prompt(location_hint)
            response = self.client.models.generate_content(
                model=self.settings.gemini_model,
                contents=[prompt, types.Part.from_bytes(data=image_bytes, mime_type=mime_type)],
            )
            return response.text or fallback, "gemini"
        except Exception as exc:
            return f"[Gemini image analysis error: {type(exc).__name__}]\n{fallback}", "fallback"
