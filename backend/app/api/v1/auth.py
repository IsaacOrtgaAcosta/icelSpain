from app.api.dependencies import CurrentUser, DatabaseSession
from app.core.security import (
    create_access_token,
    verify_password,
)
from app.models.user import User
from app.schemas.user import Token, UserLogin, UserRead
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=Token)
def login_user(credentials: UserLogin, db: DatabaseSession) -> Token:
    email = str(credentials.email).lower()

    user = db.scalar(select(User).where(User.email == email))

    if user is None or not verify_password(
        credentials.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Este usuario está desactivado.",
        )

    access_token = create_access_token(str(user.id))

    return Token(access_token=access_token)


@router.get("/me", response_model=UserRead)
def get_me(current_user: CurrentUser) -> User:
    return current_user
