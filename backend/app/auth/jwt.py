from datetime import datetime, timedelta, timezone
from typing import Any

import jwt

from app.core.config import get_settings


settings = get_settings()


def _encode(payload: dict[str, Any], expires_delta: timedelta) -> str:
    now = datetime.now(timezone.utc)
    to_encode = payload.copy()
    to_encode.update({"iat": now, "exp": now + expires_delta})
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_access_token(user_id: str, role: str) -> str:
    delta = timedelta(minutes=settings.access_token_exp_minutes)
    return _encode({"sub": user_id, "role": role, "type": "access"}, delta)


def create_refresh_token(user_id: str, role: str) -> str:
    delta = timedelta(days=settings.refresh_token_exp_days)
    return _encode({"sub": user_id, "role": role, "type": "refresh"}, delta)


def decode_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
