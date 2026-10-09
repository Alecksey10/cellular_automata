from PIL import Image
class ImageConverter:
    """
    Общие операции над изображениями:
    resize, resize_max и т.д.
    """

    def resize(
        self,
        image: Image.Image,
        width: int,
        height: int,
    ) -> Image.Image:

        if width <= 0 or height <= 0:
            raise ValueError(
                "Ширина и высота должны быть больше нуля"
            )

        return image.resize(
            (width, height),
            Image.Resampling.LANCZOS,
        )


    def resize_max(
        self,
        image: Image.Image,
        max_size: int,
    ) -> Image.Image:

        width, height = image.size

        if width <= max_size and height <= max_size:
            return image

        scale = min(
            max_size / width,
            max_size / height,
        )

        return self.resize(
            image,
            round(width * scale),
            round(height * scale),
        )
