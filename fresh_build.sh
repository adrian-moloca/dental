#!/bin/bash

set -e

REMOVE_VOLUMES=false
SEED=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --volumes)
      REMOVE_VOLUMES=true
      shift
      ;;
    --seed)
      SEED=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Stopping Docker containers..."
docker-compose down 2>/dev/null || true

echo "Removing cache directories..."
find "$PROJECT_ROOT" -type d -name dist -exec rm -rf {} + 2>/dev/null || true
find "$PROJECT_ROOT" -type d -name .vite -exec rm -rf {} + 2>/dev/null || true
rm -rf "$PROJECT_ROOT/node_modules/.vite" 2>/dev/null || true

if [ "$REMOVE_VOLUMES" = true ]; then
  echo "Removing Docker volumes..."
  docker-compose down --volumes 2>/dev/null || true
fi

echo "Cleaning node_modules and lock files..."
rm -rf "$PROJECT_ROOT/node_modules" 2>/dev/null || true
rm -f "$PROJECT_ROOT/pnpm-lock.yaml" 2>/dev/null || true

echo "Installing dependencies..."
cd "$PROJECT_ROOT"
pnpm install

echo "Building project..."
pnpm build

if [ "$SEED" = true ]; then
  echo "Seeding database..."
  docker-compose up -d
  sleep 5
  pnpm seed 2>/dev/null || true
fi

echo "Fresh build complete!"
