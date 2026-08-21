from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dao.automaton import AutomatonDAO
from app.dao.tag import TagDAO
from app.db.session import get_session
from app.schemas.automaton import AutomatonCardResponse
from app.schemas.tag import TagResponse


router = APIRouter(
    prefix="/tags",
    tags=["tags"],
)


@router.get(
    "",
    response_model=list[TagResponse],
)
async def get_tags(
    session: AsyncSession = Depends(get_session),
) -> list[TagResponse]:
    dao = TagDAO(session)

    rows = await dao.get_all_with_automata_count()

    result =  [
        TagResponse(
            id=tag.id,
            name=tag.name,
            automata_count=count,
        )
        for tag, count in rows
    ]
    print(result)
    return result


@router.get(
    "/{tag_id}/automata",
    response_model=list[AutomatonCardResponse],
)
async def get_automata_by_tag(
    tag_id: UUID,
    session: AsyncSession = Depends(get_session),
) -> list[AutomatonCardResponse]:
    tag_dao = TagDAO(session)

    tag = await tag_dao.get_by_id(tag_id)

    if tag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found",
        )

    automaton_dao = AutomatonDAO(session)

    return await automaton_dao.get_by_tag(tag_id)