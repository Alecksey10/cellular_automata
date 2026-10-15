from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dao.automaton import AutomatonDAO
from app.dao.tag import TagDAO
from app.db.session import get_session
from app.schemas.automaton import AutomatonCardResponse
from app.schemas.tag import TagCreateRequest, TagResponse, TagShortResponse
from app.dependencies.auth import get_current_user
from app.models.tag import Tag
from app.models.user import User


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

    return result


@router.get(
    "/{tag_id}/automata",
    response_model=list[AutomatonCardResponse],
    tags=['crud'],
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



@router.post(
    "",
    response_model=TagShortResponse,
    status_code=status.HTTP_201_CREATED,
    tags=['crud'],
)
async def create_tag(
    data: TagCreateRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    
    tag_dao = TagDAO(session)

    tags = await tag_dao.get_by_field(name=data.name)
    if(len(tags)!=0):
        raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Tag with that name already exists",
                ) 
    
    new_tag:Tag = await tag_dao.create(Tag(name=data.name))

    return TagShortResponse.model_validate(new_tag)

@router.delete(
    "/{tag_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=['crud'],
)
async def delete_tag(
    tag_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    tag_dao = TagDAO(session)

    tag = await tag_dao.get_by_id(tag_id)

    if tag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found",
        )

    await tag_dao.delete(tag)

    return None

@router.patch(
    "/{tag_id}",
    response_model=TagShortResponse,
    tags=['crud'],
)
async def update_tag(
    tag_id: UUID,
    data: TagCreateRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    tag_dao = TagDAO(session)

    tag = await tag_dao.get_by_id(tag_id)

    if tag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found",
        )

    existing_tags = await tag_dao.get_by_field(name=data.name)

    if any(existing_tag.id != tag_id for existing_tag in existing_tags):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Tag with that name already exists",
        )

    tag.name = data.name

    await session.commit()
    await session.refresh(tag)

    return TagShortResponse.model_validate(tag)

