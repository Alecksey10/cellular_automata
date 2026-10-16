from __future__ import annotations

import hashlib
from pathlib import Path

from .manifest import Artifact


def artifact_for(root: Path, path: Path) -> Artifact:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return Artifact(
        path=path.relative_to(root).as_posix(),
        size_bytes=path.stat().st_size,
        sha256=digest.hexdigest(),
    )
