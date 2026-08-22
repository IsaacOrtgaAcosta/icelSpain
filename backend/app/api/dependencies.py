from typing import Annotated, TypeAlias
from uuid import UUID

import jwt
from app.core.config import settings
from app.core.security import ALGORITHM
from app.db.session import get_db
from app.models.user import User, UserRole
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

DatabaseSession: TypeAlias = Annotated[Session, Depends(get_db)]

bearer_scheme = HTTPBearer()

BearerCredentials: TypeAlias = Annotated[
    HTTPAuthorizationCredentials,
    Depends(bearer_scheme),
]

# Si no has iniciado sesión o el token no es válido mostraremos el error 401


def get_current_user(
    credentials: BearerCredentials,
    db: DatabaseSession,
) -> User:
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.secret_key,
            algorithms=[ALGORITHM],
        )
        user_id = UUID(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado.",
        ) from None

    user = db.get(User, user_id)

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no válido.",
        )

    return user


CurrentUser: TypeAlias = Annotated[User, Depends(get_current_user)]

# Si no eres owner el error que dará para ciertas cosas será el 403


def require_owner(current_user: CurrentUser) -> User:
    if current_user.role != UserRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Esta acción requiere permisos de propietario."
        )

    return current_user


OwnerUser: TypeAlias = Annotated[User, Depends(require_owner)]
