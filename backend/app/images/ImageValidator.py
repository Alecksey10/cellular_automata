from PIL import Image
from app.images.exceptions import *
# ============================================================
# ImageValidator
# ============================================================

class ImageValidator:
    """
    Проверяет изображение на соответствие заданным требованиям.
    """

    def __init__(
        self,
        max_width: int | None = None,
        max_height: int | None = None,
        max_size: int | None = None,
        require_square: bool = False,
    ):
        self.max_width = max_width
        self.max_height = max_height
        self.max_size = max_size
        self.require_square = require_square

    def validate(self, image: Image.Image) -> None:
        width, height = image.size

        # Проверка квадратности
        if self.require_square and width != height:
            raise ImageSizeError(
                f"Изображение должно быть квадратным, "
                f"получен размер {width}x{height}"
            )

        # Проверка максимальной ширины
        if self.max_width is not None and width > self.max_width:
            raise ImageSizeError(
                f"Ширина изображения {width}px превышает "
                f"максимально допустимую {self.max_width}px"
            )

        # Проверка максимальной высоты
        if self.max_height is not None and height > self.max_height:
            raise ImageSizeError(
                f"Высота изображения {height}px превышает "
                f"максимально допустимую {self.max_height}px"
            )

        # Проверка максимального размера квадрата
        if self.max_size is not None:
            if width > self.max_size or height > self.max_size:
                raise ImageSizeError(
                    f"Размер изображения {width}x{height} превышает "
                    f"максимально допустимый {self.max_size}x{self.max_size}"
                )

