from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.roles import Role
from app.db.session import session_scope
from sqlalchemy.ext.asyncio import AsyncSession

import asyncio
DEFAULT_ROLES = (
    "admin",
    "user",
    "moderator",
)


async def seed_roles(session: AsyncSession) -> None:
    try:
        existing_roles = set(
            (await session.scalars(select(Role.name))).all()
        )
        missing_roles = [
            Role(name=name)
            for name in DEFAULT_ROLES
            if name not in existing_roles
        ]
        if(not missing_roles):
            print(f"неназначенных ролей нет {existing_roles}")
           
        if missing_roles:
            session.add_all(missing_roles)
        print("Роли успешно назначены")
    except:
        print("Роли не назначены")
        raise

async def main():
    async with session_scope() as session:
        print(session)
        await seed_roles(session=session)



if __name__=='__main__':
    print(123)
    asyncio.run(main())