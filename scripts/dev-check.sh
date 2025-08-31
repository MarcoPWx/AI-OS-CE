#!/usr/bin/env bash
set -euo pipefail

# Colors
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
NC="\033[0m"

ok() { echo -e "${GREEN}✔${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
err() { echo -e "${RED}✖${NC} $1"; }

# Node
if command -v node >/dev/null 2>&1; then
  NODE_VER=$(node -v)
  ok "Node found: $NODE_VER"
else
  err "Node not found. Install Node.js 18+"
  exit 1
fi

# Package manager
if command -v yarn >/dev/null 2>&1; then
  PM="yarn"
  ok "Yarn found: $(yarn -v)"
elif command -v npm >/dev/null 2>&1; then
  PM="npm"
  ok "npm found: $(npm -v)"
else
  err "Neither yarn nor npm found. Install one to proceed."
  exit 1
fi

# Expo
if command -v expo >/dev/null 2>&1; then
  ok "Expo CLI found: $(expo --version)"
else
  warn "Expo CLI not found. You can use 'npx expo start' instead."
fi

# Env vars
REQ=("EXPO_PUBLIC_SUPABASE_URL" "EXPO_PUBLIC_SUPABASE_ANON_KEY")
MISSING=0
for V in "${REQ[@]}"; do
  if [ -z "${!V:-}" ]; then
    warn "$V is not set"
    MISSING=1
  else
    ok "$V is set"
  fi
done

if [ "$MISSING" -eq 1 ]; then
  warn "Some env vars are missing. Offline mode will be used for questions and auth will be limited."
fi

ok "Dev environment check complete."

