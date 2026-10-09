from PIL import Image
from fastapi import UploadFile

from app.images.exceptions import ImageFormatError


class ImageLoader:
    """
    Загружает изображение из разных источников.
    """

    def from_upload_file(
        self,
        file: UploadFile,
    ) -> Image.Image:

        try:
            image = Image.open(file.file)
            image.load()

            return image

        except (OSError, ValueError) as error:
            raise ImageFormatError(
                "Не удалось открыть загруженное изображение"
            ) from error
