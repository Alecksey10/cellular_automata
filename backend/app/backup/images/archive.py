from __future__ import annotations

import tarfile
import tempfile
import shutil
from pathlib import Path, PurePosixPath

from ..errors import BackupError


class ImageArchive:
    def create(self, source: Path, destination: Path) -> tuple[int, int]:
        if not source.is_dir():
            raise BackupError(f"Images directory does not exist: {source}")
        files = sorted(path for path in source.rglob("*") if path.is_file())
        for path in files:
            if path.is_symlink():
                raise BackupError(f"Symbolic links are not supported in image directory: {path}")
        with tarfile.open(destination, "w:gz") as archive:
            for path in files:
                archive.add(path, arcname=path.relative_to(source).as_posix(), recursive=False)
        return len(files), sum(path.stat().st_size for path in files)

    def prepare_restore(self, archive_path: Path, parent: Path) -> Path:
        temporary = Path(tempfile.mkdtemp(prefix=".restore-images-", dir=parent))
        try:
            with tarfile.open(archive_path, "r:gz") as archive:
                members = archive.getmembers()
                for member in members:
                    path = PurePosixPath(member.name)
                    if path.is_absolute() or ".." in path.parts or not (member.isfile() or member.isdir()):
                        raise BackupError(f"Unsafe image archive entry: {member.name}")
                archive.extractall(temporary, members=members, filter="data")
            return temporary
        except Exception:
            shutil.rmtree(temporary, ignore_errors=True)
            raise
