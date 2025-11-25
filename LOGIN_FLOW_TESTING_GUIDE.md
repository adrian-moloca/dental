# DentalOS Login Flow - Complete Testing Guide

## Overview

This guide provides comprehensive instructions for testing the DentalOS authentication and login flow, including:
- Manual testing with curl commands
- Automated testing with the provided test script
- End-to-end testing with the test suite
- Continuous Integration setup

**Test Coverage:** 24+ test scenarios covering happy paths, error handling, validation, and edge cases

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Infrastructure Setup](#infrastructure-setup)
4. [Manual Testing](#manual-testing)
5. [Automated Testing](#automated-testing)
6. [End-to-End Testing](#end-to-end-testing)
7. [Continuous Integration](#continuous-integration)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Option 1: Using the Test Script (Fastest)

```bash
# Navigate to project root
cd /home/adrian/Desktop/SBD-Projects/personal/preclinic/dental

# Run all login flow tests
./test-login-flow.sh

# Run with verbose output for debugging
./test-login-flow.sh --verbose

# Run health check only
./test-login-flow.sh --health-only

# Run login tests only
./test-login-flow.sh --login-only
```

### Option 2: Using E2E Test Suite

```bash
# From backend-auth directory
cd /home/adrian/Desktop/SBD-Projects/personal/preclinic/dental/apps/backend-auth

# Run E2E tests
pnpm test:e2e

# Run with watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

---

## Prerequisites

### Required Tools

- **curl** - HTTP client (usually pre-installed)
- **jq** - JSON query tool
  ```bash
  # macOS
  brew install jq

  # Ubuntu/Debian
  sudo apt-get install jq

  # CentOS/RHEL
  sudo yum install jq
  ```

- **pnpm** - Package manager (should be installed in the project)
- **Node.js** - v18+ (for running services)

### Verify Tools

```bash
curl --version
jq --version
pnpm --version
node --version
```

---

## Infrastructure Setup

The authentication service requires the following external services to be running:

### Option 1: Docker Compose (Recommended)

Docker Compose automatically sets up all required services.

```bash
cd /home/adrian/Desktop/SBD-Projects/personal/preclinic/dental

# Start all services
docker compose -f docker-compose.dev.yml up -d

# Check service status
docker compose -f docker-compose.dev.yml ps

# View logs for auth service
docker compose -f docker-compose.dev.yml logs -f backend-auth

# Stop all services
docker compose -f docker-compose.dev.yml down
```

### Option 2: Local Services (Alternative)

If you prefer to run services locally:

#### Start PostgreSQL

```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql
sudo systemctl start postgresql

# Windows (using WSL)
sudo service postgresql start

# Verify connection
psql -U postgres -c "SELECT 1"
```

#### Start Redis

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis-server

# Windows (using WSL)
sudo service redis-server start

# Verify connection
redis-cli ping
```

#### Configure Environment Variables

Update the `.env` file in `apps/backend-auth/` with local connection strings:

```bash
cd /home/adrian/Desktop/SBD-Projects/personal/preclinic/dental/apps/backend-auth

# Edit .env file
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=dentalos_auth

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TLS=false
```

### Start Backend Auth Service

After infrastructure is running:

```bash
cd /home/adrian/Desktop/SBD-Projects/personal/preclinic/dental/apps/backend-auth

# Install dependencies (if not already done)
pnpm install

# Start in development mode
pnpm start:dev

# Service should be accessible at http://localhost:3301
```

### Seed Test Data

The test users must exist in the database:

```bash
cd /home/adrian/Desktop/SBD-Projects/personal/preclinic/dental/apps/backend-auth

# Run seed script to populate test users
pnpm seed:users
```

### Verify Services Are Running

```bash
# Check auth service health
curl http://localhost:3301/api/v1/health | jq .

# Check PostgreSQL
psql -U postgres -c "SELECT 1"

# Check Redis
redis-cli ping

# Check all services
./verify-ports.sh  # if available
```

---

## Manual Testing

### Test 1: Health Check

Verify the auth service is running and healthy:

```bash
curl -s http://localhost:3301/api/v1/health | jq .
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-24T20:00:00.000Z"
}
```

**Expected Status:** 200 OK

---

### Test 2: Valid Login (Single Organization)

Test successful login with valid credentials:

```bash
curl -X POST http://localhost:3301/api/v1/auth/login-smart \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dentalos.local",
    "password": "Password123!"
  }' | jq .
```

**Expected Response:**
```json
{
  "needsOrgSelection": false,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@dentalos.local",
    "firstName": "Admin",
    "lastName": "User",
    "roles": ["admin"],
    "tenantId": "550e8400-e29b-41d4-a716-446655440001"
  }
}
```

**Expected Status:** 200 OK

---

### Test 3: Invalid Password

Test login rejection with wrong password:

```bash
curl -X POST http://localhost:3301/api/v1/auth/login-smart \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dentalos.local",
    "password": "WrongPassword123!"
  }' | jq .
```

**Expected Response:**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

**Expected Status:** 401 Unauthorized

---

### Test 4: Non-Existent User

Test login rejection for non-existent user:

```bash
curl -X POST http://localhost:3301/api/v1/auth/login-smart \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@dentalos.local",
    "password": "Password123!"
  }' | jq .
```

**Expected Response:**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

**Expected Status:** 401 Unauthorized

---

### Test 5: Missing Password

Test validation error when password is missing:

```bash
curl -X POST http://localhost:3301/api/v1/auth/login-smart \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dentalos.local"
  }' | jq .
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": ["Password is required"],
  "error": "Bad Request"
}
```

**Expected Status:** 400 Bad Request

---

### Test 6: Missing Email

Test validation error when email is missing:

```bash
curl -X POST http://localhost:3301/api/v1/auth/login-smart \
  -H "Content-Type: application/json" \
  -d '{
    "password": "Password123!"
  }' | jq .
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": ["Invalid email format"],
  "error": "Bad Request"
}
```

**Expected Status:** 400 Bad Request

---

### Test 7: Invalid Email Format

Test validation error for invalid email format:

```bash
curl -X POST http://localhost:3301/api/v1/auth/login-smart \
  -H "Content-Type: application/json" \
  -d '{
    "email": "not-an-email",
    "password": "Password123!"
  }' | jq .
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": ["Invalid email format"],
  "error": "Bad Request"
}
```

**Expected Status:** 400 Bad Request

---

### Test 8: Multi-Organization Scenario

Test login for user with multiple organizations:

```bash
curl -X POST http://localhost:3301/api/v1/auth/login-smart \
  -H "Content-Type: application/json" \
  -d '{
    "email": "shared.user@dentalos.local",
    "password": "Password123!"
  }' | jq .
```

**Expected Response:**
```json
{
  "needsOrgSelection": true,
  "organizations": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Sunshine Dental Group",
      "logoUrl": "https://cdn.dentalos.com/logos/sunshine-dental.png"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Downtown Clinic",
      "logoUrl": "https://cdn.dentalos.com/logos/downtown.png"
    }
  ]
}
```

**Expected Status:** 200 OK

---

## Automated Testing

### Using the Test Script

The provided bash script automates all manual tests:

```bash
cd /home/adrian/Desktop/SBD-Projects/personal/preclinic/dental

# Run all tests
./test-login-flow.sh
```

**Output Example:**

```
╔════════════════════════════════════════════════════════════════╗
║  DentalOS Login Flow End-to-End Test Suite                    ║
╚════════════════════════════════════════════════════════════════╝

[INFO] Test 1: Health Check - Service is Running
[PASS] Health endpoint returns 200 status
[PASS] Health response is valid JSON

[INFO] Test 2: Valid Login - Correct Credentials
[PASS] Login endpoint returns 200 status
[PASS] Login response is valid JSON
[PASS] Response contains accessToken
[PASS] accessToken is valid JWT format
[PASS] JWT payload contains email claim
[PASS] JWT payload contains sub claim
[PASS] Response contains refreshToken
[PASS] refreshToken is valid JWT format
[PASS] needsOrgSelection is false (single org)
[PASS] Response contains user.id
[PASS] User email matches login credentials

[INFO] Test 3: Invalid Login - Wrong Password
[PASS] Login with wrong password returns 401 Unauthorized
[PASS] Response does not contain accessToken

...

╔════════════════════════════════════════════════════════════════╗
║  Test Summary                                                  ║
╚════════════════════════════════════════════════════════════════╝

Total Tests Run:    24
Tests Passed:       24
Tests Failed:       0

All tests passed!
```

### Script Options

```bash
# Run all tests with verbose output
./test-login-flow.sh --verbose

# Run only health check
./test-login-flow.sh --health-only

# Run only login tests
./test-login-flow.sh --login-only
```

---

## End-to-End Testing

### Using Vitest E2E Suite

The comprehensive E2E test suite covers 24+ test scenarios:

```bash
cd /home/adrian/Desktop/SBD-Projects/personal/preclinic/dental/apps/backend-auth

# Run E2E tests
pnpm test:e2e

# Run with watch mode for development
pnpm test:watch

# Run with coverage report
pnpm test:coverage

# Run specific test file
pnpm test:e2e -- test/e2e/auth-login-flow.e2e.spec.ts
```

### Test Suite Coverage

The E2E suite includes tests for:

#### 1. Health Check (1 test)
- Service health verification

#### 2. Valid Credentials (3 tests)
- Successful login (single org)
- JWT token validation
- User data structure validation

#### 3. Multi-Organization Flow (2 tests)
- Organization list response
- Organization structure validation

#### 4. Invalid Credentials (2 tests)
- Wrong password rejection
- Non-existent user rejection
- Case sensitivity handling

#### 5. Validation Errors (6 tests)
- Missing password
- Missing email
- Invalid email format
- Empty email string
- Empty password string
- Various email format variations

#### 6. Rate Limiting (2 tests)
- Rate limit enforcement
- Rate limit headers presence

#### 7. Edge Cases (5 tests)
- Extra fields in request
- Whitespace handling
- Very long strings
- Special characters
- Content-Type header validation

#### 8. CORS Headers (1 test)
- CORS configuration validation

---

## Continuous Integration

### GitHub Actions Setup

Create `.github/workflows/test-login-flow.yml`:

```yaml
name: Login Flow Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: dentalos_auth
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 10.22.0

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build packages
        run: pnpm run build:packages:ordered

      - name: Start auth service
        run: |
          cd apps/backend-auth
          pnpm install
          pnpm seed:users &
          sleep 5
          pnpm start:dev &
          sleep 10

      - name: Run E2E tests
        run: |
          cd apps/backend-auth
          pnpm test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        if: always()
        with:
          files: ./apps/backend-auth/coverage/coverage-final.json
```

### Running Tests Locally in CI Mode

```bash
# Start services in background
docker compose -f docker-compose.dev.yml up -d

# Wait for services to be healthy
sleep 15

# Run tests
cd /home/adrian/Desktop/SBD-Projects/personal/preclinic/dental/apps/backend-auth
pnpm install
pnpm test:e2e

# Cleanup
docker compose -f docker-compose.dev.yml down
```

---

## Troubleshooting

### Service Connection Issues

**Problem:** `Connection refused` on localhost:3301

**Solution:**
```bash
# Check if service is running
lsof -i :3301

# Check service status
curl -v http://localhost:3301/api/v1/health

# Start the service
cd apps/backend-auth
pnpm start:dev
```

### Database Connection Issues

**Problem:** `Error: connect ECONNREFUSED` for PostgreSQL

**Solution:**
```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Start PostgreSQL (macOS)
brew services start postgresql

# Start PostgreSQL (Linux)
sudo systemctl start postgresql

# Check .env file has correct credentials
cat apps/backend-auth/.env | grep DATABASE_
```

### Redis Connection Issues

**Problem:** `Error: connect ETIMEDOUT` for Redis

**Solution:**
```bash
# Check if Redis is running
redis-cli ping

# Start Redis (macOS)
brew services start redis

# Start Redis (Linux)
sudo systemctl start redis-server

# Check Redis configuration
redis-cli CONFIG GET port
```

### Test Data Not Found

**Problem:** Login tests fail with 401 for known users

**Solution:**
```bash
# Seed test data
cd apps/backend-auth
pnpm seed:users

# Verify data exists
psql -U postgres dentalos_auth -c "SELECT email FROM users LIMIT 5"
```

### Rate Limiting Test Failures

**Problem:** Rate limit tests are intermittent

**Solution:**
- These tests may need to be skipped in some environments
- Rate limiting is time-based and may conflict with test execution timing
- Use `it.skip()` to disable time-sensitive tests in CI

### JWT Token Validation Issues

**Problem:** Tokens are invalid or expired

**Solution:**
```bash
# Decode JWT payload (for debugging)
curl -s http://localhost:3301/api/v1/auth/login-smart \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dentalos.local","password":"Password123!"}' | \
  jq '.accessToken | split(".")[1] | @base64d | fromjson'

# Check JWT configuration
cat apps/backend-auth/.env | grep JWT_
```

---

## Test Results Interpretation

### Successful Test Run

```
All tests passed!
Total Tests Run:    24
Tests Passed:       24
Tests Failed:       0
Exit Code: 0
```

### Failed Test Run

```
Some tests failed.
Total Tests Run:    24
Tests Passed:       20
Tests Failed:       4
Exit Code: 1
```

Check the output for specific test failures and debug accordingly.

---

## Performance Benchmarks

### Expected Response Times

| Scenario | Time | Notes |
|----------|------|-------|
| Health check | <10ms | No DB access |
| Valid login | 50-200ms | Includes password hashing (Argon2) |
| Invalid password | 50-200ms | Full hash verification |
| Validation error | <5ms | Request validation only |
| Multi-org scenario | 50-200ms | Includes org lookup |

### Load Testing

For load testing the login endpoint:

```bash
# Using Apache Bench
ab -n 1000 -c 10 -p data.json -T application/json \
  http://localhost:3301/api/v1/auth/login-smart

# Using wrk (install: brew install wrk)
wrk -t4 -c100 -d30s \
  -s script.lua \
  http://localhost:3301/api/v1/auth/login-smart
```

---

## Next Steps

1. **Run the quick-start test script** to verify everything works
2. **Execute the E2E test suite** for comprehensive coverage
3. **Set up CI/CD** integration if not already done
4. **Document any custom test credentials** for your environment
5. **Monitor test results** and adjust as needed

---

## Support & Documentation

- **API Documentation:** http://localhost:3301/api/docs
- **Test Files:**
  - E2E Tests: `/apps/backend-auth/test/e2e/auth-login-flow.e2e.spec.ts`
  - Test Script: `/test-login-flow.sh`
  - Report: `/LOGIN_FLOW_TEST_REPORT.md`

---

## Version History

- **v1.0** - November 24, 2025: Initial test suite and documentation
  - 24+ test scenarios
  - Bash automation script
  - Vitest E2E suite
  - Comprehensive troubleshooting guide
