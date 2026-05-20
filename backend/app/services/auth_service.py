from datetime import datetime
from uuid import uuid4

import jwt
from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.auth.jwt import create_access_token, create_refresh_token, decode_token
from app.auth.password import hash_password, verify_password
from app.auth.roles import normalize_role
from app.core.config import get_settings
from app.repositories.user_repository import UserRepository


class AuthService:
    def __init__(self, user_repo: UserRepository) -> None:
        self.user_repo = user_repo
        self.settings = get_settings()

    async def signup(self, payload: dict) -> tuple[dict, dict]:
        existing = await self.user_repo.get_by_email(payload["email"])
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")

        user_id = f"usr-{uuid4().hex[:10]}"

        role = payload.get("role", "citizen")
        if hasattr(role, "value"):
            role = role.value
        role = normalize_role(role)

        user_doc = {
            "id": user_id,
            "full_name": payload["full_name"],
            "email": payload["email"],
            "password_hash": hash_password(payload["password"]),
            "role": role,
            "created_at": datetime.utcnow(),
        }
        try:
            await self.user_repo.create(user_doc)
        except DuplicateKeyError as exc:
            raise HTTPException(status_code=409, detail="Email already registered") from exc

        tokens = await self._issue_tokens(user_id=user_id, role=role)
        safe_user = {k: v for k, v in user_doc.items() if k not in {"password_hash"}}
        return safe_user, tokens

    async def login(self, email: str, password: str) -> tuple[dict, dict]:
        user = await self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.get("password_hash", "")):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        role = normalize_role(user.get("role"))
        tokens = await self._issue_tokens(user_id=user["id"], role=role)
        if user.get("role") != role:
            await self.user_repo.collection.update_one({"id": user["id"]}, {"$set": {"role": role}})
            user["role"] = role
        safe_user = {k: v for k, v in user.items() if k not in {"password_hash", "refresh_token", "_id"}}
        return safe_user, tokens

    async def refresh(self, refresh_token: str) -> dict:
        try:
            payload = decode_token(refresh_token)
        except jwt.InvalidTokenError as exc:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token") from exc

        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

        user = await self.user_repo.get_by_id(payload["sub"])
        if not user or user.get("refresh_token") != refresh_token:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked")

        role = normalize_role(user.get("role"))
        if user.get("role") != role:
            await self.user_repo.collection.update_one({"id": user["id"]}, {"$set": {"role": role}})
        return await self._issue_tokens(user_id=user["id"], role=role)

    async def _issue_tokens(self, user_id: str, role: str) -> dict:
        access_token = create_access_token(user_id, role)
        refresh_token = create_refresh_token(user_id, role)
        await self.user_repo.store_refresh_token(user_id, refresh_token)
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_in_seconds": self.settings.access_token_exp_minutes * 60,
        }
