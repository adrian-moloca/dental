#!/bin/bash

# ================================
# Health Check Script
# ================================
# Verifies all services are running and healthy

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Service Health Check${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Load environment variables
if [ -f .env ]; then
    source .env
fi

# Function to check service health
check_service() {
    local service_name=$1
    local health_command=$2

    echo -n "Checking $service_name... "

    if eval "$health_command" &> /dev/null; then
        echo -e "${GREEN}✓ Healthy${NC}"
        return 0
    else
        echo -e "${RED}✗ Unhealthy${NC}"
        return 1
    fi
}

# Check Docker containers are running
echo -e "${YELLOW}Container Status:${NC}"
docker-compose ps
echo ""

# PostgreSQL
echo -e "${YELLOW}Service Health Checks:${NC}"
check_service "PostgreSQL" \
    "docker exec dental-postgres pg_isready -U ${POSTGRES_USER:-dental_user} -d ${POSTGRES_DB:-dental_db}"

# MongoDB
check_service "MongoDB" \
    "docker exec dental-mongodb mongosh --quiet --eval 'db.adminCommand({ping: 1})'"

# Redis
check_service "Redis" \
    "docker exec dental-redis redis-cli -a ${REDIS_PASSWORD:-redis_password} ping"

# RabbitMQ
check_service "RabbitMQ" \
    "docker exec dental-rabbitmq rabbitmq-diagnostics -q ping"

# OpenSearch
check_service "OpenSearch" \
    "curl -k -s -u admin:${OPENSEARCH_ADMIN_PASSWORD:-Admin@123} https://localhost:9200/_cluster/health"

# OpenSearch Dashboards
check_service "OpenSearch Dashboards" \
    "curl -s -f http://localhost:5601/api/status"

echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Detailed Health Information${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# PostgreSQL version
echo -e "${YELLOW}PostgreSQL Version:${NC}"
docker exec dental-postgres psql -U ${POSTGRES_USER:-dental_user} -d ${POSTGRES_DB:-dental_db} -c "SELECT version();" 2>/dev/null || echo "Not available"
echo ""

# MongoDB version
echo -e "${YELLOW}MongoDB Version:${NC}"
docker exec dental-mongodb mongosh --quiet --eval "db.version()" 2>/dev/null || echo "Not available"
echo ""

# Redis info
echo -e "${YELLOW}Redis Info:${NC}"
docker exec dental-redis redis-cli -a ${REDIS_PASSWORD:-redis_password} INFO server 2>/dev/null | grep -E "redis_version|os|uptime_in_seconds" || echo "Not available"
echo ""

# RabbitMQ status
echo -e "${YELLOW}RabbitMQ Status:${NC}"
docker exec dental-rabbitmq rabbitmqctl status 2>/dev/null | head -n 10 || echo "Not available"
echo ""

# OpenSearch cluster health
echo -e "${YELLOW}OpenSearch Cluster Health:${NC}"
curl -k -s -u admin:${OPENSEARCH_ADMIN_PASSWORD:-Admin@123} https://localhost:9200/_cluster/health?pretty 2>/dev/null || echo "Not available"
echo ""

echo -e "${GREEN}Health check complete!${NC}"
