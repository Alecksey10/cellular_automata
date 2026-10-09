from pathlib import Path
from PIL import Image

from fastapi import UploadFile

from app.images.ImageLoader import ImageLoader
from app.images.converters.SquareCropConverter import SquareCropConverter
from app.images.converters.ImageConverter import ImageConverter
from app.images.ImageValidator import ImageValidator
from app.images.ImageSaver import ImageSaver


class ImageHandler:
    """
    Фасад обработки изображений.
    """

    def __init__(
        self,
        loader: ImageLoader,
        square_converter: SquareCropConverter,
        converter: ImageConverter,
        validator: ImageValidator,
        saver: ImageSaver,
    ):
        self.loader = loader
        self.square_converter = square_converter
        self.converter = converter
        self.validator = validator
        self.saver = saver


    def process_upload(
        self,
        file: UploadFile,
        output_path: str | Path,
    ) -> None:

        image = self.loader.from_upload_file(
            file
        )

        self._process(
            image,
            output_path,
        )


    def process_file(
        self,
        input_path: str | Path,
        output_path: str | Path,
    ) -> None:

        input_path = Path(input_path)

        if not input_path.exists():
            raise FileNotFoundError(
                input_path
            )

        image = Image.open(input_path)
        image.load()

        self._process(
            image,
            output_path,
        )


    def _process(
        self,
        image: Image.Image,
        output_path: str | Path,
    ) -> None:

        # квадратная обрезка
        image = self.square_converter.convert(
            image
        )

        # уменьшение размера
        image = self.converter.resize_max(
            image,
            self.validator.max_size,
        )

        # проверка
        self.validator.validate(
            image
        )

        # сохранение
        self.saver.save(
            image,
            output_path,
        )
