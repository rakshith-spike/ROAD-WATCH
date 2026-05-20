from fastapi import APIRouter, Depends

from app.schemas.auth import RefreshTokenRequest, TokenResponse, UserCreate, UserLogin, UserPublic
from app.services.auth_service import AuthService
from app.services.factory import get_auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup")
async def signup(payload: UserCreate, service: AuthService = Depends(get_auth_service)) -> dict:
    # JSON mode ensures enums and special types are API/DB-safe primitives.
    user, tokens = await service.signup(payload.model_dump(mode="json"))
    return {"user": UserPublic(**user), "tokens": TokenResponse(**tokens)}


@router.post("/login")
async def login(payload: UserLogin, service: AuthService = Depends(get_auth_service)) -> dict:
    user, tokens = await service.login(payload.email, payload.password)
    return {"user": UserPublic(**user), "tokens": TokenResponse(**tokens)}


@router.post("/refresh", response_model=TokenResponse)
async def refresh(payload: RefreshTokenRequest, service: AuthService = Depends(get_auth_service)) -> TokenResponse:
    tokens = await service.refresh(payload.refresh_token)
    return TokenResponse(**tokens)