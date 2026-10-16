from __future__ import annotations

import argparse
import json
import sys
from pydantic import ValidationError

from .service import BackupError, BackupService


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="python -m app.backup", description="Backup and restore PostgreSQL and image files")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("create", help="create a PostgreSQL and images backup")
    commands.add_parser("list", help="list saved backups")
    verify = commands.add_parser("verify", help="validate metadata and artifact checksums")
    verify.add_argument("backup", nargs="?", help="backup ID or directory; defaults to latest")
    restore = commands.add_parser("restore", help="restore a database and images")
    restore.add_argument("backup", help="backup ID or directory")
    restore.add_argument("--replace-database", action="store_true", help="drop objects in the configured database before restoring")
    restore.add_argument("--replace-images", action="store_true", help="replace files in the configured image directory")
    restore.add_argument("--images-only", action="store_true", help="restore images without changing PostgreSQL")
    return parser


def main() -> None:
    args = _parser().parse_args()
    try:
        service = BackupService.from_environment()
        if args.command == "create":
            print(service.create())
        elif args.command == "list":
            print(json.dumps(service.list_backups(), ensure_ascii=False, indent=2))
        elif args.command == "verify":
            manifest = service.verify(args.backup)
            print(f"OK: {manifest.backup_id}")
        elif args.command == "restore":
            service.restore(
                args.backup,
                replace_database=args.replace_database,
                replace_images=args.replace_images,
                images_only=args.images_only,
            )
            print(f"Restored: {args.backup}")
    except (BackupError, ValidationError, OSError, ValueError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc


if __name__ == "__main__":
    main()
