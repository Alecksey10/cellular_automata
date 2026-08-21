from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dao.base import BaseDAO
from app.models.automaton import Automaton
from app.models.tag import Tag


class AutomatonDAO(BaseDAO[Automaton]):
    def __init__(
        self,
        session: AsyncSession,
    ):
        super().__init__(
            model=Automaton,
            session=session,
        )
    async def get_by_id(
        self,
        automaton_id: UUID,
    ) -> Automaton | None:
        result = await self.session.execute(
            select(Automaton)
            .where(
                Automaton.id == automaton_id,
            )
            .options(
                selectinload(Automaton.tags),
                selectinload(Automaton.owner),
            )
        )

        return result.scalar_one_or_none()

    async def get_by_tag(
        self,
        tag_id: UUID,
    ) -> list[Automaton]:
        result = await self.session.execute(
            select(Automaton)
            .join(Automaton.tags)
            .where(Tag.id == tag_id)
            .options(
                selectinload(Automaton.tags),
                selectinload(Automaton.owner),
            )
            .order_by(
                Automaton.name.asc(),
            )
        )

        return list(
            result.scalars().unique().all()
        )

    async def get_by_slug(
        self,
        slug: str,
    ) -> Automaton | None:
        result = await self.session.execute(
            select(Automaton)
            .where(
                Automaton.slug == slug,
            )
            .options(
                selectinload(Automaton.tags),
                selectinload(Automaton.owner),
            )
        )

        return result.scalar_one_or_none()