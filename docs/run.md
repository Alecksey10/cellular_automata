# Запуск проекта

## Сервисы и порты

| Сервис | Порт (хост) | Описание |
|---|---|---|
| frontend | `3000` (docker) / `5173` (dev) | React Router-приложение |
| backend | `8000` | FastAPI, Swagger: <http://localhost:8000/docs> |
| postgres | `8080` | PostgreSQL 18 (внутри сети compose — `5432`) |
| pgadmin | `8081` | pgAdmin 4 |

Два способа запуска: полный через Docker Compose (вариант A) или локальная разработка (вариант B).

## Вариант A. Полный запуск через Docker Compose

```bash
# каталоги для bind-mount (данные postgres, pgadmin, картинки)
mkdir -p datas/backend/postgres_data datas/backend/pgadmin_data datas/backend/images

# права для контейнеров postgres (uid 999) и pgadmin (uid 5050) — первый запуск
sudo chown -R 999:999 datas/backend/postgres_data
sudo chown -R 5050:5050 datas/backend/pgadmin_data

docker compose up --build -d
```

- миграции БД и заполнение ролей выполняются автоматически в `backend/entrypoint.sh` при старте контейнера;
- frontend: <http://localhost:3000>, backend: <http://localhost:8000/docs>, pgAdmin: <http://localhost:8081> (логин `example@mail.ru`, пароль `pass` — см. [configuration.md](./configuration.md)).

Доступ с другой машины: в `/.env` задайте `VITE_API_BASE_URL=http://<IP-хоста>:8000` и добавьте `http://<IP-хоста>:3000` в `CORS_ORIGINS`, затем пересоберите фронт: `docker compose up --build -d frontend backend`.

## Вариант B. Локальная разработка

Код запускается на хосте, в docker — только БД и pgAdmin. Конфигурация бэкенда — `backend/.env` (БД на `localhost:8080`).

### 1. БД и pgAdmin

```bash
docker compose up -d db pgadmin
```

При первом запуске нужны каталоги и права из варианта A.

### 2. Бэкенд

```bash
cd backend
python3 -m venv venv
./venv/bin/pip install -r requirements.txt

./venv/bin/alembic upgrade head      # миграции
./venv/bin/python -m app.db.seeds.seed   # роли: admin/user/moderator

./venv/bin/python -m fastapi dev app/main.py   # либо ./run.sh
```

> При старте сервер кэширует id роли `admin` (lifespan → `initConsts`), поэтому без запущенного seed сервер упадёт с ошибкой «admin role was not cached».

### 3. Фронтенд

```bash
cd frontend/app
npm install
cp .env.example .env    # опционально: по умолчанию адрес API — http://localhost:8000
npm run dev             # http://localhost:5173
```

## Тесты

Бэкенд-тесты (`app/test/mocking/api02/`) ходят по HTTP к **уже запущенному** серверу на `localhost:8000`, поэтому сначала поднимите бэкенд (вариант B, шаг 2).

```bash
cd backend
./venv/bin/python -m pytest -m init -v -c app/test/mocking/api02/pytest.ini
```

Тесты инициализируют данные (теги, автоматы) и не очищают БД за собой.

Типизация фронтенда:

```bash
cd frontend/app
npm run typecheck
```
