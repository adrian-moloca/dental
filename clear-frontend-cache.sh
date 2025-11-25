#!/usr/bin/env bash

#
# Clear Frontend Cache Script
#
# Use this script when frontend code isn't updating properly.
# It clears all Vite caches and build artifacts.
#

set -e

echo "🧹 Clearing Frontend Caches"
echo "=============================="
echo ""

# Stop web container if running
echo "1. Stopping web container..."
docker compose -f docker-compose.dev.yml stop web 2>/dev/null || true

# Clear local caches
echo "2. Clearing local cache directories..."
rm -rf apps/web-clinic-portal/dist 2>/dev/null || true
rm -rf apps/web-clinic-portal/node_modules/.vite 2>/dev/null || true
rm -rf apps/web-clinic-portal/.vite 2>/dev/null || true

# Clear Docker temp cache
echo "3. Clearing Docker temp cache..."
docker run --rm -v "$(pwd)":/workspace alpine sh -c 'rm -rf /tmp/vite-cache' 2>/dev/null || true

# Remove web container to force rebuild
echo "4. Removing web container..."
docker compose -f docker-compose.dev.yml rm -f web 2>/dev/null || true

echo ""
echo "✅ Frontend caches cleared!"
echo ""
echo "Next steps:"
echo "  1. Start services: ./launch_docker.sh dev"
echo "  2. Wait for Vite to start"
echo "  3. Hard refresh browser: Ctrl+Shift+R (Linux/Win) or Cmd+Shift+R (Mac)"
echo "  4. Check DevTools widget in bottom-right of page for build time"
echo ""
echo "If issues persist:"
echo "  - Check browser dev tools console for errors"
echo "  - Check docker logs: docker compose -f docker-compose.dev.yml logs web"
echo "  - Try clearing browser cache completely"
echo ""
