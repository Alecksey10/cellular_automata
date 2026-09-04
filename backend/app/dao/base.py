from typing import Generic, List, TypeVar

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import Select

from app.models.base import BaseModel


ModelT = TypeVar("ModelT", bound=BaseModel)



class BaseDAO(Generic[ModelT]):
    # async with session_scope() as session:
    # dao = UserDAO(session)

    # user = await dao.create(
    #     User(
    #         username="test",
    #         email="test@example.com",
    #         password_hash="...",
    #     )
    # )
    model: type[ModelT]

    def __init__(self, model: type[ModelT], session: AsyncSession):
        self.session = session
        self.model = model #TODO, крайне сомнительно, так как этот класс отвечает за 
        #интерфейсы и абстракцию, так зачем ему логику присвоять? 
        # Тем более model это ещё и классовая переменная, а не только объектная, 
        # а значит её могут изменить откуда угодно при многопоточном доступе...

    async def get_all(self) -> list[ModelT]:
        result = await self.session.execute(
            select(self.model)
        )

        return list(result.scalars().all())

    async def get_by_field(
            self,
            **fields,
        ) -> List[ModelT] | List[None]:
            stmt = select(self.model)
            for field, value in fields.items():
                stmt = stmt.where(getattr(self.model, field) == value)

            result = await self.session.execute(stmt)
            return result.scalars().all()

    async def get_by_id(
        self,
        object_id,
    ) -> ModelT | None:
        return await self.session.get(
            self.model,
            object_id,
        )

    async def exists(
        self,
        object_id,
    ) -> bool:
        object_ = await self.get_by_id(object_id)

        return object_ is not None

    async def count(self) -> int:
        result = await self.session.execute(
            select(func.count())
            .select_from(self.model)
        )

        return result.scalar_one()

    async def create(
        self,
        object_: ModelT,
    ) -> ModelT:
        self.session.add(object_)

        await self.session.commit()
        await self.session.refresh(object_)

        return object_

    async def create_no_commit(
        self,
        object_: ModelT,
    ) -> ModelT:
        self.session.add(object_)

        await self.session.flush()
        await self.session.refresh(object_)

        return object_

    async def update(
        self,
        object_: ModelT,
    ) -> ModelT:
        self.session.add(object_)

        await self.session.commit()
        await self.session.refresh(object_)

        return object_

    async def update_no_commit(
        self,
        object_: ModelT,
    ) -> ModelT:
        self.session.add(object_)

        await self.session.flush()
        await self.session.refresh(object_)

        return object_

    async def delete(
        self,
        object_: ModelT,
    ) -> None:
        await self.session.delete(object_)

        await self.session.commit()

    async def delete_no_commit(
        self,
        object_: ModelT,
    ) -> None:
        await self.session.delete(object_)

        await self.session.flush()

    async def delete_by_id(
        self,
        object_id,
    ) -> bool:
        object_ = await self.get_by_id(object_id)

        if object_ is None:
            return False

        await self.session.delete(object_)
        await self.session.commit()

        return True

    async def delete_by_id_no_commit(
        self,
        object_id,
    ) -> bool:
        object_ = await self.get_by_id(object_id)

        if object_ is None:
            return False

        await self.session.delete(object_)
        await self.session.flush()

        return True

    async def commit(self) -> None:
        await self.session.commit()

    async def rollback(self) -> None:
        await self.session.rollback()

    async def flush(self) -> None:
        await self.session.flush()

    async def refresh(
        self,
        object_: ModelT,
    ) -> ModelT:
        await self.session.refresh(object_)

        return object_