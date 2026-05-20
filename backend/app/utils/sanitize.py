import re


SCRIPT_PATTERN = re.compile(r"<\s*script[^>]*>(.*?)<\s*/\s*script>", flags=re.IGNORECASE | re.DOTALL)


def sanitize_text(value: str) -> str:
    no_script = SCRIPT_PATTERN.sub("", value)
    return " ".join(no_script.strip().split())
