#!/usr/bin/env bash
# Soft archive utility: safely archive a directory or file into archives-backup
# Usage:
#   scripts/soft-archive.sh <path-to-archive> [--remove]
# Notes:
# - Archives to: /Users/betolbook/Documents/github/archives-backup
# - Produces: <name>-YYYYMMDD-HHMMSS.tar.gz
# - If --remove is set, deletes the original after a successful archive
set -euo pipefail

TARGET_PATH=${1:-}
REMOVE_FLAG=${2:-}

if [[ -z "$TARGET_PATH" ]]; then
  echo "Usage: $0 <path-to-archive> [--remove]" >&2
  exit 1
fi

if [[ ! -e "$TARGET_PATH" ]]; then
  echo "Error: Target path does not exist: $TARGET_PATH" >&2
  exit 2
fi

ARCHIVE_ROOT="/Users/betolbook/Documents/github/archives-backup"
mkdir -p "$ARCHIVE_ROOT"

BASENAME=$(basename "$TARGET_PATH")
STAMP=$(date +%Y%m%d-%H%M%S)
ARCHIVE_NAME="${BASENAME}-${STAMP}.tar.gz"
ARCHIVE_PATH="${ARCHIVE_ROOT}/${ARCHIVE_NAME}"

# Create the archive (preserve perms, follow symlinks appropriately)
if [[ -d "$TARGET_PATH" ]]; then
  tar -czf "$ARCHIVE_PATH" -C "$(dirname "$TARGET_PATH")" "$BASENAME"
else
  tar -czf "$ARCHIVE_PATH" -C "$(dirname "$TARGET_PATH")" "$BASENAME"
fi

echo "Archived: $TARGET_PATH → $ARCHIVE_PATH"

if [[ "$REMOVE_FLAG" == "--remove" ]]; then
  if [[ -d "$TARGET_PATH" ]]; then
    rm -rf "$TARGET_PATH"
  else
    rm -f "$TARGET_PATH"
  fi
  echo "Removed original after archive: $TARGET_PATH"
fi

