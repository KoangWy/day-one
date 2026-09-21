#!/usr/bin/env bash
set -euo pipefail
if [[ $# -ne 1 ]]; then
  echo 'Usage: bash scripts/setup_https.sh <laptop-LAN-IP>' >&2
  exit 2
fi
if ! command -v mkcert >/dev/null; then
  echo 'Install mkcert first: brew install mkcert (macOS) or winget install FiloSottile.mkcert (Windows)' >&2
  exit 1
fi
task_root="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$task_root/.certs"
mkcert -cert-file "$task_root/.certs/lan.pem" -key-file "$task_root/.certs/lan-key.pem" localhost 127.0.0.1 ::1 "$1"
chmod 600 "$task_root/.certs/lan-key.pem"
echo 'Certificate generated. Install/trust only rootCA.pem on the demo devices; never copy rootCA-key.pem.'
echo 'See docs/PROTOTYPE_RUNBOOK.md for device trust steps.'
