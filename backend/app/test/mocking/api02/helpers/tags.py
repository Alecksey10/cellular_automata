from typing import List

import httpx

from app.schemas.tag import TagResponse
from pydantic.type_adapter import TypeAdapter

TAGS_TO_CREATE = [
    "algorithms",
    "automata",
    "python",
    "javascript",
    "graphs",
    "sorting",
    "search",
    "test",
    "experimental",
]

async def get_tags(client:httpx.AsyncClient)->List[TagResponse]:
    response = await client.get("/tags")
    response.raise_for_status()
    return TypeAdapter(List[TagResponse]).validate_python(response.json())
    
async def reset_tags(
    client: httpx.AsyncClient,
    tags: list[str] | None = None,
) -> None:
    tags = tags or TAGS_TO_CREATE

    # Получаем существующие теги
    response = await client.get("/tags")
    response.raise_for_status()

    existing_tags = response.json()

    # Удаляем существующие теги
    for tag in existing_tags:
        response = await client.delete(
            f"/tags/{tag['id']}",
        )
        response.raise_for_status()

    # Создаём нужные теги
    for tag_name in tags:
        response = await client.post(
            "/tags/create",
            json={
                "name": tag_name,
            },
        )
        response.raise_for_status()


async def init_tags(
    client: httpx.AsyncClient,
) -> None:
    await reset_tags(client)
