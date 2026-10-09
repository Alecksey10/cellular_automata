Изображения где-то надо регистрировать и хранить, пока так.
По идее это разовое мероприятие, без нормальных базовых классов и хитрой логики. Можно было и хардкодом в один класс - всё равно отдельный модуль.


<!-- AI документация -->

```python
converter = ImageConverter()

validator = ImageValidator(
    max_size=1024,
    require_square=True,
)

saver = ImageSaver()

handler = ImageHandler(
    converter=converter,
    validator=validator,
    saver=saver,
)

handler.process(
    input_path="input.jpg",
    output_path="output.jpg",
)
```

В результате поток получается таким:

                    ┌─────────────────┐
                    │  ImageHandler   │
                    └────────┬────────┘
                             │
                   ┌─────────▼─────────┐
                   │ ImageConverter    │
                   │                   │
                   │ 1920x1080         │
                   │       ↓           │
                   │ 1080x1080         │
                   │       ↓           │
                   │ 1024x1024         │
                   └─────────┬─────────┘
                             │
                   ┌─────────▼─────────┐
                   │ ImageValidator    │
                   │                   │
                   │ square? ✓         │
                   │ <= 1024? ✓        │
                   └─────────┬─────────┘
                             │
                   ┌─────────▼─────────┐
                   │ ImageSaver        │
                   │                   │
                   │ output.jpg        │
                   └───────────────────┘

У каждого класса одна ответственность:
    ImageHandler — управляет процессом, но сам ничего не преобразует и не сохраняет.
    ImageConverter — занимается исключительно преобразованием изображения.
    ImageValidator — только проверяет изображение и выбрасывает ошибки.
    ImageSaver — только сохраняет.
    Exceptions — позволяют вызывающему коду понять, на каком этапе произошла проблема.

Например, снаружи можно обработать ошибки:

try:
    handler.process(
        "input.jpg",
        "output.jpg",
    )

except ImageSizeError as error:
    print(f"Некорректный размер: {error}")

except ImageFormatError as error:
    print(f"Некорректный файл: {error}")

except ImageSaveError as error:
    print(f"Ошибка сохранения: {error}")

except ImageProcessingError as error:
    print(f"Ошибка обработки: {error}")

Ещё один важный момент: я специально сделал в ImageConverter два варианта приведения к соотношению — crop=True (обрезать изображение) и crop=False (добавить поля). Это позволит потом без переделки архитектуры поддержать, например, 1:1, 4:3, 16:9, 9:16 и другие форматы.

--- Новый слой
Теперь поток выглядит так:

UploadFile
    |
    v
ImageLoader
    |
    v
PIL.Image
    |
    v
SquareCropConverter
    |
    v
ImageConverter.resize_max
    |
    v
ImageValidator
    |
    v
ImageSaver

Плюс такого разделения:

SquareCropConverter можно заменить на CircleCropConverter, FaceCropConverter и т.п.

ImageConverter не знает бизнес-логику.

ImageHandler работает и с файлами, и с FastAPI upload.

тестировать каждый компонент можно отдельно.
