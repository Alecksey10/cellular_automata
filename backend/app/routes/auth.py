from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError

from app.core.jwt import create_access_token
from app.core.security import hash_password
from app.dao.user import UserDAO
from app.db.session import session_scope
from app.dependencies.auth import JWT_COOKIE_NAME
from app.models.user import User
from app.config import settings
import asyncio

from app.schemas.auth import LoginRequest, RegisterRequest

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


    
@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    tags=['crud'],
)
async def register(data:RegisterRequest):
    await asyncio.sleep(2)
    async with session_scope() as session:
        dao = UserDAO(session)

        if await dao.exists_by_username(data.username):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already exists",
            )

        if await dao.exists_by_email(data.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already exists",
            )

        user = User(
            username=data.username,
            email=data.email,
            password_hash=hash_password(data.password),
        )

        await dao.create_no_commit(user)

    return {
        "id": str(user.id),
        "username": user.username,
        "email": user.email,
    }

from fastapi import Response


@router.post("/login")
async def login(
    response: Response,
    data:LoginRequest,

):
    async with session_scope() as session:
        dao = UserDAO(session)

        user = await dao.get_by_username(data.username)

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        from app.core.security import verify_password

        if not verify_password(
            data.password,
            user.password_hash,
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        token = create_access_token(user.id)

    response.set_cookie(
        key=JWT_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=False, #TODO development
        samesite="lax",
        max_age=settings.jwt_expire_minutes * 60,
    )

    return {
        "message": "Successfully authenticated",
    }

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(
        key=JWT_COOKIE_NAME,
    )

    return {
        "message": "Successfully logged out",
    }

from fastapi import Depends

from app.dependencies.auth import get_current_user
from app.models.user import User


@router.get("/me",
        tags=['crud'],)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    return {
        "id": str(current_user.id),
        "username": current_user.username,
        "email": current_user.email,
    }