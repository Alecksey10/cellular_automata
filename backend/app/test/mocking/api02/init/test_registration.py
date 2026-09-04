import pytest
import httpx

from app.test.mocking.api02.helpers.user import register_user
from app.test.mocking.api02.helpers.tags import reset_tags

@pytest.mark.init
@pytest.mark.asyncio
@pytest.mark.order(0)
@pytest.mark.dependency(name="auth_done")
async def test_authentication(
    client: httpx.AsyncClient,
):
    # 1. Создаём пользователя
    user = await register_user(client)

    # 2. Проверяем login
    response = await client.post(
        "/auth/login",
        json={
            "username": user.username,
            "password": user.password,
        },
    )
    response.raise_for_status()

    # 3. Проверяем /me
    response = await client.get("/auth/me")
    response.raise_for_status()

    # 4. Logout
    response = await client.post("/auth/logout")
    response.raise_for_status()