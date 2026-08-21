# через JWT клиент будет иметь доступ к API, JWT будут использоваться через dependency
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from enum import Enum
from uuid import UUID
import json

import jwt
from jwt import ExpiredSignatureError, InvalidTokenError

from app.config import settings


class JWTStatus(str, Enum):
    VALID = "valid"
    EXPIRED = "expired"
    INVALID = "invalid"
    MALFORMED = "malformed"


@dataclass(frozen=True)
class JWTValidationResult:
    status: JWTStatus
    user_id: UUID | None = None
    payload: dict | None = None
    error: str | None = None

    @property
    def is_valid(self) -> bool:
        return self.status == JWTStatus.VALID


def create_access_token(
    user_id: UUID,
) -> str:
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(
        minutes=settings.jwt_expire_minutes
    )

    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": expires_at,
    }

    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def validate_token(
    token: str,
) -> JWTValidationResult:
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )

    except ExpiredSignatureError:
        return JWTValidationResult(
            status=JWTStatus.EXPIRED,
            error="Token has expired",
        )

    except InvalidTokenError as exc:
        return JWTValidationResult(
            status=JWTStatus.INVALID,
            error=str(exc),
        )

    except Exception as exc:
        return JWTValidationResult(
            status=JWTStatus.MALFORMED,
            error=str(exc),
        )
    user_id_raw = payload.get("sub")

    if not user_id_raw:
        return JWTValidationResult(
            status=JWTStatus.INVALID,
            payload=payload,
            error="Missing subject",
        )

    try:
        user_id = UUID(user_id_raw)
    except (ValueError, TypeError):
        return JWTValidationResult(
            status=JWTStatus.INVALID,
            payload=payload,
            error="Invalid subject",
        )

    return JWTValidationResult(
        status=JWTStatus.VALID,
        user_id=user_id,
        payload=payload,
    )