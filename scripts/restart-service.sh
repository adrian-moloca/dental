#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# Dental OS - Service Restart Utility
# ============================================================================
# Restart individual services without affecting the entire stack.
#
# Usage:
#   ./scripts/restart-service.sh <service-name> [options]
#
# Options:
#   --rebuild         Rebuild the service before restarting
#   --logs            Show logs after restart
#   --build-deps      Rebuild dependent shared packages
#   --help            Show this help message
#
# Examples:
#   ./scripts/restart-service.sh auth
#   ./scripts/restart-service.sh patient --rebuild --logs
#   ./scripts/restart-service.sh scheduling --build-deps
# ============================================================================

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m'

# Configuration
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.dev.yml}"
ENV_FILE="${ENV_FILE:-.env.docker}"
SERVICE=""
REBUILD=false
SHOW_LOGS=false
BUILD_DEPS=false
WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Service to package mapping
declare -A SERVICE_PACKAGES=(
  ["auth"]="shared-types shared-domain shared-auth shared-errors shared-validation shared-infra"
  ["patient"]="shared-types shared-domain shared-validation"
  ["scheduling"]="shared-types shared-domain shared-validation shared-events"
  ["enterprise"]="shared-types shared-domain shared-validation"
  ["billing"]="shared-types shared-domain shared-validation shared-events"
  ["inventory"]="shared-types shared-domain shared-validation shared-infra"
  ["clinical"]="shared-types shared-domain shared-validation"
  ["subscription"]="shared-types shared-domain shared-auth shared-errors shared-validation shared-infra"
  ["provider-schedule"]="shared-types shared-domain shared-validation"
  ["health-aggregator"]="shared-types shared-infra"
)

# Logging functions
log_info() {
  echo -e "${BLUE}[INFO]${NC} $*"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $*"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $*"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $*"
}

log_section() {
  echo ""
  echo -e "${CYAN}========================================${NC}"
  echo -e "${CYAN}$*${NC}"
  echo -e "${CYAN}========================================${NC}"
}

# Show usage
show_usage() {
  head -n 20 "$0" | grep "^#" | sed 's/^# *//'
  echo ""
  echo "Available services:"
  echo "  auth, patient, scheduling, enterprise, billing,"
  echo "  inventory, clinical, subscription, provider-schedule,"
  echo "  health-aggregator, web"
  exit 0
}

# Parse arguments
parse_args() {
  if [[ $# -eq 0 ]]; then
    show_usage
  fi

  SERVICE="$1"
  shift

  while [[ $# -gt 0 ]]; do
    case $1 in
      --rebuild)
        REBUILD=true
        shift
        ;;
      --logs)
        SHOW_LOGS=true
        shift
        ;;
      --build-deps)
        BUILD_DEPS=true
        shift
        ;;
      --help)
        show_usage
        ;;
      *)
        log_error "Unknown option: $1"
        exit 1
        ;;
    esac
  done
}

# Build dependent packages
build_dependencies() {
  if [ "$BUILD_DEPS" = false ]; then
    return 0
  fi

  log_section "Building Dependent Packages"

  if [ -z "${SERVICE_PACKAGES[$SERVICE]:-}" ]; then
    log_warning "No package dependencies defined for service: $SERVICE"
    return 0
  fi

  local packages="${SERVICE_PACKAGES[$SERVICE]}"
  log_info "Building packages: $packages"

  for package in $packages; do
    log_info "Building @dentalos/$package..."
    if ! pnpm --filter "@dentalos/$package" run build > /dev/null 2>&1; then
      log_error "Failed to build $package"
      return 1
    fi
  done

  log_success "Dependencies built successfully"
}

# Restart service
restart_service() {
  log_section "Restarting Service: $SERVICE"

  # Check if service exists
  if ! docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps --services | grep -q "^${SERVICE}$"; then
    log_error "Service not found: $SERVICE"
    log_info "Use --help to see available services"
    exit 1
  fi

  # Check if service is running
  local status=$(docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps --format json "$SERVICE" 2>/dev/null || echo "")

  if [ -z "$status" ]; then
    log_warning "Service is not running: $SERVICE"
    log_info "Starting service..."

    if [ "$REBUILD" = true ]; then
      docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build "$SERVICE"
    else
      docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d "$SERVICE"
    fi
  else
    log_info "Service is running, restarting..."

    if [ "$REBUILD" = true ]; then
      log_info "Rebuilding service..."
      docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build "$SERVICE"
    else
      docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" restart "$SERVICE"
    fi
  fi

  log_success "Service restarted: $SERVICE"
}

# Show logs
show_service_logs() {
  if [ "$SHOW_LOGS" = true ]; then
    log_section "Service Logs"
    log_info "Press Ctrl+C to exit logs"
    echo ""
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f "$SERVICE"
  fi
}

# Main execution
main() {
  parse_args "$@"
  cd "$WORKSPACE_ROOT"

  log_info "Service: $SERVICE"
  log_info "Rebuild: $REBUILD"
  log_info "Build dependencies: $BUILD_DEPS"

  # Build dependencies if requested
  if ! build_dependencies; then
    log_error "Failed to build dependencies"
    exit 1
  fi

  # Restart service
  if ! restart_service; then
    log_error "Failed to restart service"
    exit 1
  fi

  # Show logs if requested
  show_service_logs
}

main "$@"
