from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Response,
    status,
)
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.dao.automaton import AutomatonDAO
from app.dao.tag import TagDAO
from app.db.session import get_session, session_scope
from app.dependencies.auth import get_current_user
from app.models.automaton import Automaton
from app.models.user import User
from app.schemas.automaton import (
    AutomatonCreateRequest,
    AutomatonResponse,
    AutomatonSearchResponse,
    AutomatonSourceResponse,
    AutomatonUpdateRequest,
)
from app.schemas.other import SearchOwner, SearchSort
from app.services.automaton import (
    calculate_source_metadata,
)


router = APIRouter(
    prefix="/automata",
    tags=["automata"],
)


@router.get(
    "/search_by_tags",
    response_model=AutomatonSearchResponse,
)
async def search_automata(
    text: str | None = Query(
        default=None,
    ),
    tags: list[UUID] = Query(
        default=[],
    ),
    collections: list[UUID] = Query(
        default=[],
    ),
    owner: SearchOwner = Query(
        default=SearchOwner.ANY,
    ),
    sort: SearchSort = Query(
        default=SearchSort.DATE,
    ),
    page: int = Query(
        default=1,
        ge=1,
    ),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    page_size = 5
    offset = (page - 1) * page_size

    owner_id = None

    if owner == SearchOwner.ME:
        owner_id = current_user.id

    dao = AutomatonDAO(session)

    total, items = await dao.search(
        text=text,
        tag_ids=tags,
        collection_ids=collections,
        owner_id=owner_id,
        sort=sort,
        offset=offset,
        limit=page_size,
    )

    return AutomatonSearchResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=items,
    )



@router.get(
    "/{automaton_id}",
    response_model=AutomatonResponse,
)
async def get_automaton(
    automaton_id: UUID,
    session: AsyncSession = Depends(get_session),
):
    dao = AutomatonDAO(session)

    automaton = await dao.get_by_id(
        automaton_id,
    )

    if automaton is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Automaton not found",
        )

    return automaton

@router.get(
    "/{automaton_id}/source",
    response_model=AutomatonSourceResponse,
)
async def get_automaton_source(
    automaton_id: UUID,
    session: AsyncSession = Depends(get_session),
):
    dao = AutomatonDAO(session)

    automaton = await dao.get_by_id(
        automaton_id,
    )

    if automaton is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Automaton not found",
        )

    return AutomatonSourceResponse(
        id=automaton.id,
        source_code=automaton.source_code,
    )

@router.post(
    "/create",
    response_model=AutomatonResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_automaton(
    data: AutomatonCreateRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    tag_dao = TagDAO(session)

    tags = []

    for tag_id in data.tag_ids:
        tag = await tag_dao.get_by_id(tag_id)

        if tag is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tag {tag_id} not found",
            )

        tags.append(tag)

    based_on = None

    if data.based_on_id is not None:
        automaton_dao = AutomatonDAO(session)

        based_on = await automaton_dao.get_by_id(
            data.based_on_id,
        )

        if based_on is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Base automaton not found",
            )

    line_count, source_size = (
        calculate_source_metadata(
            data.source_code,
        )
    )

    automaton = Automaton(
        owner_id=current_user.id,
        based_on_id=data.based_on_id,
        name=data.name,
        slug=data.slug,
        description=data.description,
        source_code=data.source_code,
        source_line_count=line_count,
        source_size=source_size,
        tags=tags,
    )

    session.add(automaton)

    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Automaton with this slug already exists",
        )

    await session.refresh(
        automaton,
        attribute_names=[
            "tags",
            "owner",
        ],
    )

    return automaton

@router.patch(
    "/{automaton_id}",
    response_model=AutomatonResponse,
)
async def update_automaton(
    automaton_id: UUID,
    data: AutomatonUpdateRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    dao = AutomatonDAO(session)

    automaton = await dao.get_by_id(
        automaton_id,
    )

    if automaton is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Automaton not found",
        )

    if automaton.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not the owner of this automaton",
        )

    changes = data.model_dump(
        exclude_unset=True,
    )

    if "name" in changes:
        automaton.name = changes["name"]

    if "slug" in changes:
        automaton.slug = changes["slug"]

    if "description" in changes:
        automaton.description = changes[
            "description"
        ]

    if "source_code" in changes:
        source_code = changes["source_code"]

        line_count, source_size = (
            calculate_source_metadata(
                source_code,
            )
        )

        automaton.source_code = source_code
        automaton.source_line_count = line_count
        automaton.source_size = source_size

    if "based_on_id" in changes:
        based_on_id = changes["based_on_id"]

        if based_on_id == automaton.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Automaton cannot be based on itself",
            )

        if based_on_id is not None:
            base_automaton = await dao.get_by_id(
                based_on_id,
            )

            if base_automaton is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Base automaton not found",
                )

        automaton.based_on_id = based_on_id

    if "tag_ids" in changes:
        tag_dao = TagDAO(session)

        tags = []

        for tag_id in changes["tag_ids"]:
            tag = await tag_dao.get_by_id(tag_id)

            if tag is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Tag {tag_id} not found",
                )

            tags.append(tag)

        automaton.tags = tags

    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Automaton with this some data already exists",
        )

    await session.refresh(
        automaton,
        attribute_names=[
            "tags",
            "owner",
        ],
    )

    return automaton


@router.delete(
    "/{automaton_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_automaton(
    automaton_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    dao = AutomatonDAO(session)

    automaton = await dao.get_by_id(
        automaton_id,
    )

    if automaton is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Automaton not found",
        )

    if automaton.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not the owner of this automaton",
        )

    await session.delete(automaton)
    await session.commit()

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )
