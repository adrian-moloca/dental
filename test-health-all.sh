#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

TIMEOUT=180
FAILED=0

declare -A SERVICES=(
    ["auth"]="localhost:3301"
    ["patient"]="localhost:3304"
    ["scheduling"]="localhost:3302"
    ["clinical"]="localhost:3305"
    ["inventory"]="localhost:3308"
    ["enterprise"]="localhost:3317"
    ["provider-schedule"]="localhost:3303"
    ["health-aggregator"]="localhost:3399"
    ["billing"]="localhost:3310"
    ["subscription"]="localhost:3311"
)

WEB_URL="http://localhost:5173"

check_service() {
    local name=$1
    local host=$2
    local endpoint=$3
    local expected_code=${4:-200}

    response=$(curl -s -o /dev/null -w "%{http_code}" "http://${host}${endpoint}" 2>/dev/null || echo "000")

    if [ "$response" = "$expected_code" ]; then
        echo -e "${GREEN}✅${NC} ${name}${endpoint}"
        return 0
    else
        echo -e "${RED}❌${NC} ${name}${endpoint} (got ${response}, expected ${expected_code})"
        return 1
    fi
}

check_json_response() {
    local name=$1
    local host=$2
    local endpoint=$3

    response=$(curl -s "http://${host}${endpoint}" 2>/dev/null || echo "")

    if echo "$response" | jq empty 2>/dev/null; then
        echo -e "${GREEN}✅${NC} ${name}${endpoint} (valid JSON)"
        return 0
    else
        echo -e "${RED}❌${NC} ${name}${endpoint} (invalid JSON)"
        return 1
    fi
}

echo -e "${YELLOW}Waiting for containers to be healthy (max ${TIMEOUT}s)...${NC}"
start_time=$(date +%s)

while true; do
    current_time=$(date +%s)
    elapsed=$((current_time - start_time))

    if [ $elapsed -ge $TIMEOUT ]; then
        echo -e "${RED}Timeout: Containers did not become healthy within ${TIMEOUT}s${NC}"
        exit 1
    fi

    unhealthy=$(docker ps --format "{{.Names}}\t{{.Status}}" | grep -v "healthy" | grep -v "Up" || true)

    if [ -z "$unhealthy" ]; then
        all_healthy=$(docker ps --format "{{.Names}}\t{{.Status}}" | grep "healthy" | wc -l)
        if [ "$all_healthy" -gt 0 ]; then
            echo -e "${GREEN}All containers healthy after ${elapsed}s${NC}"
            break
        fi
    fi

    sleep 2
done

echo ""
echo -e "${YELLOW}Testing service health endpoints...${NC}"
echo ""

for service_name in "${!SERVICES[@]}"; do
    host="${SERVICES[$service_name]}"

    check_service "$service_name" "$host" "/api/v1/health" 200 || FAILED=1
    check_json_response "$service_name" "$host" "/api/v1/health/detailed" || FAILED=1
done

echo ""
echo -e "${YELLOW}Testing web frontend...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" "$WEB_URL" 2>/dev/null || echo "000")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅${NC} web frontend (${WEB_URL})"
else
    echo -e "${RED}❌${NC} web frontend (${WEB_URL}) - got ${response}"
    FAILED=1
fi

echo ""
echo -e "${YELLOW}Checking infrastructure services...${NC}"
# Check for local Docker infrastructure services (postgres, redis, rabbitmq, minio, mailhog)
# Note: This check is optional - infrastructure may be external (AWS RDS, ElastiCache, etc.)
infra_services=$(docker ps --filter "name=dentalos-postgres\|dentalos-redis\|dentalos-rabbitmq\|dentalos-minio\|dentalos-mailhog" --format "{{.Names}}\t{{.Status}}" 2>/dev/null || true)

if [ -z "$infra_services" ]; then
    echo -e "${YELLOW}⚠${NC}  No local infrastructure containers found (may be using external services)"
else
    while IFS=$'\t' read -r name status; do
        if echo "$status" | grep -q "healthy\|Up"; then
            echo -e "${GREEN}✅${NC} $name"
        else
            echo -e "${YELLOW}⚠${NC}  $name - $status (container exists but may not be healthy yet)"
        fi
    done <<< "$infra_services"
fi

echo ""
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All health checks passed!${NC}"
    exit 0
else
    echo -e "${RED}Some health checks failed!${NC}"
    exit 1
fi
