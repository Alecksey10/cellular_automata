from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.consts.roles import RolesIds
from app.models.roles import UserRole
from app.models.user import User


async def is_admin(
    session: AsyncSession,
    user: User,
) -> bool:
    """Проверяет, есть ли у пользователя роль администратора."""
    admin_role_id = RolesIds.getAdminRoleId()

    result = await session.execute(
        select(UserRole).where(
            UserRole.user_id == user.id,
            UserRole.role_id == admin_role_id,
        )
    )

    return result.scalar_one_or_none() is not None


async def ensure_owner_or_admin(
    session: AsyncSession,
    user: User,
    owner_id: UUID | None,
) -> None:
    """403, если пользователь не владелец объекта и не администратор."""
    if user.id == owner_id:
        return

    if await is_admin(session, user):
        return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You are not the owner of this resource",
    )
