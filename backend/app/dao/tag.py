from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dao.base import BaseDAO
from app.models.automaton import Automaton
from app.models.tag import Tag


class TagDAO(BaseDAO[Tag]):
    def __init__(
        self,
        session: AsyncSession,
    ):
        super().__init__(
            model=Tag,
            session=session,
        )

    async def get_all_with_automata_count(
        self,
    ) -> list[tuple[Tag, int]]:
        result = await self.session.execute(
            select(
                Tag,
                func.count(Automaton.id).label(
                    "automata_count",
                ),
            )
            .outerjoin(Tag.automata)
            .group_by(Tag.id)
            .order_by(
                func.count(Automaton.id).desc(),
                Tag.name.asc(),
            )
        )

        return list(result.all())

    async def get_by_id(
        self,
        tag_id: UUID,
    ) -> Tag | None:
        return await super().get_by_id(tag_id)