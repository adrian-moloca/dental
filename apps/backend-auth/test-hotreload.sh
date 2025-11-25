#!/bin/bash

echo "=================================================="
echo "Hot-Reload Test Script"
echo "=================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detect which container is running
CONTAINER_NAME=""
if docker ps | grep -q "dentalos-backend-auth"; then
    CONTAINER_NAME="dentalos-backend-auth"
elif docker ps | grep -q "dentalos-auth-1"; then
    CONTAINER_NAME="dentalos-auth-1"
elif docker ps | grep -q "backend-auth"; then
    CONTAINER_NAME="backend-auth"
else
    echo -e "${RED}ERROR: No auth container found running${NC}"
    echo "Please start the container first:"
    echo "  docker compose -f docker-compose.dev.yml up auth -d"
    echo "  OR"
    echo "  cd apps/backend-auth && docker compose up -d"
    exit 1
fi

echo -e "${GREEN}Found container: $CONTAINER_NAME${NC}"
echo ""

# Get initial PID
echo "Step 1: Getting initial process ID..."
INITIAL_PID=$(docker exec $CONTAINER_NAME ps aux | grep 'node.*src/main.ts' | grep -v grep | awk '{print $1}' | head -1)
if [ -z "$INITIAL_PID" ]; then
    echo -e "${RED}ERROR: Could not find node process${NC}"
    echo "Container logs:"
    docker logs $CONTAINER_NAME --tail 50
    exit 1
fi
echo -e "${GREEN}Initial PID: $INITIAL_PID${NC}"
echo ""

# Make a test change
echo "Step 2: Making a test change to src/app.module.ts..."
TEST_FILE="src/app.module.ts"
TIMESTAMP=$(date +%s)
echo "// Hot-reload test at $TIMESTAMP" >> $TEST_FILE
echo -e "${GREEN}Added comment to $TEST_FILE${NC}"
echo ""

# Wait for nodemon to detect and restart
echo "Step 3: Waiting for nodemon to detect change and restart..."
echo "Monitoring container logs for restart message..."
sleep 2

# Check logs for restart message
RESTART_DETECTED=$(docker logs $CONTAINER_NAME --tail 20 2>&1 | grep -i "restarting\|restart")
if [ -n "$RESTART_DETECTED" ]; then
    echo -e "${GREEN}Restart detected in logs:${NC}"
    echo "$RESTART_DETECTED"
else
    echo -e "${YELLOW}WARNING: No restart message found in logs yet${NC}"
fi
echo ""

# Wait a bit more for restart to complete
echo "Waiting for restart to complete..."
sleep 3

# Get new PID
echo "Step 4: Getting new process ID..."
NEW_PID=$(docker exec $CONTAINER_NAME ps aux | grep 'node.*src/main.ts' | grep -v grep | awk '{print $1}' | head -1)
if [ -z "$NEW_PID" ]; then
    echo -e "${RED}ERROR: Could not find node process after change${NC}"
    echo "Container may have crashed. Logs:"
    docker logs $CONTAINER_NAME --tail 50
    exit 1
fi
echo -e "${GREEN}New PID: $NEW_PID${NC}"
echo ""

# Compare PIDs
echo "Step 5: Comparing process IDs..."
if [ "$INITIAL_PID" != "$NEW_PID" ]; then
    echo -e "${GREEN}SUCCESS! Process restarted (PID changed from $INITIAL_PID to $NEW_PID)${NC}"
    echo ""
    echo "Hot-reload is working correctly!"

    # Clean up test change
    echo ""
    echo "Cleaning up test change..."
    git checkout -- $TEST_FILE 2>/dev/null || sed -i "/$TIMESTAMP/d" $TEST_FILE
    echo -e "${GREEN}Test change removed${NC}"

    exit 0
else
    echo -e "${RED}FAILURE! Process did not restart (PID still $INITIAL_PID)${NC}"
    echo ""
    echo "Troubleshooting steps:"
    echo "1. Check container logs for errors:"
    echo "   docker logs $CONTAINER_NAME --tail 50"
    echo ""
    echo "2. Verify volume mounts:"
    echo "   docker inspect $CONTAINER_NAME | grep -A 10 Mounts"
    echo ""
    echo "3. Check if nodemon is running:"
    echo "   docker exec $CONTAINER_NAME ps aux | grep nodemon"
    echo ""
    echo "4. Verify nodemon config:"
    echo "   docker exec $CONTAINER_NAME cat /app/apps/backend-auth/nodemon.json"

    # Don't clean up - leave evidence
    exit 1
fi
