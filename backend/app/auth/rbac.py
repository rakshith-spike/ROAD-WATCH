from collections.abc import Callable

from fastapi import Depends, HTTPException, status

from app.auth.dependencies import get_current_user
from app.auth.roles import has_required_role


def require_roles(*allowed_roles: str) -> Callable:
    async def dependency(current_user: dict = Depends(get_current_user)) -> dict:
        if not has_required_role(current_user.get("role"), allowed_roles):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role permissions")
        return current_user

    return dependency
