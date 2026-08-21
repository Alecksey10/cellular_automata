from app.routes.automata import router as automata_router
from app.routes.auth import router as auth_router
from app.routes.tags import router as tags_router


__all__ = [
    "auth_router",
    "automata_router",
    "tags_router",
]