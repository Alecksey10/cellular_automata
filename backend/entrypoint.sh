#!/bin/sh
set -e

if [ "$1" = "shell" ]; then
    exec sh
fi

echo "Running database migrations..."
alembic upgrade head

echo "Running database seeds..."
python -m app.db.seeds.seed

exec uvicorn app.main:app --host 0.0.0.0 --port 8000