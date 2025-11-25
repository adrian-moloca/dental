#!/usr/bin/env bash
set -euo pipefail

# Use COMPOSE_FILES="docker-compose.prod.yml:docker-compose.local.yml" to layer files
COMPOSE_FILES=${COMPOSE_FILES:-docker-compose.prod.yml}

build_args=()
for f in ${COMPOSE_FILES//:/ }; do
  build_args+=("-f" "$f")
done

echo "[up] Using compose files: ${COMPOSE_FILES}"
docker compose "${build_args[@]}" up -d --build

echo "[up] Stack started. To view logs:"
echo "docker compose ${build_args[*]} logs -f"
