import json
import random
from pathlib import Path
from typing import List

import httpx

from app.schemas.automaton import AutomatonCreateRequest, AutomatonResponse
from app.test.mocking.api02.helpers.tags import get_tags


automatas_default_data_path = (
    "app/test/mocking/api02/helpers/automatas/automatas.json"
)



async def get_automata(
    client: httpx.AsyncClient,
    automaton_id:str
)->AutomatonResponse:
    response = await client.get(f"/automata/{automaton_id}")
    response.raise_for_status()
    return AutomatonResponse.model_validate(response.json())


async def create_automaton(
    client: httpx.AsyncClient,
    automaton_data: AutomatonCreateRequest,
)->AutomatonResponse:
    response = await client.post(
        "/automata",
        json=automaton_data.model_dump(mode="json"),
    )
    response.raise_for_status()
    return AutomatonResponse.model_validate(response.json())


async def delete_automaton(
    client: httpx.AsyncClient,
    automaton_id: str,
) -> None:
    response = await client.delete(
        f"/automata/{automaton_id}",
    )
    response.raise_for_status()


def load_automata_data_from_json(
    file_path: str | Path,
) -> list[AutomatonCreateRequest]:
    path = Path(file_path)

    with path.open("r", encoding="utf-8") as file:
        data = json.load(file)

    if not isinstance(data, list):
        raise ValueError(
            f"Expected JSON array, got {type(data).__name__}"
        )

    return [
        AutomatonCreateRequest.model_validate(item)
        for item in data
    ]


async def load_automata_with_random_tags(
    client: httpx.AsyncClient,
    file_path: str | Path,
)->List[AutomatonCreateRequest]:
    automatas_datas = load_automata_data_from_json(file_path)

    # Получаем реальные теги с сервера.
    tags = await get_tags(client)

    if not tags:
        raise ValueError(
            "Cannot initialize automata: "
            "no tags found on server"
        )

    tag_ids = [tag.id for tag in tags]

    created_automata = []

    for automaton_data in automatas_datas:
        # Не изменяем исходный Pydantic-объект.
        # Создаём новый с новым набором tag_ids.
        tag_count = random.randint(
            1,
            len(tag_ids),
        )

        random_tag_ids = random.sample(
            tag_ids,
            k=tag_count,
        )

        automaton_data.tag_ids =random_tag_ids


        created_automata.append(automaton_data)

    return created_automata
