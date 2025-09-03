# Soft Archive (Operations)

This utility archives any file or directory into a timestamped tarball under your archival root, so we never permanently delete by accident.

- Script: scripts/soft-archive.sh
- Archive root: /Users/betolbook/Documents/github/archives-backup
- Filename format: <name>-YYYYMMDD-HHMMSS.tar.gz

Usage
- Dry run (keep original):
  ```bash
  scripts/soft-archive.sh /path/to/thing
  ```
- Archive and remove original (for collisions):
  ```bash
  scripts/soft-archive.sh /path/to/thing --remove
  ```

Examples
- Archive a repo folder before renaming/removing:
  ```bash
  scripts/soft-archive.sh /Users/betolbook/Documents/github/SomeRepo --remove
  ```
- Archive a single file:
  ```bash
  scripts/soft-archive.sh /Users/betolbook/Documents/github/SomeRepo/README.md
  ```

Notes
- Archives are local-only and private.
- Ensure there is enough disk space under /Users/betolbook/Documents/github/archives-backup.
- For large directories, consider adding the archive to cloud backup after creation.

