from app.routes.automata import router as automata_router
from app.routes.automata_images import router as automata_images_router
from app.routes.auth import router as auth_router
from app.routes.tags import router as tags_router


# ВАЖНО: automata_images_router подключается ДО automata_router,
# иначе GET /automata/images перехватывается GET /automata/{automaton_id}.
__all__ = [
    "auth_router",
    "automata_images_router",
    "automata_router",
    "tags_router",
]
