from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.routes import (
    auth_router,
    automata_images_router,
    automata_router,
    tags_router,
)
from fastapi.middleware.cors import CORSMiddleware
from app.routes.api_tags import tags_metadata
from app.config import settings
import app.db

description = """
Обзор клеточных автоматов, основная документация в репозитории
"""

@asynccontextmanager
async def lifespan(app: FastAPI):
    # init
    from app.models.consts import initConsts
    await initConsts()
    
    yield
    # Clean up
    
    
app = FastAPI(openapi_tags=tags_metadata, description=description, lifespan=lifespan)


@app.get("/")
async def root():
    return {"message": "Hello World"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
# automata_images_router раньше automata_router: иначе
# GET /automata/images перехватывается GET /automata/{automaton_id}.
app.include_router(automata_images_router)
app.include_router(automata_router)
app.include_router(tags_router)

app.mount("/static", StaticFiles(directory=Path(".").joinpath(settings.images_directory)), name='static',)