#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE=${COMPOSE_FILE:-docker-compose.prod.yml}
TAG=${1:-latest}

echo "[build-images] Building all service images with tag '${TAG}'"
docker compose -f "${COMPOSE_FILE}" build --build-arg NODE_VERSION=20-slim

echo "[build-images] Tagging images with '${TAG}' (docker compose already tags as latest; retag if needed)"
# Example retag (uncomment to push to a registry):
# docker tag dentalos-auth:latest <your-registry>/dentalos-auth:${TAG}
