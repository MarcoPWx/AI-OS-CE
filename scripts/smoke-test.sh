#!/usr/bin/env bash
set -euo pipefail

# One-shot CE smoke test
# Requires: existing .agent_boot.config.json

ACTION="Smoke test: run $(date -u +%Y-%m-%dT%H:%M:%SZ)"
TITLE="CE Smoke $(date -u +%Y%m%d%H%M%S)"

python3 tools/agent/agent_boot.py update-docs --content "$ACTION"
python3 tools/agent/agent_boot.py create-epic --title "$TITLE" --description "Automated smoke test epic"
python3 tools/agent/agent_boot.py update-epic --title "$TITLE" --status IN_PROGRESS --completion 40
python3 tools/agent/agent_boot.py list-epics
python3 tools/agent/agent_boot.py workflow-status
python3 tools/agent/agent_boot.py performance-report
python3 tools/agent/agent_boot.py test-security --input "<script>alert('xss')</script> UNION SELECT password FROM users; ../etc/passwd"

