#!/bin/bash

#############################################################################
# DentalOS Complete Login Flow End-to-End Test Script
#
# This script tests the complete login flow including:
# - Health check verification
# - Valid login scenarios
# - Invalid credentials handling
# - Missing field validation
# - Response structure validation
#
# Usage:
#   ./test-login-flow.sh                     # Run all tests
#   ./test-login-flow.sh --verbose           # Run with verbose output
#   ./test-login-flow.sh --health-only       # Check health only
#   ./test-login-flow.sh --login-only        # Test login endpoint only
#
# Requirements:
#   - curl (command line HTTP client)
#   - jq (JSON query tool)
#   - Auth service running on http://localhost:3301
#############################################################################

set -euo pipefail

# Configuration
API_BASE_URL="http://localhost:3301/api/v1"
HEALTH_ENDPOINT="${API_BASE_URL}/health"
LOGIN_ENDPOINT="${API_BASE_URL}/auth/login-smart"

# Test credentials
TEST_USER_EMAIL="admin@dentalos.local"
TEST_USER_PASSWORD="Password123!"
TEST_USER_INVALID_PASSWORD="WrongPassword123!"
TEST_USER_NONEXISTENT="nonexistent@dentalos.local"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Parse command line arguments
VERBOSE=false
HEALTH_ONLY=false
LOGIN_ONLY=false

while [[ $# -gt 0 ]]; do
  case $1 in
  --verbose)
    VERBOSE=true
    shift
    ;;
  --health-only)
    HEALTH_ONLY=true
    shift
    ;;
  --login-only)
    LOGIN_ONLY=true
    shift
    ;;
  *)
    echo "Unknown option: $1"
    exit 1
    ;;
  esac
done

#############################################################################
# Helper Functions
#############################################################################

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[PASS]${NC} $1"
}

log_failure() {
  echo -e "${RED}[FAIL]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_debug() {
  if [[ $VERBOSE == true ]]; then
    echo -e "${YELLOW}[DEBUG]${NC} $1"
  fi
}

test_case() {
  local test_name=$1
  TESTS_RUN=$((TESTS_RUN + 1))
  echo ""
  log_info "Test $TESTS_RUN: $test_name"
}

test_pass() {
  local message=$1
  TESTS_PASSED=$((TESTS_PASSED + 1))
  log_success "$message"
}

test_fail() {
  local message=$1
  TESTS_FAILED=$((TESTS_FAILED + 1))
  log_failure "$message"
}

# Make HTTP request and return response
make_request() {
  local method=$1
  local endpoint=$2
  local data=$3
  local output_file="/tmp/response_$$_${RANDOM}.json"

  log_debug "Making $method request to $endpoint"
  log_debug "Request body: $data"

  if [[ -n "$data" ]]; then
    curl -s -w "\n%{http_code}" \
      -X "$method" \
      "${API_BASE_URL}${endpoint}" \
      -H "Content-Type: application/json" \
      -d "$data" >"$output_file"
  else
    curl -s -w "\n%{http_code}" \
      -X "$method" \
      "${API_BASE_URL}${endpoint}" >"$output_file"
  fi

  cat "$output_file"
  rm -f "$output_file"
}

# Parse HTTP response - last line is status code
extract_status_code() {
  tail -n 1
}

extract_response_body() {
  head -n -1
}

# Validate JSON response
validate_json() {
  local json=$1
  if echo "$json" | jq empty 2>/dev/null; then
    echo true
  else
    echo false
  fi
}

# Check if JWT token is valid format
validate_jwt_format() {
  local token=$1
  if [[ $token =~ ^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$ ]]; then
    echo true
  else
    echo false
  fi
}

# Decode JWT payload (without signature verification)
decode_jwt_payload() {
  local token=$1
  local payload=$(echo "$token" | cut -d'.' -f2)
  echo "$payload" | base64 -d 2>/dev/null || echo ""
}

#############################################################################
# Test Suite
#############################################################################

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  DentalOS Login Flow End-to-End Test Suite                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

#############################################################################
# Test 1: Health Check
#############################################################################

if [[ $LOGIN_ONLY != true ]]; then
  test_case "Health Check - Service is Running"

  response=$(make_request GET "/health" "")
  status_code=$(echo "$response" | extract_status_code)
  body=$(echo "$response" | extract_response_body)

  if [[ "$status_code" == "200" ]]; then
    test_pass "Health endpoint returns 200 status"
  else
    test_fail "Health endpoint returned $status_code (expected 200)"
    log_debug "Response: $body"
  fi

  if [[ $(validate_json "$body") == "true" ]]; then
    test_pass "Health response is valid JSON"
  else
    test_fail "Health response is not valid JSON"
    log_debug "Response: $body"
  fi
fi

#############################################################################
# Test 2: Valid Login
#############################################################################

if [[ $HEALTH_ONLY != true ]]; then
  test_case "Valid Login - Correct Credentials"

  request_body=$(cat <<EOF
{
  "email": "$TEST_USER_EMAIL",
  "password": "$TEST_USER_PASSWORD"
}
EOF
)

  response=$(make_request POST "/auth/login-smart" "$request_body")
  status_code=$(echo "$response" | extract_status_code)
  body=$(echo "$response" | extract_response_body)

  log_debug "Response status: $status_code"
  log_debug "Response body: $body"

  if [[ "$status_code" == "200" ]]; then
    test_pass "Login endpoint returns 200 status"

    if [[ $(validate_json "$body") == "true" ]]; then
      test_pass "Login response is valid JSON"

      # Extract tokens
      access_token=$(echo "$body" | jq -r '.accessToken // empty' 2>/dev/null || echo "")
      refresh_token=$(echo "$body" | jq -r '.refreshToken // empty' 2>/dev/null || echo "")
      needs_org_selection=$(echo "$body" | jq -r '.needsOrgSelection // empty' 2>/dev/null || echo "")

      if [[ -n "$access_token" ]]; then
        test_pass "Response contains accessToken"

        if [[ $(validate_jwt_format "$access_token") == "true" ]]; then
          test_pass "accessToken is valid JWT format"

          payload=$(decode_jwt_payload "$access_token")
          log_debug "Decoded JWT payload: $payload"

          if [[ $(echo "$payload" | jq 'has("email")' 2>/dev/null) == "true" ]]; then
            test_pass "JWT payload contains email claim"
          else
            test_fail "JWT payload missing email claim"
          fi

          if [[ $(echo "$payload" | jq 'has("sub")' 2>/dev/null) == "true" ]]; then
            test_pass "JWT payload contains sub claim"
          else
            test_fail "JWT payload missing sub claim"
          fi
        else
          test_fail "accessToken is not in valid JWT format"
        fi
      else
        test_fail "Response does not contain accessToken"
      fi

      if [[ -n "$refresh_token" ]]; then
        test_pass "Response contains refreshToken"

        if [[ $(validate_jwt_format "$refresh_token") == "true" ]]; then
          test_pass "refreshToken is valid JWT format"
        else
          test_fail "refreshToken is not in valid JWT format"
        fi
      else
        test_fail "Response does not contain refreshToken"
      fi

      if [[ "$needs_org_selection" == "false" ]]; then
        test_pass "needsOrgSelection is false (single org)"
      else
        log_warning "needsOrgSelection is $needs_org_selection (multi-org scenario)"
      fi

      # Check user info
      user_id=$(echo "$body" | jq -r '.user.id // empty' 2>/dev/null || echo "")
      user_email=$(echo "$body" | jq -r '.user.email // empty' 2>/dev/null || echo "")

      if [[ -n "$user_id" ]]; then
        test_pass "Response contains user.id"
      else
        test_fail "Response missing user.id"
      fi

      if [[ "$user_email" == "$TEST_USER_EMAIL" ]]; then
        test_pass "User email matches login credentials"
      else
        test_fail "User email does not match (got $user_email, expected $TEST_USER_EMAIL)"
      fi
    else
      test_fail "Login response is not valid JSON"
    fi
  else
    test_fail "Login endpoint returned $status_code (expected 200)"
    log_debug "Response: $body"
  fi

  #############################################################################
  # Test 3: Invalid Password
  #############################################################################

  test_case "Invalid Login - Wrong Password"

  request_body=$(cat <<EOF
{
  "email": "$TEST_USER_EMAIL",
  "password": "$TEST_USER_INVALID_PASSWORD"
}
EOF
)

  response=$(make_request POST "/auth/login-smart" "$request_body")
  status_code=$(echo "$response" | extract_status_code)
  body=$(echo "$response" | extract_response_body)

  if [[ "$status_code" == "401" ]]; then
    test_pass "Login with wrong password returns 401 Unauthorized"
  else
    test_fail "Login with wrong password returned $status_code (expected 401)"
    log_debug "Response: $body"
  fi

  access_token=$(echo "$body" | jq -r '.accessToken // empty' 2>/dev/null || echo "")
  if [[ -z "$access_token" ]]; then
    test_pass "Response does not contain accessToken"
  else
    test_fail "Response should not contain accessToken for failed login"
  fi

  #############################################################################
  # Test 4: Non-existent User
  #############################################################################

  test_case "Invalid Login - Non-existent User"

  request_body=$(cat <<EOF
{
  "email": "$TEST_USER_NONEXISTENT",
  "password": "$TEST_USER_PASSWORD"
}
EOF
)

  response=$(make_request POST "/auth/login-smart" "$request_body")
  status_code=$(echo "$response" | extract_status_code)
  body=$(echo "$response" | extract_response_body)

  if [[ "$status_code" == "401" ]]; then
    test_pass "Login with non-existent user returns 401 Unauthorized"
  else
    test_fail "Login with non-existent user returned $status_code (expected 401)"
    log_debug "Response: $body"
  fi

  #############################################################################
  # Test 5: Missing Password Field
  #############################################################################

  test_case "Validation Error - Missing Password Field"

  request_body=$(cat <<EOF
{
  "email": "$TEST_USER_EMAIL"
}
EOF
)

  response=$(make_request POST "/auth/login-smart" "$request_body")
  status_code=$(echo "$response" | extract_status_code)
  body=$(echo "$response" | extract_response_body)

  if [[ "$status_code" == "400" ]]; then
    test_pass "Request with missing password returns 400 Bad Request"
  else
    test_fail "Request with missing password returned $status_code (expected 400)"
    log_debug "Response: $body"
  fi

  #############################################################################
  # Test 6: Missing Email Field
  #############################################################################

  test_case "Validation Error - Missing Email Field"

  request_body=$(cat <<EOF
{
  "password": "$TEST_USER_PASSWORD"
}
EOF
)

  response=$(make_request POST "/auth/login-smart" "$request_body")
  status_code=$(echo "$response" | extract_status_code)
  body=$(echo "$response" | extract_response_body)

  if [[ "$status_code" == "400" ]]; then
    test_pass "Request with missing email returns 400 Bad Request"
  else
    test_fail "Request with missing email returned $status_code (expected 400)"
    log_debug "Response: $body"
  fi

  #############################################################################
  # Test 7: Invalid Email Format
  #############################################################################

  test_case "Validation Error - Invalid Email Format"

  request_body=$(cat <<EOF
{
  "email": "not-an-email",
  "password": "$TEST_USER_PASSWORD"
}
EOF
)

  response=$(make_request POST "/auth/login-smart" "$request_body")
  status_code=$(echo "$response" | extract_status_code)
  body=$(echo "$response" | extract_response_body)

  if [[ "$status_code" == "400" ]]; then
    test_pass "Request with invalid email format returns 400 Bad Request"
  else
    test_fail "Request with invalid email format returned $status_code (expected 400)"
    log_debug "Response: $body"
  fi

  #############################################################################
  # Test 8: Empty Email String
  #############################################################################

  test_case "Validation Error - Empty Email String"

  request_body=$(cat <<EOF
{
  "email": "",
  "password": "$TEST_USER_PASSWORD"
}
EOF
)

  response=$(make_request POST "/auth/login-smart" "$request_body")
  status_code=$(echo "$response" | extract_status_code)
  body=$(echo "$response" | extract_response_body)

  if [[ "$status_code" == "400" ]]; then
    test_pass "Request with empty email returns 400 Bad Request"
  else
    test_fail "Request with empty email returned $status_code (expected 400)"
    log_debug "Response: $body"
  fi

  #############################################################################
  # Test 9: Empty Password String
  #############################################################################

  test_case "Validation Error - Empty Password String"

  request_body=$(cat <<EOF
{
  "email": "$TEST_USER_EMAIL",
  "password": ""
}
EOF
)

  response=$(make_request POST "/auth/login-smart" "$request_body")
  status_code=$(echo "$response" | extract_status_code)
  body=$(echo "$response" | extract_response_body)

  if [[ "$status_code" == "400" ]]; then
    test_pass "Request with empty password returns 400 Bad Request"
  else
    test_fail "Request with empty password returned $status_code (expected 400)"
    log_debug "Response: $body"
  fi

  #############################################################################
  # Test 10: Content-Type Header
  #############################################################################

  test_case "Response Headers - Content-Type"

  response_with_headers=$(curl -s -i -X POST \
    "${API_BASE_URL}/auth/login-smart" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$TEST_USER_EMAIL\", \"password\": \"$TEST_USER_PASSWORD\"}")

  if echo "$response_with_headers" | grep -q "application/json"; then
    test_pass "Response contains Content-Type: application/json"
  else
    test_fail "Response does not contain Content-Type: application/json"
    log_debug "Headers: $(echo "$response_with_headers" | head -20)"
  fi

fi

#############################################################################
# Test Summary
#############################################################################

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Test Summary                                                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Total Tests Run:    $TESTS_RUN"
echo -e "Tests Passed:       ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed:       ${RED}$TESTS_FAILED${NC}"
echo ""

if [[ $TESTS_FAILED -eq 0 ]]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed.${NC}"
  exit 1
fi
