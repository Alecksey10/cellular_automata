from PIL import Image


class SquareCropConverter:
    """
    Конвертер, который делает изображение квадратным
    через обрезку лишних частей.
    """

    def convert(
        self,
        image: Image.Image,
    ) -> Image.Image:
        """
        Обрезать изображение до квадрата
        с сохранением центра.
        """

        width, height = image.size

        if width == height:
            return image

        if width > height:
            # Широкое изображение -> режем по ширине
            left = (width - height) // 2

            return image.crop(
                (
                    left,
                    0,
                    left + height,
                    height,
                )
            )

        else:
            # Высокое изображение -> режем по высоте
            top = (height - width) // 2

            return image.crop(
                (
                    0,
                    top,
                    width,
                    top + width,
                )
            )