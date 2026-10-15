# Конфигурация

## Файлы конфигурации

| Файл | Кто читает | Назначение |
|---|---|---|
| `/.env` | docker-compose (корневой) | Полный запуск: передаётся в контейнер backend (`env_file`) и в сборку фронта (build arg) |
| `backend/.env` | pydantic-settings (`app/config.py`) | Локальная разработка бэкенда (БД на `localhost`) |
| `frontend/app/.env` | Vite (dev/build) | Локальная разработка фронта; в git не попадает, шаблон — `frontend/app/.env.example` |

Ранее существовавшие дубликаты `backend/Dockered.env` и `backend/docker-compose.yml` удалены: образ backend не запекает переменные внутри, все значения приходят из окружения.

## Переменные окружения

| Переменная | Файл(и) | Описание |
|---|---|---|
| `BACKEND_API_HOST`, `BACKEND_API_PORT` | оба env бэкенда | Хост/порт бэкенда (используются, например, в базовом URL тестов) |
| `DB_HOST` | оба env бэкенда | `localhost` локально, имя сервиса `db` в docker |
| `DB_PORT_OUTER` | оба env бэкенда | Порт PostgreSQL на хосту (`8080`) |
| `DB_PORT_INNER` | оба env бэкенда | Порт PostgreSQL внутри сети (`5432`); входит в `database_url` |
| `DB_USER`, `DB_PASS`, `DB_NAME` | оба env бэкенда | Учётные данные и имя БД |
| `PGADMIN_EMAIL`, `PGADMIN_PASSWORD`, `PGADMIN_PORT` | `/.env` | pgAdmin 4 (порт на хосту `8081`) |
| `JWT_SECRET_KEY`, `JWT_ALGORITHM`, `JWT_EXPIRE_MINUTES` | оба env бэкенда | Подпись и срок жизни JWT (`HS256`, 1440 мин) |
| `IMAGES_DIRECTORY` | оба env бэкенда | Каталог изображений **относительно рабочего каталога процесса backend**; в docker это `/app` → `/app/app/images/images_data` |
| `BACKEND_DATA_DIRECTORY` | `/.env` | Базовый каталог bind-mount данных compose (postgres, pgadmin, картинки) |
| `CORS_ORIGINS` | оба env бэкенда | Разрешённые CORS-источники через запятую (по умолчанию `http://localhost:3000,5173,8000`) |
| `VITE_API_BASE_URL` | `/.env` (сборка в docker) или `frontend/app/.env` (локально) | Базовый адрес backend API, зашивается в клиентский бандл; по умолчанию `http://localhost:8000` |

## Доступ с другой машины

Пример с адресом хоста `192.168.50.218`:

1. В `/.env`:
   ```ini
   VITE_API_BASE_URL=http://192.168.50.218:8000
   CORS_ORIGINS=http://192.168.50.218:3000,http://localhost:3000,http://localhost:5173,http://localhost:8000
   ```
2. Пересобрать контейнеры: `docker compose up --build -d frontend backend`.

Локальная разработка: `VITE_API_BASE_URL` — в `frontend/app/.env`, `CORS_ORIGINS` — в `backend/.env`.

## Порты

| Порт | Сервис |
|---|---|
| 3000 | frontend (docker) |
| 5173 | frontend (Vite dev) |
| 8000 | backend API (+ `/docs`) |
| 8080 | PostgreSQL на хосту |
| 8081 | pgAdmin |
