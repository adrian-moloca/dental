#!/bin/bash

# Test Runner Script for Backend Subscription Service
# Runs all test suites with proper configuration and reporting

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Header
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Backend Subscription Service Tests${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Function to run tests
run_tests() {
    local test_type=$1
    local command=$2

    echo -e "${BLUE}Running ${test_type}...${NC}"
    if eval "$command"; then
        echo -e "${GREEN}✓ ${test_type} passed${NC}"
        return 0
    else
        echo -e "${RED}✗ ${test_type} failed${NC}"
        return 1
    fi
}

# Parse arguments
TEST_TYPE=${1:-"all"}

case "$TEST_TYPE" in
    "unit")
        echo -e "${YELLOW}Running Unit Tests Only${NC}"
        run_tests "Unit Tests" "npm run test:unit"
        ;;

    "integration")
        echo -e "${YELLOW}Running Integration Tests Only${NC}"
        run_tests "Integration Tests" "npm run test:integration"
        ;;

    "coverage")
        echo -e "${YELLOW}Running Tests with Coverage${NC}"
        run_tests "Unit Tests with Coverage" "npm run test:coverage"
        run_tests "Integration Tests with Coverage" "npm run test:coverage:e2e"

        echo ""
        echo -e "${BLUE}Coverage Reports:${NC}"
        echo "  Unit: coverage/unit/index.html"
        echo "  E2E:  coverage/e2e/index.html"
        ;;

    "cabinets")
        echo -e "${YELLOW}Running Cabinet Tests Only${NC}"
        run_tests "Cabinet E2E Tests" "npx vitest run test/integration/cabinets.e2e.spec.ts"
        ;;

    "subscriptions")
        echo -e "${YELLOW}Running Subscription Tests Only${NC}"
        run_tests "Subscription E2E Tests" "npx vitest run test/integration/subscriptions.e2e.spec.ts"
        ;;

    "watch")
        echo -e "${YELLOW}Running Tests in Watch Mode${NC}"
        npm run test:watch
        ;;

    "all")
        echo -e "${YELLOW}Running All Tests${NC}"

        # Type check first
        echo ""
        run_tests "Type Check" "npm run typecheck" || true

        # Lint
        echo ""
        run_tests "Linting" "npm run lint" || true

        # Unit tests
        echo ""
        run_tests "Unit Tests" "npm run test:unit"

        # Integration tests
        echo ""
        run_tests "Integration Tests" "npm run test:integration"

        echo ""
        echo -e "${GREEN}================================${NC}"
        echo -e "${GREEN}All tests completed successfully!${NC}"
        echo -e "${GREEN}================================${NC}"
        ;;

    "help")
        echo "Usage: ./test-runner.sh [option]"
        echo ""
        echo "Options:"
        echo "  all           - Run all tests (default)"
        echo "  unit          - Run unit tests only"
        echo "  integration   - Run integration/E2E tests only"
        echo "  coverage      - Run tests with coverage reports"
        echo "  cabinets      - Run cabinet tests only"
        echo "  subscriptions - Run subscription tests only"
        echo "  watch         - Run tests in watch mode"
        echo "  help          - Show this help message"
        echo ""
        echo "Examples:"
        echo "  ./test-runner.sh"
        echo "  ./test-runner.sh unit"
        echo "  ./test-runner.sh coverage"
        ;;

    *)
        echo -e "${RED}Unknown option: $TEST_TYPE${NC}"
        echo "Run './test-runner.sh help' for usage information"
        exit 1
        ;;
esac

echo ""
