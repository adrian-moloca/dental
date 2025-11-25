#!/usr/bin/env bash
set -euo pipefail

# One-shot bootstrap: bring up infra, provision env files, build, and run backend services.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

SERVICES=(
  backend-auth
  backend-patient-service
  backend-scheduling
  backend-enterprise-service
  backend-billing-service
  backend-inventory-service
  backend-clinical
)

log() {
  echo "[$(date +%H:%M:%S)] $*"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: $1 is required but not found in PATH." >&2
    exit 1
  fi
}

require_cmd node
require_cmd pnpm
require_cmd docker

if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
else
  echo "Error: Docker Compose is required (docker compose or docker-compose)." >&2
  exit 1
fi

log "Ensuring infra docker environment"
if [ ! -f infra/docker/.env ]; then
  bash infra/docker/scripts/setup.sh
fi
(cd infra/docker && $COMPOSE_CMD up -d)

log "Ensuring service .env files"
for svc in "${SERVICES[@]}"; do
  example="apps/$svc/.env.example"
  target="apps/$svc/.env"
  if [ -f "$example" ] && [ ! -f "$target" ]; then
    cp "$example" "$target"
    log "Created $target (update secrets as needed)"
  fi
done

log "Installing root dependencies if missing"
if [ ! -f node_modules/.modules.yaml ]; then
  pnpm install
else
  log "Dependencies already installed, skipping pnpm install"
fi

log "Building shared packages"
pnpm build:packages

log "Building backend services"
NX_DAEMON=false pnpm build:services

log "Starting backend services (press Ctrl+C to stop)"
concurrently -n "auth,patient,scheduling,enterprise,billing,inventory,clinical" -c "cyan,green,yellow,magenta,blue,red,white" \
  "pnpm start:auth" \
  "pnpm start:patient" \
  "pnpm start:scheduling" \
  "pnpm start:enterprise" \
  "pnpm start:billing" \
  "pnpm start:inventory" \
  "pnpm start:clinical"
