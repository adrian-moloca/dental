#!/usr/bin/env bash
set -euo pipefail

# Simple stack launcher inspired by smambu workflow.
# - Installs deps (shared pnpm store)
# - Builds shared packages
# - Builds services that need a dist ahead of watch (subscription, scheduling)
# - Brings up docker-compose.dev.yml with .env.docker
#
# Usage:
#   ./launch-stack.sh [--no-build] [--reset]
#     --no-build  Skip package/service builds (just compose up)
#     --reset     docker compose down -v before starting

COMPOSE_FILE=${COMPOSE_FILE:-docker-compose.dev.yml}
ENV_FILE=${ENV_FILE:-.env.docker}
NO_BUILD=0
RESET=0

for arg in "$@"; do
  case "$arg" in
    --no-build) NO_BUILD=1 ;;
    --reset) RESET=1 ;;
    *) ;;
  esac
done

echo "Using compose file: ${COMPOSE_FILE}"
echo "Using env file: ${ENV_FILE}"

if [ "$RESET" = "1" ]; then
  echo "[reset] Stopping and removing containers/volumes..."
  docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" down -v || true
fi

if [ "$NO_BUILD" = "0" ]; then
  echo "[bootstrap] Installing deps (shared pnpm store)..."
  docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" run --rm bootstrap

  echo "[build] Building shared packages..."
  pnpm build:packages

  echo "[build] Building services that need dist artifacts..."
  pnpm --filter @dentalos/backend-subscription-service build
  pnpm --filter @dentalos/backend-scheduling build
fi

echo "[up] Starting stack. Use Ctrl+C to stop."
docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" up
