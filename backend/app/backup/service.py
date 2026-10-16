from __future__ import annotations

import shutil
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
from typing import Any

from app.config import Settings, settings

from .errors import BackupError
from .images.archive import ImageArchive
from .metadata.checksum import artifact_for
from .metadata.manifest import BackupManifest
from .postgres.dumper import PostgresDumper
from . import __version__


class BackupService:
    FORMAT_VERSION = 1

    def __init__(self, settings: Settings, *, root: Path):
        self.settings = settings
        self.root = root.resolve()
        self.backup_root = (self.root.parent / "backups").resolve()
        self.images_dir = self._resolve(settings.images_directory)
        self.postgres = PostgresDumper(settings)
        self.images = ImageArchive()

    @classmethod
    def from_environment(cls) -> "BackupService":
        return cls(settings, root=Path.cwd())

    def _resolve(self, path: Path | str) -> Path:
        path = Path(path)
        return (self.root / path).resolve() if not path.is_absolute() else path.resolve()

    def create(self) -> Path:
        if not self.images_dir.is_dir():
            raise BackupError(f"Images directory does not exist: {self.images_dir}")
        self.backup_root.mkdir(parents=True, exist_ok=True)
        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        backup_id = f"{stamp}_{uuid.uuid4().hex[:8]}"
        staging = Path(tempfile.mkdtemp(prefix=f".{backup_id}_", dir=self.backup_root))
        try:
            dump_path = staging / "database.dump"
            self.postgres.dump(dump_path)
            image_path = staging / "images.tar.gz"
            image_count, image_bytes = self.images.create(self.images_dir, image_path)
            artifacts = [artifact_for(staging, dump_path), artifact_for(staging, image_path)]
            manifest = BackupManifest(
                format_version=self.FORMAT_VERSION,
                backup_id=backup_id,
                created_at=datetime.now(timezone.utc),
                database={"name": self.settings.db_name, "host": self.settings.db_host, "format": "postgres-custom"},
                images={"count": image_count, "total_bytes": image_bytes},
                artifacts=artifacts,
                metadata={"creator": "cellular-automata-backup", "creator_version": __version__},
            )
            (staging / "manifest.json").write_text(manifest.model_dump_json(indent=2), encoding="utf-8")
            destination = self.backup_root / backup_id
            staging.rename(destination)
            return destination
        except Exception:
            shutil.rmtree(staging, ignore_errors=True)
            raise

    def _resolve_backup(self, backup: str | None) -> Path:
        if backup is None:
            candidates = sorted(path for path in self.backup_root.iterdir() if path.is_dir() and (path / "manifest.json").is_file()) if self.backup_root.exists() else []
            if not candidates:
                raise BackupError("No backups were found")
            return candidates[-1]
        candidate = Path(backup)
        if not candidate.is_absolute():
            candidate = self.backup_root / candidate
        candidate = candidate.resolve()
        if not candidate.is_relative_to(self.backup_root.resolve()):
            raise BackupError("Backup path must be inside the configured backup directory")
        if not candidate.is_dir():
            raise BackupError(f"Backup directory does not exist: {candidate}")
        return candidate

    def _load_manifest(self, directory: Path) -> BackupManifest:
        try:
            manifest = BackupManifest.model_validate_json((directory / "manifest.json").read_text(encoding="utf-8"))
        except (OSError, ValueError) as exc:
            raise BackupError(f"Invalid or unreadable manifest in {directory}: {exc}") from exc
        if manifest.format_version > self.FORMAT_VERSION:
            raise BackupError(f"Backup format {manifest.format_version} is newer than supported format {self.FORMAT_VERSION}")
        return manifest

    def verify(self, backup: str | None = None) -> BackupManifest:
        directory = self._resolve_backup(backup)
        manifest = self._load_manifest(directory)
        if manifest.backup_id != directory.name:
            raise BackupError("Backup ID in manifest does not match its directory")
        for artifact in manifest.artifacts:
            path = (directory / PurePosixPath(artifact.path)).resolve()
            if not path.is_relative_to(directory.resolve()):
                raise BackupError(f"Artifact path escapes backup directory: {artifact.path}")
            if not path.is_file():
                raise BackupError(f"Backup artifact is missing: {artifact.path}")
            if path.stat().st_size != artifact.size_bytes or artifact_for(directory, path).sha256 != artifact.sha256:
                raise BackupError(f"Backup artifact failed checksum validation: {artifact.path}")
        return manifest

    def list_backups(self) -> list[dict[str, Any]]:
        if not self.backup_root.exists():
            return []
        entries: list[dict[str, Any]] = []
        for directory in sorted(path for path in self.backup_root.iterdir() if path.is_dir()):
            manifest_path = directory / "manifest.json"
            if not manifest_path.is_file():
                continue
            manifest = self._load_manifest(directory)
            entries.append({"backup_id": manifest.backup_id, "created_at": manifest.created_at.isoformat(), "directory": str(directory), "images": manifest.images})
        return entries

    def restore(self, backup: str, *, replace_database: bool = False, replace_images: bool = False, images_only: bool = False) -> None:
        directory = self._resolve_backup(backup)
        manifest = self.verify(str(directory))
        artifacts = {artifact.path: directory / artifact.path for artifact in manifest.artifacts}
        image_archive = artifacts.get("images.tar.gz")
        if image_archive is None:
            raise BackupError("This backup does not contain images.tar.gz")
        if not images_only and not replace_database:
            raise BackupError("Database restore changes objects included in the backup; pass --replace-database to continue")
        if self.images_dir.exists() and any(self.images_dir.iterdir()) and not replace_images:
            raise BackupError("Image directory is not empty; pass --replace-images to replace its contents")
        staged_images = self._prepare_image_restore(image_archive)
        try:
            if not images_only:
                dump_path = artifacts.get("database.dump")
                if dump_path is None:
                    raise BackupError("This backup does not contain database.dump")
                self.postgres.restore(dump_path, clean=True)
            self._install_images(staged_images, replace=replace_images)
        finally:
            shutil.rmtree(staged_images, ignore_errors=True)

    def _prepare_image_restore(self, archive_path: Path) -> Path:
        parent = self.images_dir.parent
        parent.mkdir(parents=True, exist_ok=True)
        return self.images.prepare_restore(archive_path, parent)

    def _install_images(self, temporary: Path, *, replace: bool) -> None:
        if self.images_dir.exists() and any(self.images_dir.iterdir()) and not replace:
            raise BackupError("Image directory is not empty; pass --replace-images to replace its contents")
        if replace and self.images_dir.exists():
            old = self.images_dir.parent / f".{self.images_dir.name}.old-{uuid.uuid4().hex[:8]}"
            self.images_dir.rename(old)
            try:
                temporary.rename(self.images_dir)
            except Exception:
                old.rename(self.images_dir)
                raise
            shutil.rmtree(old)
        else:
            if self.images_dir.exists():
                self.images_dir.rmdir()
            temporary.rename(self.images_dir)

