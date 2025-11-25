#!/bin/bash
set -e

echo "=================================================="
echo "Starting backend-auth in development mode"
echo "=================================================="
echo "Working directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo ""

# Clear any stale ts-node cache directories
echo "Clearing ts-node cache..."
rm -rf .ts-node 2>/dev/null || true
rm -rf /tmp/ts-node-* 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

# Clear dist folder to prevent stale builds
echo "Clearing dist folder..."
rm -rf dist 2>/dev/null || true

# Ensure node_modules exists
if [ ! -d "node_modules" ]; then
  echo "WARNING: node_modules not found. You may need to run 'pnpm install'"
fi

echo ""
echo "Starting nodemon with hot-reload enabled..."
echo "Watching: src/ and ../../packages/*/src/"
echo "Polling enabled for Docker compatibility"
echo "=================================================="
echo ""

# Start nodemon with explicit environment variables
export TS_NODE_CACHE=false
export TS_NODE_TRANSPILE_ONLY=true
export TS_NODE_FILES=true
export NX_SKIP_NX_CACHE=true

exec npx nodemon
