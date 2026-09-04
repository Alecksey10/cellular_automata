from fastapi import FastAPI
from app.routes import auth_router, automata_router, tags_router
from fastapi.middleware.cors import CORSMiddleware

import db

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}

origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://localhost:5173",
    "http://192.168.50.218:5173",
    "http://192.168.50.218:8000",
    "http://192.168.50.218",
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