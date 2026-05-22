import os

import httpx
from dotenv import load_dotenv

from app.ai.memory import memory_store

load_dotenv()

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

GROQ_SYSTEM_PROMPT = """
You are RoadWatch AI, a public accountability assistant for smart city road
infrastructure. Help citizens and administrators understand road quality,
budgets, contractor performance, complaint routing, maintenance priorities,
and civic risk.

Use the provided RoadWatch database context first. If live context is limited,
give practical sample guidance and label it as sample data. Keep answers
specific, actionable, and suitable for a city command center.

Always end with:
SUGGESTIONS: question one || question two
""".strip()


async def groq_chat(
    messages: list[dict],
    road_context: str = "",
    session_id: str = "default",
) -> dict:
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        return {
            "reply": "",
            "suggestions": [],
            "mode": "unconfigured",
        }

    system_content = GROQ_SYSTEM_PROMPT
    if road_context:
        system_content += f"\n\nRoadWatch database context:\n{road_context}"

    memory = memory_store.context(session_id)
    if memory:
        system_content += f"\n\nRecent conversation memory:\n{memory}"

    payload = {
        "model": GROQ_MODEL,
        "messages": [{"role": "system", "content": system_content}, *messages],
        "temperature": 0.65,
        "max_tokens": 1024,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(GROQ_API_URL, json=payload, headers=headers)
        response.raise_for_status()

    data = response.json()
    full_reply = data["choices"][0]["message"]["content"]

    if messages:
        last_user = next((item["content"] for item in reversed(messages) if item["role"] == "user"), "")
        if last_user:
            memory_store.add(session_id, f"User: {last_user}")
            memory_store.add(session_id, f"Assistant: {full_reply[:240]}")

    suggestions = []
    reply_text = full_reply
    if "SUGGESTIONS:" in full_reply:
        reply_text, suggestion_text = full_reply.split("SUGGESTIONS:", 1)
        suggestions = [item.strip() for item in suggestion_text.split("||") if item.strip()][:3]

    return {
        "reply": reply_text.strip(),
        "suggestions": suggestions,
        "mode": "groq",
    }
