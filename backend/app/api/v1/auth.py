from datetime import datetime, timedelta, timezone
from uuid import uuid4

from app.api.dependencies import CurrentUser, DatabaseSession
from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    parse_refresh_token,
    verify_password,
    verify_refresh_token_secret,
)
from app.models.user import User
from app.models.user_session import UserSession
from app.schemas.user import Token, UserLogin, UserRead
from fastapi import APIRouter, HTTPException, Request, Response, status
from fastapi.responses import JSONResponse
from sqlalchemy import select

router = APIRouter(prefix="/auth", tags=["Authentication"])

REFRESH_COOKIE_PATH = f"{settings.api_v1_prefix}/auth"


def set_refresh_cookie(
    response: Response,
    refresh_token: str,
    expires_at: datetime,
) -> None:
    cookie_expires_at = expires_at.astimezone(timezone.utc)

    response.set_cookie(
        key=settings.refresh_cookie_name,
        value=refresh_token,
        expires=cookie_expires_at,
        httponly=True,
        secure=settings.refresh_cookie_secure,
        samesite="lax",
        path=REFRESH_COOKIE_PATH,
    )


def clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.refresh_cookie_name,
        httponly=True,
        secure=settings.refresh_cookie_secure,
        samesite="lax",
        path=REFRESH_COOKIE_PATH,
    )


def invalid_session_response() -> JSONResponse:
    response = JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={
            "detail": "La sesión no es válida o ha expirado.",
        },
    )
    clear_refresh_cookie(response)

    return response


@router.post("/login", response_model=Token)
def login_user(
    credentials: UserLogin,
    request: Request,
    response: Response,
    db: DatabaseSession,
) -> Token:
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

    now = datetime.now(timezone.utc)
    session_id = uuid4()
    refresh_token, refresh_token_hash = create_refresh_token(
        session_id
    )
    user_agent = request.headers.get("user-agent")

    session = UserSession(
        id=session_id,
        user_id=user.id,
        refresh_token_hash=refresh_token_hash,
        user_agent=user_agent[:512] if user_agent else None,
        expires_at=now
        + timedelta(days=settings.refresh_token_expire_days),
    )

    db.add(session)
    db.commit()

    set_refresh_cookie(
        response,
        refresh_token,
        session.expires_at,
    )

    access_token = create_access_token(str(user.id))
    return Token(access_token=access_token)


@router.post(
    "/refresh",
    response_model=Token,
)
def refresh_access_token(
    request: Request,
    response: Response,
    db: DatabaseSession,
) -> Token | JSONResponse:
    refresh_token = request.cookies.get(
        settings.refresh_cookie_name
    )

    if refresh_token is None:
        return invalid_session_response()

    try:
        session_id, secret = parse_refresh_token(refresh_token)
    except ValueError:
        return invalid_session_response()

    session = db.scalar(
        select(UserSession)
        .where(UserSession.id == session_id)
        .with_for_update()
    )
    now = datetime.now(timezone.utc)

    if (
        session is None
        or session.revoked_at is not None
        or session.expires_at <= now
    ):
        return invalid_session_response()

    if not verify_refresh_token_secret(
        secret,
        session.refresh_token_hash,
    ):
        session.revoked_at = now
        db.commit()
        return invalid_session_response()

    user = db.get(User, session.user_id)

    if user is None or not user.is_active:
        session.revoked_at = now
        db.commit()
        return invalid_session_response()

    new_refresh_token, new_refresh_token_hash = (
        create_refresh_token(session.id)
    )

    session.refresh_token_hash = new_refresh_token_hash
    session.last_used_at = now
    db.commit()

    set_refresh_cookie(
        response,
        new_refresh_token,
        session.expires_at,
    )

    access_token = create_access_token(str(user.id))
    return Token(access_token=access_token)


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
)
def logout_user(
    request: Request,
    response: Response,
    db: DatabaseSession,
) -> None:
    refresh_token = request.cookies.get(
        settings.refresh_cookie_name
    )

    if refresh_token is not None:
        try:
            session_id, secret = parse_refresh_token(
                refresh_token
            )
        except ValueError:
            session_id = None
            secret = None

        if session_id is not None and secret is not None:
            session = db.get(UserSession, session_id)

            if (
                session is not None
                and session.revoked_at is None
                and verify_refresh_token_secret(
                    secret,
                    session.refresh_token_hash,
                )
            ):
                session.revoked_at = datetime.now(timezone.utc)
                db.commit()

    clear_refresh_cookie(response)


@router.get("/me", response_model=UserRead)
def get_me(current_user: CurrentUser) -> User:
    return current_user
