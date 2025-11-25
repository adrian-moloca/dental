#!/bin/bash
set -e

echo "Testing hot-reload configuration..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Check docker-compose file exists
echo "1. Checking docker-compose.dev.yml..."
if [ -f docker-compose.dev.yml ]; then
    echo -e "${GREEN}✓ docker-compose.dev.yml exists${NC}"
else
    echo -e "${RED}✗ docker-compose.dev.yml not found${NC}"
    exit 1
fi

# Test 2: Check nodemon configs exist
echo ""
echo "2. Checking nodemon configurations..."
MISSING_CONFIGS=0
for dir in apps/backend-*; do
    if [ -d "$dir" ]; then
        if [ ! -f "$dir/nodemon.json" ]; then
            echo -e "${RED}✗ Missing nodemon.json in $dir${NC}"
            MISSING_CONFIGS=$((MISSING_CONFIGS + 1))
        fi
    fi
done

if [ $MISSING_CONFIGS -eq 0 ]; then
    echo -e "${GREEN}✓ All backend services have nodemon.json${NC}"
else
    echo -e "${RED}✗ $MISSING_CONFIGS services missing nodemon.json${NC}"
    exit 1
fi

# Test 3: Check vite config has polling
echo ""
echo "3. Checking Vite configuration..."
if grep -q "usePolling: true" apps/web-clinic-portal/vite.config.ts; then
    echo -e "${GREEN}✓ Vite has polling enabled${NC}"
else
    echo -e "${RED}✗ Vite missing polling configuration${NC}"
    exit 1
fi

# Test 4: Check no named volume for node_modules
echo ""
echo "4. Checking volume configuration..."
if ! grep -q "node_modules:/workspace/node_modules" docker-compose.dev.yml; then
    echo -e "${GREEN}✓ No named volume for node_modules (correct)${NC}"
else
    echo -e "${RED}✗ Still using named volume for node_modules${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}All checks passed!${NC}"
echo ""
echo "Next steps:"
echo "1. Stop existing containers: docker compose -f docker-compose.dev.yml down -v"
echo "2. Remove old node_modules volume: docker volume rm dentalos_node_modules 2>/dev/null || true"
echo "3. Start services: docker compose -f docker-compose.dev.yml up -d"
echo "4. Test by editing a file in apps/backend-auth/src and watch logs"
