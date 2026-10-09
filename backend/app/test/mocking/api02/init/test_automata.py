import warnings

import pytest
import httpx

from app.test.mocking.api02.helpers.automatas import (
    automatas_default_data_path,
    create_automaton,
    delete_automaton,
    get_automata,
    load_automata_data_from_json,
    load_automata_with_random_tags,
)
from app.schemas.automaton import AutomatonResponse


@pytest.mark.init
@pytest.mark.asyncio
@pytest.mark.order(2)
@pytest.mark.dependency(depends=["tags_done"],scope="session")
async def test_create_get_delete_automaton(
    authed_client: httpx.AsyncClient,
):
    # Берём один автомат из JSON
    automata = await load_automata_with_random_tags(
        authed_client,
        automatas_default_data_path,
    )

    assert automata, "Automata JSON is empty"

    automaton_data = automata[0]

    created_automaton:AutomatonResponse|None = None
    try:
    # Создание
        created_automaton = await create_automaton(
            authed_client,
            automaton_data,
        )
    except httpx.HTTPStatusError as ex:
        if(ex.response.status_code==409):
            warnings.warn(f"Сущность {automaton_data.slug} уже существует", UserWarning)
            return

    automaton_id = created_automaton.id

    assert created_automaton.name == automaton_data.name

    # Удаление
    await delete_automaton(
        authed_client,
        automaton_id,
    )

    # Проверяем, что автомат действительно удалён
    try:
        automata = await get_automata(authed_client, automaton_id)
    except httpx.HTTPStatusError as ex:
        assert ex.response.status_code==404


    

@pytest.mark.init
@pytest.mark.asyncio
@pytest.mark.order(2)
@pytest.mark.dependency(depends=["tags_done"],scope="session")
async def test_initialize_all_automata(
    authed_client: httpx.AsyncClient,
):
    automatas_to_create = await load_automata_with_random_tags(
        authed_client,
        automatas_default_data_path,
    )
    # создадим автоматы и проверим существование
    for automata in automatas_to_create:
            try:
                created_automaton:AutomatonResponse = await create_automaton(
                    authed_client,
                    automata,
                )
                await get_automata(authed_client, created_automaton.id)
            except httpx.HTTPStatusError as ex:
                 if(ex.response.status_code==409):
                    warnings.warn(f"Сущность {automata.slug} уже существует", UserWarning)
                 