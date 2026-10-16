from __future__ import annotations

from datetime import datetime, timezone
from pathlib import PurePosixPath
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class Artifact(BaseModel):
    model_config = ConfigDict(extra="forbid")

    path: str
    size_bytes: int = Field(ge=0)
    sha256: str = Field(pattern=r"^[0-9a-f]{64}$")

    @field_validator("path")
    @classmethod
    def safe_relative_path(cls, value: str) -> str:
        path = PurePosixPath(value)
        if path.is_absolute() or not value or ".." in path.parts:
            raise ValueError("Artifact path must stay inside the backup directory")
        return value


class BackupManifest(BaseModel):
    """Versioned, extensible JSON metadata for one backup snapshot."""

    model_config = ConfigDict(extra="allow")

    format_version: int = Field(ge=1)
    backup_id: str
    created_at: datetime
    database: dict[str, Any]
    images: dict[str, Any]
    artifacts: list[Artifact]
    metadata: dict[str, Any] = Field(default_factory=dict)

    @model_validator(mode="after")
    def require_unique_artifacts(self) -> "BackupManifest":
        paths = [artifact.path for artifact in self.artifacts]
        if len(paths) != len(set(paths)):
            raise ValueError("Artifact paths must be unique")
        return self

    @field_validator("created_at")
    @classmethod
    def require_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None:
            raise ValueError("created_at must include a timezone")
        return value.astimezone(timezone.utc)
