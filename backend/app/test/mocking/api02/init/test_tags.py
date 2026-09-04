import pytest
import httpx

from app.test.mocking.api02.helpers.tags import init_tags
import pytest
import httpx


@pytest.mark.init
@pytest.mark.asyncio
@pytest.mark.order(1)
@pytest.mark.dependency(depends=["auth_done"],scope="session", name="tags_done")
async def test_initialize_tags(
    authed_client: httpx.AsyncClient,
):
    await init_tags(authed_client)
