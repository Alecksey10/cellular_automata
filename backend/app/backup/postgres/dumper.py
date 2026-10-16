from __future__ import annotations

import os
import subprocess
from pathlib import Path

from sqlalchemy.engine import make_url

from app.config import Settings

from ..errors import BackupError


class PostgresDumper:
    """Use PostgreSQL's native archive tools with the application's DB settings."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self.connection = make_url(settings.database_url)

    def dump(self, destination: Path) -> None:
        self._run(
            [
                "pg_dump",
                "--host", self.connection.host or "localhost",
                "--port", str(self.connection.port or self.settings.db_port_inner),
                "--username", self.connection.username or self.settings.db_user,
                "--dbname", self.connection.database or self.settings.db_name,
                "--format=custom",
                "--no-owner",
                "--file", str(destination),
            ],
            operation="PostgreSQL dump",
        )

    def restore(self, source: Path, *, clean: bool) -> None:
        command = [
            "pg_restore",
            "--host", self.connection.host or "localhost",
            "--port", str(self.connection.port or self.settings.db_port_inner),
            "--username", self.connection.username or self.settings.db_user,
            "--dbname", self.connection.database or self.settings.db_name,
            "--no-owner",
            "--exit-on-error",
        ]
        if clean:
            command.extend(["--clean", "--if-exists"])
        command.append(str(source))
        self._run(command, operation="PostgreSQL restore")

    def _run(self, command: list[str], *, operation: str) -> None:
        environment = os.environ.copy()
        environment["PGPASSWORD"] = self.settings.db_pass
        try:
            result = subprocess.run(command, env=environment, capture_output=True, text=True, check=False)
        except FileNotFoundError as exc:
            raise BackupError(f"{command[0]} is not installed or is not on PATH") from exc
        if result.returncode:
            detail = result.stderr.strip() or result.stdout.strip() or f"exit code {result.returncode}"
            raise BackupError(f"{operation} failed: {detail}")
