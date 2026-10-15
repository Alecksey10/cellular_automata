# Архитектура

## Обзор

<!-- ```mermaid
flowchart LR
    Browser[Браузер] -->|HTTP| Frontend["frontend<br/>React Router (SSR), Vite"]
    Frontend -->|REST: /auth /automata /tags<br/>JWT в cookie| Backend["backend<br/>FastAPI"]
    Backend --> DB[(PostgreSQL 18)]
    Backend --> FS[(Файлы изображений<br/>IMAGES_DIRECTORY)]
    Backend -->|статика /static| Frontend
``` -->

Монорепозиторий: `backend/` (Python/FastAPI) и `frontend/app/` (TypeScript/React), общаются по REST. Инфраструктура — Docker Compose (см. [run.md](./run.md), [configuration.md](./configuration.md)).

## Backend

### Слои (`backend/app/`)

| Слой | Каталог | Назначение |
|---|---|---|
| Роуты | `routes/` | HTTP-эндпоинты, валидация входа/выхода |
| Зависимости | `dependencies/` | `get_current_user` (JWT из cookie), `permissions` (`ensure_owner_or_admin`, `is_admin`) |
| Сервисы | `services/` | Бизнес-логика (например, `calculate_source_metadata`) |
| DAO | `dao/` | `BaseDAO` (generic CRUD) + `AutomatonDAO`, `TagDAO`, `UserDAO`; сессия передаётся извне |
| Модели | `models/` | SQLAlchemy 2.0 (`Mapped`), UUID-PK: automaton, user, roles, tag, images, collection |
| Схемы | `schemas/` | Pydantic-модели запросов и ответов |
| БД | `db/` | Async engine (asyncpg), фабрика сессий, seeds (роли) |
| Изображения | `images/` | Пайплайн обработки: loader → validator (512) → square crop → converter → saver |
| Конфигурация | `config.py` | pydantic-settings + `.env`; `database_url`, `cors_origins_list` |

Роуты подключаются в `main.py`. `automata_images_router` подключается **раньше** `automata_router`, иначе `GET /automata/images` перехватывается `GET /automata/{automaton_id}`.

### Аутентификация и авторизация

- JWT (PyJWT, HS256) хранится в cookie `access_token`; пароли — argon2 (`core/security.py`).
- Роли: many-to-many `user_roles`; при старте приложения (lifespan → `initConsts`) кэшируется id роли `admin`.
- Проверка «владелец или админ» — единая зависимость `ensure_owner_or_admin` (`dependencies/permissions.py`), используется в роутах обновления/удаления и загрузки изображений.

### Изображения

Файл из запроса → запись `Images` (имя файла = UUID) → файл в `IMAGES_DIRECTORY` → раздача через `/static`. Превью автомата — `automaton.preview_image`. При ошибке обработки файл удаляется, транзакция откатывается.

### Миграции и данные

- Alembic: `backend/alembic/versions` (autogenerate по `Base.metadata`, `sqlalchemy.url` подставляется из `app/config.py`).
- Seed (`app/db/seeds/seed.py`) создаёт роли `admin`/`user`/`moderator`; выполняется в entrypoint контейнера.
- Примеры автоматов для наполнения БД — `app/db/test_seeds/`; интеграционные тесты — `app/test/mocking/api02/`.

## Frontend (`frontend/app/`)

| Каталог | Назначение |
|---|---|
| `app/` | Страницы (`app/routes/`), роутинг (`app/routes.ts`), состояния (`states/`), UI (`components/`, shadcn) |
| `api/` | Типизированный REST-клиент: `APIMethodBase` (fetch, cookies, JSON), домены `auth/`, `automata/`, `tags/`; конфиг — `Config.ts` (`VITE_API_BASE_URL`). Подробное описание — `api/readme.md` |
| `client_apis/` | Версионированный рантайм запуска автоматов: `contract/` (типы), `runtime/` (цикл симуляции, EventBus), `renderers/` (canvas), `gui/` (панели управления; `AutomatonView` — страница `/automata/:id`). `v0.1` — устаревший, текущий — `v0.2.1` |
| `program_loader/` | Загрузка и компиляция исходников автомата (TypeScript) в исполняемую программу |

Идея: каждый может написать собственный автомат на TypeScript и поделиться им — исходник хранится в БД (`automaton.source_code`), компилируется и выполняется на клиенте в контракте `client_apis`.

## REST API (кратко)

| Метод | Путь | Описание |
|---|---|---|
| POST | `/auth/register`, `/auth/login`, `/auth/logout` | Аутентификация |
| GET | `/auth/me` | Текущий пользователь |
| GET | `/automata/search_by_tags` | Поиск автоматов |
| POST | `/automata` | Создание автомата |
| GET | `/automata/{id}`, `/automata/{id}/source` | Автомат, его исходник |
| PATCH | `/automata/{id}` | Обновление (владелец/админ) |
| PATCH | `/automata/{id}/image` | Загрузка изображения (владелец/админ) |
| GET | `/automata/images?ids=...` | Изображения по id |
| DELETE | `/automata/{id}` | Удаление (владелец/админ) |
| GET | `/tags`, `/tags/{id}/automata` | Теги |
| POST | `/tags`, PATCH/DELETE `/tags/{id}` | Теги (изменение требует auth) |

Swagger-описание с тегами: <http://localhost:8000/docs> (теги — `app/routes/api_tags.py`).
