#!/bin/bash
################################################################################
# DentalOS Port Verification Script
# Verifies all port configurations match the PORT_REGISTRY.txt
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

FAILED=0
CHECKED=0

echo "========================================="
echo "  DentalOS Port Configuration Verification"
echo "========================================="
echo ""

# Check service .env files
echo "Checking service .env files..."
CHECKED=$((CHECKED + 10))

[ "$(grep '^PORT=' apps/backend-auth/.env | cut -d= -f2)" = "3001" ] || { echo -e "${RED}❌ backend-auth/.env PORT != 3001${NC}"; FAILED=$((FAILED + 1)); }
[ "$(grep '^PORT=' apps/backend-scheduling/.env | cut -d= -f2)" = "3002" ] || { echo -e "${RED}❌ backend-scheduling/.env PORT != 3002${NC}"; FAILED=$((FAILED + 1)); }
[ "$(grep '^PORT=' apps/backend-provider-schedule/.env | cut -d= -f2)" = "3003" ] || { echo -e "${RED}❌ backend-provider-schedule/.env PORT != 3003${NC}"; FAILED=$((FAILED + 1)); }
[ "$(grep '^PORT=' apps/backend-patient-service/.env | cut -d= -f2)" = "3004" ] || { echo -e "${RED}❌ backend-patient-service/.env PORT != 3004${NC}"; FAILED=$((FAILED + 1)); }
[ "$(grep '^PORT=' apps/backend-clinical/.env | cut -d= -f2)" = "3005" ] || { echo -e "${RED}❌ backend-clinical/.env PORT != 3005${NC}"; FAILED=$((FAILED + 1)); }
[ "$(grep '^PORT=' apps/backend-inventory-service/.env | cut -d= -f2)" = "3008" ] || { echo -e "${RED}❌ backend-inventory-service/.env PORT != 3008${NC}"; FAILED=$((FAILED + 1)); }
[ "$(grep '^PORT=' apps/backend-billing-service/.env | cut -d= -f2)" = "3010" ] || { echo -e "${RED}❌ backend-billing-service/.env PORT != 3010${NC}"; FAILED=$((FAILED + 1)); }
[ "$(grep '^PORT=' apps/backend-subscription-service/.env | cut -d= -f2)" = "3011" ] || { echo -e "${RED}❌ backend-subscription-service/.env PORT != 3011${NC}"; FAILED=$((FAILED + 1)); }
[ "$(grep '^PORT=' apps/backend-enterprise-service/.env | cut -d= -f2)" = "3017" ] || { echo -e "${RED}❌ backend-enterprise-service/.env PORT != 3017${NC}"; FAILED=$((FAILED + 1)); }
[ "$(grep '^PORT=' apps/backend-health-aggregator/.env | cut -d= -f2)" = "3099" ] || { echo -e "${RED}❌ backend-health-aggregator/.env PORT != 3099${NC}"; FAILED=$((FAILED + 1)); }

echo -e "${GREEN}✓ Service .env files checked${NC}"
echo ""

# Check root .env files
echo "Checking root .env files..."
CHECKED=$((CHECKED + 6))

grep -q "^AUTH_PORT=3001$" .env.docker || { echo -e "${RED}❌ .env.docker AUTH_PORT != 3001${NC}"; FAILED=$((FAILED + 1)); }
grep -q "^PATIENT_PORT=3004$" .env.docker || { echo -e "${RED}❌ .env.docker PATIENT_PORT != 3004${NC}"; FAILED=$((FAILED + 1)); }
grep -q "^HOST_WEB_PORT=5173$" .env.example || { echo -e "${RED}❌ .env.example HOST_WEB_PORT != 5173${NC}"; FAILED=$((FAILED + 1)); }
grep -q "^HOST_REDIS_PORT=6381$" .env.docker || { echo -e "${RED}❌ .env.docker HOST_REDIS_PORT != 6381${NC}"; FAILED=$((FAILED + 1)); }
grep -q "VITE_AUTH_API_URL=http://localhost:3301$" .env.docker || { echo -e "${RED}❌ .env.docker VITE_AUTH_API_URL != 3301${NC}"; FAILED=$((FAILED + 1)); }
grep -q "VITE_PATIENT_API_URL=http://localhost:3304$" .env.docker || { echo -e "${RED}❌ .env.docker VITE_PATIENT_API_URL != 3304${NC}"; FAILED=$((FAILED + 1)); }

echo -e "${GREEN}✓ Root .env files checked${NC}"
echo ""

# Check docker-compose.yml
echo "Checking docker-compose.yml..."
CHECKED=$((CHECKED + 5))

grep -q "PORT: 3001$" docker-compose.yml || { echo -e "${RED}❌ docker-compose.yml Auth PORT != 3001${NC}"; FAILED=$((FAILED + 1)); }
grep -q "PORT: 3004$" docker-compose.yml || { echo -e "${RED}❌ docker-compose.yml Patient PORT != 3004${NC}"; FAILED=$((FAILED + 1)); }
grep -q "PORT: 3010$" docker-compose.yml || { echo -e "${RED}❌ docker-compose.yml Billing PORT != 3010${NC}"; FAILED=$((FAILED + 1)); }
grep -q "PORT: 3011$" docker-compose.yml || { echo -e "${RED}❌ docker-compose.yml Subscription PORT != 3011${NC}"; FAILED=$((FAILED + 1)); }
grep -q "PORT: 3099$" docker-compose.yml || { echo -e "${RED}❌ docker-compose.yml Health-Aggregator PORT != 3099${NC}"; FAILED=$((FAILED + 1)); }

echo -e "${GREEN}✓ docker-compose.yml checked${NC}"
echo ""

# Summary
echo "========================================="
echo "  Verification Summary"
echo "========================================="
echo "Total checks: $CHECKED"
echo "Failed checks: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All port configurations are correct!${NC}"
    exit 0
else
    echo -e "${RED}✗ Port configuration errors found!${NC}"
    echo "Please review and fix the issues above."
    exit 1
fi
