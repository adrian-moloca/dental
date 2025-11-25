#!/bin/bash

################################################################################
# RBAC Performance Test Suite - Complete Test Execution Script
#
# AUTH-004 GROUP 3 - Final Performance Validation & Scaling Analysis
#
# This script executes all load tests in sequence and generates a comprehensive
# performance report.
#
# Prerequisites:
#   - k6 v0.45.0+ installed
#   - Backend-auth service running
#   - PostgreSQL and Redis accessible
#   - Valid JWT tokens configured
#
# Usage:
#   ./run-all-tests.sh [environment]
#
# Arguments:
#   environment: local|staging|production (default: local)
#
# Example:
#   ./run-all-tests.sh staging
#
# Output:
#   - Test results in test/load/results/
#   - Summary report in test/load/results/SUMMARY.md
#   - JSON metrics in test/load/results/*.json
#
################################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="${1:-local}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_DIR="${SCRIPT_DIR}/results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Environment-specific configuration
case "$ENVIRONMENT" in
  local)
    export BASE_URL="http://localhost:3301"
    ;;
  staging)
    export BASE_URL="https://staging-api.dentalos.com"
    ;;
  production)
    export BASE_URL="https://api.dentalos.com"
    ;;
  *)
    echo -e "${RED}Error: Invalid environment. Use: local|staging|production${NC}"
    exit 1
    ;;
esac

# Check prerequisites
check_prerequisites() {
  echo -e "${BLUE}Checking prerequisites...${NC}"

  # Check k6
  if ! command -v k6 &> /dev/null; then
    echo -e "${RED}Error: k6 not installed. Install from: https://k6.io/docs/get-started/installation/${NC}"
    exit 1
  fi

  K6_VERSION=$(k6 version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
  echo -e "${GREEN}✓ k6 version ${K6_VERSION} installed${NC}"

  # Check JWT token
  if [ -z "${JWT_TOKEN:-}" ]; then
    echo -e "${YELLOW}Warning: JWT_TOKEN not set. Please export JWT_TOKEN=<your-token>${NC}"
    read -p "Enter JWT token: " JWT_TOKEN
    export JWT_TOKEN
  fi

  # Check backend service
  echo -e "${BLUE}Checking backend service at ${BASE_URL}...${NC}"
  if ! curl -s -f -o /dev/null "${BASE_URL}/health" 2>/dev/null; then
    echo -e "${RED}Error: Backend service not reachable at ${BASE_URL}${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Backend service is healthy${NC}"

  # Create results directory
  mkdir -p "${RESULTS_DIR}"
  echo -e "${GREEN}✓ Results directory: ${RESULTS_DIR}${NC}"
}

# Run a single test with timing
run_test() {
  local test_name="$1"
  local test_file="$2"
  local duration="$3"
  local test_args="${4:-}"

  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}Running: ${test_name}${NC}"
  echo -e "${BLUE}Duration: ${duration}${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

  local result_file="${RESULTS_DIR}/${test_name}_${TIMESTAMP}.json"
  local start_time=$(date +%s)

  # Run k6 test
  if k6 run \
    --env BASE_URL="${BASE_URL}" \
    --env JWT_TOKEN="${JWT_TOKEN}" \
    --env ADMIN_JWT="${ADMIN_JWT:-$JWT_TOKEN}" \
    ${test_args} \
    --out "json=${result_file}" \
    "${test_file}"; then

    local end_time=$(date +%s)
    local elapsed=$((end_time - start_time))
    echo -e "${GREEN}✓ ${test_name} completed successfully in ${elapsed}s${NC}"
    echo "$test_name,PASS,$elapsed" >> "${RESULTS_DIR}/summary_${TIMESTAMP}.csv"
    return 0
  else
    local end_time=$(date +%s)
    local elapsed=$((end_time - start_time))
    echo -e "${RED}✗ ${test_name} failed after ${elapsed}s${NC}"
    echo "$test_name,FAIL,$elapsed" >> "${RESULTS_DIR}/summary_${TIMESTAMP}.csv"
    return 1
  fi
}

# Generate summary report
generate_summary() {
  local csv_file="${RESULTS_DIR}/summary_${TIMESTAMP}.csv"
  local summary_file="${RESULTS_DIR}/SUMMARY_${TIMESTAMP}.md"

  echo -e "${BLUE}Generating summary report...${NC}"

  cat > "${summary_file}" <<EOF
# RBAC Performance Test Suite - Summary Report

**Environment:** ${ENVIRONMENT}
**Base URL:** ${BASE_URL}
**Timestamp:** $(date +"%Y-%m-%d %H:%M:%S")
**Test Duration:** ${TOTAL_DURATION}s

---

## Test Results

| Test Name | Status | Duration (s) |
|-----------|--------|--------------|
EOF

  # Read CSV and format as markdown table
  while IFS=',' read -r test status duration; do
    if [ "$status" = "PASS" ]; then
      echo "| $test | ✅ PASS | $duration |" >> "${summary_file}"
    else
      echo "| $test | ❌ FAIL | $duration |" >> "${summary_file}"
    fi
  done < "${csv_file}"

  cat >> "${summary_file}" <<EOF

---

## Quick Statistics

\`\`\`bash
# View detailed results
cat ${RESULTS_DIR}/*_${TIMESTAMP}.json | jq '.metrics'

# View k6 summary
k6 run --summary-export=${RESULTS_DIR}/summary.json ${SCRIPT_DIR}/rbac-load-tests.js
\`\`\`

---

## Next Steps

1. Review detailed test results in: \`${RESULTS_DIR}\`
2. Analyze bottlenecks identified in test outputs
3. Compare against performance budgets in RBAC_PERFORMANCE_REPORT.md
4. Implement short-term optimizations from SCALING_RECOMMENDATIONS.md
5. Re-run tests after optimizations to validate improvements

---

**Generated by:** RBAC Performance Test Suite
**Report Location:** ${summary_file}
EOF

  echo -e "${GREEN}✓ Summary report generated: ${summary_file}${NC}"
  cat "${summary_file}"
}

################################################################################
# Main Test Execution
################################################################################

main() {
  echo -e "${BLUE}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  RBAC PERFORMANCE TEST SUITE"
  echo "  AUTH-004 GROUP 3 - Final Performance Validation"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo -e "${NC}"

  check_prerequisites

  # Initialize summary CSV
  echo "Test Name,Status,Duration" > "${RESULTS_DIR}/summary_${TIMESTAMP}.csv"

  local suite_start_time=$(date +%s)
  local failed_tests=0

  # Test 1: Baseline Test
  run_test \
    "01_baseline_test" \
    "${SCRIPT_DIR}/rbac-load-tests.js" \
    "10 minutes" \
    "--env TEST_SCENARIO=baseline" \
    || ((failed_tests++))

  # Test 2: Cache Performance Test
  run_test \
    "02_cache_performance" \
    "${SCRIPT_DIR}/cache-performance-test.js" \
    "10 minutes" \
    "" \
    || ((failed_tests++))

  # Test 3: Rate Limiting Test
  run_test \
    "03_rate_limiting" \
    "${SCRIPT_DIR}/rate-limiting-pressure-test.js" \
    "10 minutes" \
    "" \
    || ((failed_tests++))

  # Test 4: Load Test (5k RPS)
  run_test \
    "04_load_test_5k" \
    "${SCRIPT_DIR}/rbac-load-tests.js" \
    "10 minutes" \
    "--env TEST_SCENARIO=load" \
    || ((failed_tests++))

  # Test 5: Stress Test (10k RPS)
  run_test \
    "05_stress_test_10k" \
    "${SCRIPT_DIR}/rbac-load-tests.js" \
    "10 minutes" \
    "--env TEST_SCENARIO=stress" \
    || ((failed_tests++))

  # Test 6: Connection Pool Saturation Test
  run_test \
    "06_connection_pool" \
    "${SCRIPT_DIR}/connection-pool-saturation-test.js" \
    "13 minutes" \
    "" \
    || ((failed_tests++))

  # Test 7: Spike Test (20k RPS)
  run_test \
    "07_spike_test_20k" \
    "${SCRIPT_DIR}/rbac-load-tests.js" \
    "7.5 minutes" \
    "--env TEST_SCENARIO=spike" \
    || ((failed_tests++))

  # Test 8: Endurance Test (Optional - takes 30 minutes)
  if [ "${RUN_ENDURANCE_TEST:-false}" = "true" ]; then
    run_test \
      "08_endurance_test" \
      "${SCRIPT_DIR}/rbac-load-tests.js" \
      "30 minutes" \
      "--env TEST_SCENARIO=endurance" \
      || ((failed_tests++))
  else
    echo -e "${YELLOW}Skipping endurance test (set RUN_ENDURANCE_TEST=true to enable)${NC}"
  fi

  local suite_end_time=$(date +%s)
  TOTAL_DURATION=$((suite_end_time - suite_start_time))

  # Generate summary
  generate_summary

  # Final status
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  if [ $failed_tests -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
    echo -e "${GREEN}Total Duration: ${TOTAL_DURATION}s ($(($TOTAL_DURATION / 60)) minutes)${NC}"
    exit 0
  else
    echo -e "${RED}✗ ${failed_tests} TEST(S) FAILED${NC}"
    echo -e "${YELLOW}Total Duration: ${TOTAL_DURATION}s ($(($TOTAL_DURATION / 60)) minutes)${NC}"
    exit 1
  fi
}

# Run main function
main "$@"
