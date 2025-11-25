#!/bin/bash

###############################################################################
# Authentication Service Test Script
#
# Tests all authentication endpoints:
# - POST /auth/register - Register new user
# - POST /auth/login - Login existing user
# - POST /auth/refresh - Refresh tokens
# - POST /auth/logout - Logout session
# - GET /auth/me - Get current user
#
# Requirements:
# - Backend auth service running on http://localhost:3301
# - PostgreSQL database running
# - Redis running
#
# Usage:
#   chmod +x test-auth.sh
#   ./test-auth.sh
###############################################################################

set -e  # Exit on error

# Configuration
API_URL="http://localhost:3301"
ORGANIZATION_ID="550e8400-e29b-41d4-a716-446655440000"
TEST_EMAIL="test.user@dentalos.com"
TEST_PASSWORD="SecureP@ssw0rd123"
TEST_FIRST_NAME="Test"
TEST_LAST_NAME="User"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_header() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Check if backend is running
print_header "CHECKING PREREQUISITES"
print_info "Checking if backend auth service is running..."
if curl -s -f "${API_URL}/health" > /dev/null 2>&1; then
    print_success "Backend auth service is running"
else
    print_error "Backend auth service is NOT running at ${API_URL}"
    print_info "Start the service with: npm run start:dev"
    exit 1
fi

# Test 1: Register new user
print_header "TEST 1: POST /auth/register - Register New User"
print_info "Registering user: ${TEST_EMAIL}"

REGISTER_RESPONSE=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"firstName\": \"${TEST_FIRST_NAME}\",
    \"lastName\": \"${TEST_LAST_NAME}\",
    \"organizationId\": \"${ORGANIZATION_ID}\"
  }" || echo "ERROR")

if echo "$REGISTER_RESPONSE" | grep -q '"accessToken"'; then
    print_success "User registered successfully"

    # Extract tokens
    ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    REFRESH_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)
    USER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

    print_info "Access Token: ${ACCESS_TOKEN:0:50}..."
    print_info "Refresh Token: ${REFRESH_TOKEN:0:50}..."
    print_info "User ID: ${USER_ID}"
else
    # Check if user already exists (409 Conflict)
    if echo "$REGISTER_RESPONSE" | grep -q '409\|already exists'; then
        print_info "User already exists - testing login instead"

        # Test 2: Login existing user
        print_header "TEST 2: POST /auth/login - Login Existing User"
        print_info "Logging in as: ${TEST_EMAIL}"

        LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
          -H "Content-Type: application/json" \
          -d "{
            \"email\": \"${TEST_EMAIL}\",
            \"password\": \"${TEST_PASSWORD}\",
            \"organizationId\": \"${ORGANIZATION_ID}\"
          }")

        if echo "$LOGIN_RESPONSE" | grep -q '"accessToken"'; then
            print_success "Login successful"

            # Extract tokens
            ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
            REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)
            USER_ID=$(echo "$LOGIN_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

            print_info "Access Token: ${ACCESS_TOKEN:0:50}..."
            print_info "Refresh Token: ${REFRESH_TOKEN:0:50}..."
            print_info "User ID: ${USER_ID}"
        else
            print_error "Login failed"
            echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
            exit 1
        fi
    else
        print_error "Registration failed"
        echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"
        exit 1
    fi
fi

# Test 3: Get current user
print_header "TEST 3: GET /auth/me - Get Current User"
print_info "Fetching current user with access token..."

ME_RESPONSE=$(curl -s -X GET "${API_URL}/auth/me" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "$ME_RESPONSE" | grep -q '"email"'; then
    print_success "Current user fetched successfully"
    echo "$ME_RESPONSE" | jq '.' 2>/dev/null || echo "$ME_RESPONSE"
else
    print_error "Failed to fetch current user"
    echo "$ME_RESPONSE" | jq '.' 2>/dev/null || echo "$ME_RESPONSE"
fi

# Test 4: Refresh tokens
print_header "TEST 4: POST /auth/refresh - Refresh Tokens"
print_info "Refreshing tokens..."

REFRESH_RESPONSE=$(curl -s -X POST "${API_URL}/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"${REFRESH_TOKEN}\",
    \"organizationId\": \"${ORGANIZATION_ID}\"
  }")

if echo "$REFRESH_RESPONSE" | grep -q '"accessToken"'; then
    print_success "Tokens refreshed successfully"

    # Extract new tokens
    NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    NEW_REFRESH_TOKEN=$(echo "$REFRESH_RESPONSE" | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)

    print_info "New Access Token: ${NEW_ACCESS_TOKEN:0:50}..."
    print_info "New Refresh Token: ${NEW_REFRESH_TOKEN:0:50}..."

    # Update tokens for subsequent tests
    ACCESS_TOKEN="$NEW_ACCESS_TOKEN"
    REFRESH_TOKEN="$NEW_REFRESH_TOKEN"
else
    print_error "Token refresh failed"
    echo "$REFRESH_RESPONSE" | jq '.' 2>/dev/null || echo "$REFRESH_RESPONSE"
fi

# Test 5: List active sessions
print_header "TEST 5: GET /auth/sessions - List Active Sessions"
print_info "Fetching active sessions..."

SESSIONS_RESPONSE=$(curl -s -X GET "${API_URL}/auth/sessions" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "$SESSIONS_RESPONSE" | grep -q '\['; then
    print_success "Active sessions fetched successfully"
    SESSION_COUNT=$(echo "$SESSIONS_RESPONSE" | jq 'length' 2>/dev/null || echo "0")
    print_info "Active sessions: ${SESSION_COUNT}"

    # Extract first session ID for logout test
    SESSION_ID=$(echo "$SESSIONS_RESPONSE" | jq -r '.[0].id' 2>/dev/null || echo "")
    if [ -n "$SESSION_ID" ] && [ "$SESSION_ID" != "null" ]; then
        print_info "Session ID: ${SESSION_ID}"
    fi
else
    print_error "Failed to fetch sessions"
    echo "$SESSIONS_RESPONSE" | jq '.' 2>/dev/null || echo "$SESSIONS_RESPONSE"
fi

# Test 6: Logout session
if [ -n "$SESSION_ID" ] && [ "$SESSION_ID" != "null" ]; then
    print_header "TEST 6: POST /auth/logout - Logout Session"
    print_info "Logging out session: ${SESSION_ID}"

    LOGOUT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/auth/logout" \
      -H "Authorization: Bearer ${ACCESS_TOKEN}" \
      -H "Content-Type: application/json" \
      -d "{
        \"sessionId\": \"${SESSION_ID}\"
      }")

    HTTP_CODE=$(echo "$LOGOUT_RESPONSE" | tail -n1)

    if [ "$HTTP_CODE" = "204" ]; then
        print_success "Session logged out successfully (HTTP 204)"
    else
        print_error "Logout failed (HTTP ${HTTP_CODE})"
        echo "$LOGOUT_RESPONSE" | head -n-1
    fi
else
    print_info "Skipping logout test - no session ID available"
fi

# Summary
print_header "TEST SUMMARY"
print_success "All authentication tests completed!"
print_info "Next steps:"
echo "  1. Check the database: SELECT * FROM users WHERE email = '${TEST_EMAIL}';"
echo "  2. Check Redis sessions: redis-cli KEYS 'dentalos:auth:session:*'"
echo "  3. Test with Postman or your frontend application"
echo ""
