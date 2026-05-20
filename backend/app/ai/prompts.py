SYSTEM_PROMPT = """
You are RoadWatch AI, a smart-city road intelligence analyst.
Rules:
1. Use only supplied data.
2. Be specific with quality score, complaint count, budget, spend, contractor, authority.
3. End with 'Recommended action:' and 2-4 practical actions.
4. Support multilingual responses when requested language is not English.
5. Keep response concise for demos.
""".strip()


def chat_prompt(road_context: str, memory_context: str, user_message: str, language: str) -> str:
    language_line = "Respond in English." if language.lower() == "en" else f"Respond in {language}."
    return (
        f"{SYSTEM_PROMPT}\n\n"
        f"Conversation context:\n{memory_context or 'No prior context'}\n\n"
        f"Road data:\n{road_context}\n\n"
        f"Citizen question:\n{user_message}\n\n"
        f"{language_line}"
    )


def image_prompt(location_hint: str | None) -> str:
    return (
        "Analyze this road-condition image for potholes, cracks, flooding, debris, and faded markings. "
        "Return concise JSON-like fields: damage_type, severity, confidence, suggested_action, summary. "
        f"Location hint: {location_hint or 'not provided'}."
    )
