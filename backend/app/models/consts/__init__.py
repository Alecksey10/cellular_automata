from app.models.consts.roles import RolesIds

async def initConsts():
    '''Инициализация всех моделей с константами'''
    await RolesIds.init()

__all__ = [
    'RolesIds',
    'initConsts'
]

