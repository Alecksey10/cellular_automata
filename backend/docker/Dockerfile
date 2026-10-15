#docker build -t fastapi-app -f ./docker/Dockerfile .
FROM python:3.12-slim
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY alembic/ alembic/
COPY alembic.ini alembic.ini
COPY app/ app/
# Конфигурация подаётся из docker-compose через env_file (/.env в корне
# репозитория); образ не запекает переменные окружения внутри.
COPY entrypoint.sh /entrypoint.sh

EXPOSE 8000

RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]