#!/bin/bash

# DentalOS Microservices Health Check Script
# This script monitors the health of all microservices and infrastructure

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.dev.yml}"
TIMEOUT=2
RETRIES=3
DETAILED_OUTPUT="${1:-false}"
EXPORT_JSON="${EXPORT_JSON:-false}"

# Initialize counters
HEALTHY=0
UNHEALTHY=0
UNKNOWN=0
SERVICES_TESTED=0

# JSON output array
JSON_RESULTS="[]"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
    ((HEALTHY++))
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    ((UNKNOWN++))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((UNHEALTHY++))
}

add_json_result() {
    local service=$1
    local status=$2
    local message=$3
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    local json_item="{\"service\":\"$service\",\"status\":\"$status\",\"message\":\"$message\",\"timestamp\":\"$timestamp\"}"
    JSON_RESULTS=$(echo "$JSON_RESULTS" | jq ". += [$json_item]")
}

test_port() {
    local host=$1
    local port=$2
    timeout $TIMEOUT bash -c "echo >/dev/tcp/$host/$port" 2>/dev/null
}

test_health_endpoint() {
    local url=$1
    local name=$2

    local response=$(curl -s -w "\n%{http_code}" -X GET "$url" 2>/dev/null | tail -1)

    if [ "$response" == "200" ]; then
        return 0
    else
        return 1
    fi
}

# Header
clear
echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        DentalOS Microservices Health Check Report              ║"
echo "║                    $(date '+%Y-%m-%d %H:%M:%S UTC')                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Check Docker daemon
log_info "Checking Docker daemon..."
if docker ps &>/dev/null; then
    log_success "Docker daemon is running"
else
    log_error "Docker daemon is not running"
    exit 1
fi

# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    log_error "Docker compose file not found: $COMPOSE_FILE"
    exit 1
fi

echo ""
echo -e "${BLUE}═══ INFRASTRUCTURE SERVICES ══════════════════════════════════${NC}\n"

# Define infrastructure services
declare -a INFRA_SERVICES=(
    "postgres:5433:PostgreSQL Auth DB"
    "postgres-subscription:5434:PostgreSQL Subscription DB"
    "redis:6381:Redis Cache"
    "mongo:27018:MongoDB"
    "rabbitmq:15672:RabbitMQ Management"
    "minio:9001:MinIO Console"
)

for service_info in "${INFRA_SERVICES[@]}"; do
    IFS=':' read -r service port description <<< "$service_info"
    ((SERVICES_TESTED++))

    printf "%-30s" "$description"

    if test_port localhost $port; then
        log_success "listening on port $port"
        add_json_result "$service" "healthy" "Listening on port $port"
    else
        log_error "not responding on port $port"
        add_json_result "$service" "unhealthy" "Not responding on port $port"
    fi
done

echo ""
echo -e "${BLUE}═══ APPLICATION SERVICES ═════════════════════════════════════${NC}\n"

# Define application services with health endpoints
declare -A APP_SERVICES=(
    ["auth:3301"]="http://localhost:3301/api/v1/health:Authentication Service"
    ["scheduling:3302"]="http://localhost:3302/api/v1/health:Scheduling Service"
    ["provider-schedule:3303"]="http://localhost:3303/api/v1/health:Provider Schedule Service"
    ["patient:3304"]="http://localhost:3304/api/v1/health:Patient Service"
    ["clinical:3305"]="http://localhost:3305/api/v1/health:Clinical Service"
    ["inventory:3308"]="http://localhost:3308/api/v1/health:Inventory Service"
    ["billing:3310"]="http://localhost:3310/api/v1/health:Billing Service"
    ["subscription:3311"]="http://localhost:3311/api/v1/health:Subscription Service"
    ["enterprise:3317"]="http://localhost:3317/api/v1/health:Enterprise Service"
    ["health-aggregator:3399"]="http://localhost:3399/api/v1/health:Health Aggregator"
)

for service_key in "${!APP_SERVICES[@]}"; do
    IFS=':' read -r service_name port <<< "$service_key"
    IFS=':' read -r endpoint description <<< "${APP_SERVICES[$service_key]}"
    ((SERVICES_TESTED++))

    printf "%-30s" "$description"

    if test_port localhost $port; then
        if test_health_endpoint "$endpoint" "$service_name"; then
            log_success "healthy"
            add_json_result "$service_name" "healthy" "Health endpoint responding"
        else
            log_warning "running but health check failed (HTTP error)"
            add_json_result "$service_name" "degraded" "Health endpoint not responding"
        fi
    else
        log_error "not running"
        add_json_result "$service_name" "unhealthy" "Port not open"
    fi
done

echo ""
echo -e "${BLUE}═══ DOCKER CONTAINER STATUS ══════════════════════════════════${NC}\n"

# Get container status
docker-compose -f "$COMPOSE_FILE" ps --format "table {{.Names}}\t{{.Status}}\t{{.State}}" 2>/dev/null | while read line; do
    if [ ! -z "$line" ] && [[ ! "$line" =~ ^NAME ]]; then
        echo -e "${CYAN}$line${NC}"
    fi
done

echo ""
echo -e "${BLUE}═══ DEPENDENCY ANALYSIS ══════════════════════════════════════${NC}\n"

# Check critical dependencies
log_info "Checking core service dependencies..."

# Auth service depends on postgres, redis, rabbitmq
if test_port localhost 5433 && test_port localhost 6381 && test_port localhost 5672; then
    log_success "Auth service dependencies ready (postgres, redis, rabbitmq)"
else
    log_warning "Auth service dependencies incomplete"
fi

# MongoDB services
if test_port localhost 27018; then
    log_success "MongoDB ready for dependent services"
else
    log_warning "MongoDB not ready - scheduling, patient, clinical, inventory, billing, enterprise may fail"
fi

# Subscription service
if test_port localhost 5434 && test_port localhost 6381; then
    log_success "Subscription service dependencies ready (postgres-subscription, redis)"
else
    log_warning "Subscription service dependencies incomplete"
fi

echo ""
echo -e "${BLUE}═══ NETWORK ANALYSIS ═════════════════════════════════════════${NC}\n"

# Check Docker network
if docker network inspect dental-dev &>/dev/null; then
    log_success "Docker network 'dental-dev' exists"

    # Get network details
    echo -e "\n${CYAN}Network Details:${NC}"
    docker network inspect dental-dev --format='
    Name: {{.Name}}
    Driver: {{.Driver}}
    Connected Containers: {{len .Containers}}
    ' 2>/dev/null
else
    log_warning "Docker network 'dental-dev' not found"
fi

echo ""
echo -e "${BLUE}═══ SUMMARY ══════════════════════════════════════════════════${NC}\n"

echo "Services Tested:  $SERVICES_TESTED"
echo -e "Healthy:         ${GREEN}$HEALTHY${NC}"
echo -e "Unhealthy:       ${RED}$UNHEALTHY${NC}"
echo -e "Unknown/Warning: ${YELLOW}$UNKNOWN${NC}"

# Calculate overall health percentage
TOTAL=$((HEALTHY + UNHEALTHY + UNKNOWN))
if [ $TOTAL -gt 0 ]; then
    HEALTH_PERCENT=$(( (HEALTHY * 100) / TOTAL ))

    echo -e "\n${CYAN}Overall Health:${NC}"
    if [ $HEALTH_PERCENT -eq 100 ]; then
        echo -e "${GREEN}✓ All services healthy ($HEALTH_PERCENT%)${NC}"
    elif [ $HEALTH_PERCENT -ge 80 ]; then
        echo -e "${YELLOW}⚠ Most services healthy ($HEALTH_PERCENT%)${NC}"
    else
        echo -e "${RED}✗ Many services down ($HEALTH_PERCENT%)${NC}"
    fi
fi

echo ""
echo -e "${BLUE}═══ RECOMMENDATIONS ══════════════════════════════════════════${NC}\n"

if [ $UNHEALTHY -eq 0 ] && [ $UNKNOWN -eq 0 ]; then
    log_success "All systems operational. No action needed."
elif [ $SERVICES_TESTED -eq $TOTAL ] && [ $HEALTHY -eq 0 ]; then
    log_info "All services are down. Start them with:"
    echo -e "  ${CYAN}./launch_docker.sh dev --wait${NC}"
else
    if [ $UNHEALTHY -gt 0 ]; then
        log_info "Some services are unhealthy. Check logs with:"
        echo -e "  ${CYAN}docker-compose -f $COMPOSE_FILE logs${NC}"
    fi

    if [ $UNKNOWN -gt 0 ]; then
        log_info "Some services are running but not responding. Give them more time or check:"
        echo -e "  ${CYAN}docker-compose -f $COMPOSE_FILE ps${NC}"
    fi
fi

echo ""
echo -e "${BLUE}═══ DETAILED STATUS ══════════════════════════════════════════${NC}\n"

if [ "$DETAILED_OUTPUT" == "detailed" ] || [ "$DETAILED_OUTPUT" == "-v" ] || [ "$DETAILED_OUTPUT" == "--verbose" ]; then
    echo "Service Logs (last 5 lines):"
    echo ""
    docker-compose -f "$COMPOSE_FILE" ps --services 2>/dev/null | while read service; do
        echo -e "${CYAN}$service:${NC}"
        docker-compose -f "$COMPOSE_FILE" logs "$service" --tail=5 2>/dev/null | sed 's/^/  /'
        echo ""
    done
fi

# Export JSON if requested
if [ "$EXPORT_JSON" == "true" ]; then
    OUTPUT_FILE="health-check-report-$(date +%Y%m%d-%H%M%S).json"
    echo "$JSON_RESULTS" | jq . > "$OUTPUT_FILE"
    log_info "Health check report exported to: $OUTPUT_FILE"
fi

echo ""
echo -e "${BLUE}═══ REPORT GENERATED ═════════════════════════════════════════${NC}"
echo "Time: $(date)"
echo ""

exit 0
