from pathlib import Path

from PIL import Image


class ImageProcessingError(Exception):
    """Базовая ошибка обработки изображения."""


class ImageValidationError(ImageProcessingError):
    """Ошибка валидации изображения."""


class ImageSizeError(ImageValidationError):
    """Изображение имеет недопустимый размер."""


class ImageFormatError(ImageValidationError):
    """Недопустимый формат изображения."""


class ImageSaveError(ImageProcessingError):
    """Ошибка при сохранении изображения."""

