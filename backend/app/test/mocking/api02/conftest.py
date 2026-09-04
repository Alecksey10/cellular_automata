import pytest_asyncio
import httpx

from app.config import settings
from app.test.mocking.api02.helpers.user import create_random_user, register_user

BASE_URL = (
    f"http://{settings.backend_api_host}:"
    f"{settings.backend_api_port}"
)


@pytest_asyncio.fixture
async def client():
    async with httpx.AsyncClient(
        base_url=BASE_URL,
        timeout=10.0,
    ) as client:
        yield client


@pytest_asyncio.fixture(scope="session")
async def authed_client():
    user = create_random_user()

    async with httpx.AsyncClient(
        base_url=BASE_URL,
        timeout=10.0,
    ) as client:

        # Регистрация
        response = await client.post(
            "/auth/register",
            json=user.model_dump(),
        )
        response.raise_for_status()

        # Авторизация
        response = await client.post(
            "/auth/login",
            json={
                "username": user.username,
                "password": user.password,
            },
        )
        response.raise_for_status()

        # Здесь client уже авторизован.
        #
        # Один и тот же client будет передан
        # во все тесты, использующие authed_client.
        yield client

        # Logout только после завершения всех тестов
        await client.post("/auth/logout")
