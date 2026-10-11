from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.routes import auth_router, automata_router, tags_router
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

origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://localhost:5173",
    "http://192.168.50.218:5173",
    "http://192.168.50.218:8000",
    "http://192.168.50.218:3000",
    "http://192.168.50.218",
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(automata_router)
app.include_router(tags_router)

app.mount("/static", StaticFiles(directory=Path(".").joinpath(settings.images_directory)), name='static',)