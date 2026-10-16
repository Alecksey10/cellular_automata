import pathlib
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app import config
from app import images
from app.dao.automaton import AutomatonDAO
from app.dao.base import BaseDAO
from app.db.session import get_session
from app.dependencies.auth import get_current_user
from app.dependencies.permissions import ensure_owner_or_admin
from app.models.images import Images
from app.models.automaton import automaton_images as automaton_images_table
from sqlalchemy import insert
from app.models.user import User
from app.schemas.automaton import AutomatonResponse
from app.schemas.images import ImageResponse, ImagesResponse


router = APIRouter(
    prefix="/automata",
    tags=["automata"],
)


def _remove_image_file(path: pathlib.Path) -> None:
    # Best-effort: при откате транзакции файл изображения
    # не должен оставлять «сироту» на диске.
    try:
        path.unlink(missing_ok=True)
    except OSError:
        pass


@router.patch(
    "/{automaton_id}/image",
    response_model=AutomatonResponse,
    tags=["crud"],
)
async def update_automaton_image(
    automaton_id: UUID,
    data: UploadFile,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    dao = AutomatonDAO(session=session)

    automaton = await dao.get_by_id(automaton_id)

    if automaton is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Automaton not found",
        )

    await ensure_owner_or_admin(
        session,
        current_user,
        automaton.owner_id,
    )

    image: Images = Images(owner_id=current_user.id)
    session.add(image)
    await session.flush()

    output_path = (
        pathlib.Path(".")
        .joinpath(config.settings.images_directory)
        .joinpath(image.getFileName())
    )

    try:
        image_handler = images.ImageHandler(
            loader=images.ImageLoader(),
            square_converter=images.SquareCropConverter(),
            converter=images.ImageConverter(),
            validator=images.ImageValidator(
                max_size=512,
            ),
            saver=images.ImageSaver(),
        )

        image_handler.process_upload(
            file=data,
            output_path=output_path,
        )

        automaton.preview_image = image.id

        # Не триггерим ленивую загрузку коллекции `images` —
        # напрямую вставляем запись в связующую таблицу.
        # await session.execute(
        #     automaton_images_table.insert().values(
        #         automaton_id=automaton.id,
        #         image_id=image.id,
        #     )
        # )
        # Ленивая загрузка
        await session.refresh(automaton, attribute_names=["images"])
        automaton.images = [image]

        await session.commit()

    except images.exceptions.ImageProcessingError as ex:
        await session.rollback()
        _remove_image_file(output_path)

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(ex),
        )

    except IntegrityError:
        await session.rollback()
        _remove_image_file(output_path)

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="integrity error",
        )

    await session.refresh(
        automaton,
        attribute_names=[
            "tags",
            "owner",
            "preview_image",
            "updated_at",
            "images",
        ],
    )

    return automaton


@router.get(
    "/images",
    response_model=ImagesResponse,
    tags=["crud"],
)
async def get_automaton_images(
    ids: list[UUID] = Query(...),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    images_dao = BaseDAO[Images](Images, session)

    objects = []

    for image_id in ids:
        image = await images_dao.get_by_id(image_id)

        if image is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Image {image_id} not found",
            )

        objects.append(
            ImageResponse(
                id=image_id,
                image_url=f"/static/{image.getFileName()}",
            )
        )

    return ImagesResponse(automatas_data=objects)
