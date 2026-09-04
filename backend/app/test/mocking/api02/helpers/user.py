import httpx
import pytest_asyncio

from app.config import settings

import random
import string

import httpx

from app.schemas.auth import RegisterRequest as UserData



BASE_URL = (
    f"http://{settings.backend_api_host}:"
    f"{settings.backend_api_port}"
)




def random_string(length: int = 10) -> str:
    chars = string.ascii_lowercase + string.digits
    return "".join(random.choices(chars, k=length))


def create_random_user() -> UserData:
    suffix = random_string(10)

    return UserData(
        username=f"user_{suffix}",
        email=f"user_{suffix}@example.com",
        password=f"Password_{random_string(12)}",
    )


async def register_user(
    client: httpx.AsyncClient,
) -> UserData:
    user = create_random_user()

    response = await client.post(
        "/auth/register",
        json=user.model_dump(),
    )

    response.raise_for_status()

    return user


