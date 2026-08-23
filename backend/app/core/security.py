from datetime import datetime, timedelta, timezone
from hashlib import sha256
from hmac import compare_digest
from secrets import token_urlsafe
from uuid import UUID

import jwt
from app.core.config import settings
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)


def create_access_token(subject: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )

    payload = {
        "sub": subject,
        "exp": expires_at,
    }

    return jwt.encode(
        payload,
        settings.secret_key,
        algorithm=ALGORITHM,
    )


def hash_refresh_token_secret(secret: str) -> str:
    return sha256(secret.encode("utf-8")).hexdigest()


def create_refresh_token(session_id: UUID) -> tuple[str, str]:
    secret = token_urlsafe(48)
    refresh_token = f"{session_id}.{secret}"
    refresh_token_hash = hash_refresh_token_secret(secret)

    return refresh_token, refresh_token_hash


def parse_refresh_token(refresh_token: str) -> tuple[UUID, str]:
    session_id_value, secret = refresh_token.split(".", maxsplit=1)

    if not secret:
        raise ValueError('El refresh token no cintiene un secreto.')

    return UUID(session_id_value), secret


def verify_refresh_token_secret(
        secret: str,
        stored_hash: str,
) -> bool:
    received_hash = hash_refresh_token_secret(secret)
    return compare_digest(received_hash, stored_hash)
