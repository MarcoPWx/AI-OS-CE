#!/usr/bin/env bash
set -euo pipefail

FILE="logs/ce/events.jsonl"
mkdir -p "$(dirname "$FILE")"
if [ ! -f "$FILE" ]; then
  touch "$FILE"
fi

echo "Tailing $FILE (Ctrl+C to stop)"
exec tail -n +1 -F "$FILE"

