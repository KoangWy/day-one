#!/usr/bin/env bash
set -euo pipefail
task_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$task_root/apps/server"
if [[ "${1:-}" == "--https" ]]; then
  exec uv run uvicorn navigation.main:app --host 0.0.0.0 --port 8443 \
    --no-proxy-headers --no-access-log \
    --ssl-keyfile "$task_root/.certs/lan-key.pem" \
    --ssl-certfile "$task_root/.certs/lan.pem"
fi
exec uv run uvicorn navigation.main:app --host 127.0.0.1 --port 8000 --no-proxy-headers --no-access-log
