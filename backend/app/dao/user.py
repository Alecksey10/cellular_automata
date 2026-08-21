from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dao.base import BaseDAO
from app.models.user import User


class UserDAO(BaseDAO[User]):
    model = User

    def __init__(self, session: AsyncSession):
        super().__init__(model=User, session=session)

    async def get_by_username(
        self,
        username: str,
    ) -> User | None:
        result = await self.session.execute(
            select(User).where(
                User.username == username
            )
        )

        return result.scalar_one_or_none()

    async def get_by_email(
        self,
        email: str,
    ) -> User | None:
        result = await self.session.execute(
            select(User).where(
                User.email == email
            )
        )

        return result.scalar_one_or_none()

    async def get_by_username_or_email(
        self,
        value: str,
    ) -> User | None:
        result = await self.session.execute(
            select(User).where(
                (User.username == value)
                | (User.email == value)
            )
        )

        return result.scalar_one_or_none()

    async def exists_by_username(
        self,
        username: str,
    ) -> bool:
        return (
            await self.get_by_username(username)
        ) is not None

    async def exists_by_email(
        self,
        email: str,
    ) -> bool:
        return (
            await self.get_by_email(email)
        ) is not None