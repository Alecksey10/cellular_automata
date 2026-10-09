
# ============================================================
# ImageSaver
# ============================================================
from app.images.exceptions import *

class ImageSaver:
    """
    Отвечает исключительно за сохранение изображения.
    """

    def save(
        self,
        image: Image.Image,
        path: str | Path,
        *,
        format: str | None = None,
        quality: int = 95,
    ) -> None:

        path = Path(path)

        try:
            path.parent.mkdir(
                parents=True,
                exist_ok=True,
            )

            save_kwargs = {}

            if format is not None:
                save_kwargs["format"] = format

            # Для JPEG имеет смысл задавать quality
            if path.suffix.lower() in {".jpg", ".jpeg"}:
                save_kwargs["quality"] = quality
                save_kwargs["optimize"] = True

                # JPEG не поддерживает RGBA
                if image.mode == "RGBA":
                    image = image.convert("RGB")

            image.save(
                path,
                **save_kwargs,
            )

        except (OSError, ValueError) as error:
            raise ImageSaveError(
                f"Не удалось сохранить изображение "
                f"по пути '{path}'"
            ) from error

