from app.models.roles import Role
from app.dao.base import BaseDAO
from app.db.session import session_scope
class RolesIds():
    _admin_id:None=None

    @classmethod
    async def getAdminRole(cls):
        if cls._admin_id is None:
            async with session_scope() as session:
                rolesDao = BaseDAO(model=Role, session=session)
                cls._admin_id = (await rolesDao.get_by_field(name='admin'))[0].id
        return cls._admin_id

    @classmethod
    async def init(cls):
        await cls.getAdminRole()

    @classmethod
    def getAdminRoleId(cls):
        if not cls._admin_id:
            raise Exception("admin role was not cached")
        return cls._admin_id
