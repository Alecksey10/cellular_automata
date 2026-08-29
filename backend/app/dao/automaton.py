from typing import Collection
from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dao.base import BaseDAO
from app.models.automaton import Automaton
from app.models.tag import Tag
from app.schemas.other import SearchSort


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

    async def search(
        self,
        *,
        text: str | None = None,
        tag_ids: list[UUID] | None = None,
        collection_ids: list[UUID] | None = None,
        owner_id: UUID | None = None,
        sort: SearchSort = SearchSort.DATE,
        offset: int = 0,
        limit: int = 40,
    ) -> tuple[int, list[Automaton]]:
        tag_ids = tag_ids or []
        collection_ids = collection_ids or []

        # ---------------------------------------------------------
        # Base query
        # ---------------------------------------------------------

        filters = []

        # Text search
        if text:
            search = f"%{text.strip()}%"

            filters.append(
                or_(
                    Automaton.name.ilike(search),
                    Automaton.slug.ilike(search),
                    Automaton.description.ilike(search),
                )
            )

        # Owner
        if owner_id is not None:
            filters.append(
                Automaton.owner_id == owner_id,
            )

        # ---------------------------------------------------------
        # Tags: AND
        #
        # Automaton must contain ALL requested tags.
        # ---------------------------------------------------------

        for tag_id in tag_ids:
            filters.append(
                Automaton.tags.any(
                    Tag.id == tag_id,
                )
            )

        # ---------------------------------------------------------
        # Collections: AND
        #
        # Automaton must belong to ALL requested collections.
        # ---------------------------------------------------------

        for collection_id in collection_ids:
            filters.append(
                Automaton.collections.any(
                    Collection.id == collection_id,
                )
            )

        # ---------------------------------------------------------
        # Count
        # ---------------------------------------------------------

        count_stmt = (
            select(func.count(Automaton.id))
            .where(*filters)
        )

        count_result = await self.session.execute(
            count_stmt,
        )

        total = count_result.scalar_one()

        # ---------------------------------------------------------
        # Data
        # ---------------------------------------------------------

        stmt = (
            select(Automaton)
            .where(*filters)
            .options(
                selectinload(Automaton.tags),
                selectinload(Automaton.owner),
            )
        )

        # ---------------------------------------------------------
        # Sorting
        # ---------------------------------------------------------

        if sort == SearchSort.DATE:
            stmt = stmt.order_by(
                Automaton.created_at.desc(),
            )

        elif sort == SearchSort.SIZE:
            stmt = stmt.order_by(
                Automaton.source_size.desc(),
                Automaton.created_at.desc(),
            )

        elif sort == SearchSort.VIEWS:
            # TODO:
            # добавить сортировку по количеству просмотров,
            # когда будет соответствующее поле/таблица.
            stmt = stmt.order_by(
                Automaton.created_at.desc(),
            )

        elif sort == SearchSort.POPULAR:
            # TODO:
            # добавить реальную метрику популярности.
            stmt = stmt.order_by(
                Automaton.created_at.desc(),
            )

        stmt = stmt.offset(offset).limit(limit)

        result = await self.session.execute(
            stmt,
        )

        items = list(
            result.scalars().unique().all()
        )

        return total, items
