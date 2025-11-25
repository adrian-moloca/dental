#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# Dental OS - Docker Stack Launcher
# ============================================================================
# Production-ready launcher with health checks, status monitoring, and
# comprehensive error handling.
#
# Usage:
#   ./launch-app-docker.sh [options]
#
# Options:
#   --reset           Clean volumes and reset all data
#   --debug           Enable debug mode (start:watch instead of start:dev)
#   --skip-build      Skip building shared packages
#   --no-deps         Start services without waiting for dependencies
#   --rebuild         Force rebuild of Docker images
#   --services <csv>  Start only specific services (comma-separated)
#   --help            Show this help message
#
# Examples:
#   ./launch-app-docker.sh                    # Normal start
#   ./launch-app-docker.sh --reset            # Clean start
#   ./launch-app-docker.sh --debug            # Debug mode
#   ./launch-app-docker.sh --services auth    # Start only auth service
# ============================================================================

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly MAGENTA='\033[0;35m'
readonly NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.dev.yml}"
ENV_FILE="${ENV_FILE:-.env.docker}"
DEBUG="${DEBUG:-0}"
RESET=false
SKIP_BUILD=false
NO_DEPS=false
REBUILD=false
SERVICES=""
WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Parse command line arguments
parse_args() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      --reset)
        RESET=true
        shift
        ;;
      --debug)
        DEBUG=1
        shift
        ;;
      --skip-build)
        SKIP_BUILD=true
        shift
        ;;
      --no-deps)
        NO_DEPS=true
        shift
        ;;
      --rebuild)
        REBUILD=true
        shift
        ;;
      --services)
        SERVICES="$2"
        shift 2
        ;;
      --help)
        head -n 30 "$0" | grep "^#" | sed 's/^# *//'
        exit 0
        ;;
      *)
        echo -e "${RED}Unknown option: $1${NC}"
        echo "Use --help for usage information"
        exit 1
        ;;
    esac
  done
}

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

log_step() {
  echo -e "${MAGENTA}▶${NC} $*"
}

# Check prerequisites
check_prerequisites() {
  log_section "Checking Prerequisites"

  # Check Docker
  if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install Docker first."
    exit 1
  fi
  log_success "Docker found: $(docker --version | head -n1)"

  # Check Docker Compose
  if ! docker compose version &> /dev/null; then
    log_error "Docker Compose plugin not found. Please install it."
    exit 1
  fi
  log_success "Docker Compose found: $(docker compose version --short)"

  # Check if Docker daemon is running
  if ! docker info &> /dev/null; then
    log_error "Docker daemon is not running. Please start Docker."
    exit 1
  fi
  log_success "Docker daemon is running"

  # Check if compose file exists
  if [ ! -f "$COMPOSE_FILE" ]; then
    log_error "Compose file not found: $COMPOSE_FILE"
    exit 1
  fi
  log_success "Compose file found: $COMPOSE_FILE"

  # Check if env file exists
  if [ ! -f "$ENV_FILE" ]; then
    log_warning "Environment file not found: $ENV_FILE"
    log_info "Creating from template..."
    if [ -f "$ENV_FILE.example" ]; then
      cp "$ENV_FILE.example" "$ENV_FILE"
      log_success "Created $ENV_FILE from template"
    else
      log_error "No environment file or template found"
      exit 1
    fi
  else
    log_success "Environment file found: $ENV_FILE"
  fi
}

# Clean volumes if reset requested
reset_volumes() {
  if [ "$RESET" = true ]; then
    log_section "Resetting Volumes"
    log_warning "This will delete all data in Docker volumes!"

    # Stop all services
    log_step "Stopping all services..."
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down -v 2>/dev/null || true

    # Remove volumes
    log_step "Removing volumes..."
    docker volume rm dentalos-pgdata-auth 2>/dev/null || true
    docker volume rm dentalos-pgdata-subscription 2>/dev/null || true
    docker volume rm dentalos-mongodata 2>/dev/null || true
    docker volume rm dentalos-miniodata 2>/dev/null || true
    docker volume rm dentalos-redisdata 2>/dev/null || true
    docker volume rm dentalos-rabbitmqdata 2>/dev/null || true

    log_success "Volumes reset complete"
  fi
}

# Build shared packages
build_shared_packages() {
  if [ "$SKIP_BUILD" = true ]; then
    log_section "Skipping Package Build"
    return 0
  fi

  log_section "Building Shared Packages"

  if [ -f "$WORKSPACE_ROOT/scripts/setup-dev.sh" ]; then
    log_step "Running setup-dev.sh..."
    bash "$WORKSPACE_ROOT/scripts/setup-dev.sh" --skip-install
  else
    log_warning "setup-dev.sh not found, using fallback build"
    log_step "Building packages with pnpm..."

    # Bootstrap step: install dependencies inside Docker
    log_info "Installing dependencies (this may take a while on first run)..."
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm bootstrap

    log_success "Dependencies installed"
  fi
}

# Start infrastructure services
start_infrastructure() {
  log_section "Starting Infrastructure Services"

  local infra_services="postgres postgres-subscription redis rabbitmq mongo minio"

  log_step "Starting: $infra_services"
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d $infra_services

  log_step "Waiting for infrastructure to be healthy..."

  local max_wait=120
  local elapsed=0
  local check_interval=5

  while [ $elapsed -lt $max_wait ]; do
    local all_healthy=true

    # Check each infrastructure service
    for service in postgres postgres-subscription redis rabbitmq mongo; do
      local health_status=$(docker compose -f "$COMPOSE_FILE" ps --format json "$service" 2>/dev/null | grep -o '"Health":"[^"]*"' | cut -d'"' -f4 || echo "")

      if [ -n "$health_status" ] && [ "$health_status" != "healthy" ]; then
        all_healthy=false
        break
      fi
    done

    if [ "$all_healthy" = true ]; then
      log_success "All infrastructure services are healthy"
      return 0
    fi

    echo -n "."
    sleep $check_interval
    elapsed=$((elapsed + check_interval))
  done

  log_warning "Infrastructure health check timed out after ${max_wait}s"
  log_info "Services may still be starting. Check status with: docker compose ps"
}

# Start application services
start_services() {
  log_section "Starting Application Services"

  # Set debug mode
  if [ "$DEBUG" = "1" ]; then
    export DEBUG_MODE="start:watch"
    log_info "Debug mode enabled (using start:watch)"
  else
    export DEBUG_MODE="start:watch"
    log_info "Normal mode (using start:watch for hot-reload)"
  fi

  local compose_args=(-f "$COMPOSE_FILE" --env-file "$ENV_FILE")
  local up_args=(up)

  # Add --no-deps if requested
  if [ "$NO_DEPS" = true ]; then
    up_args+=(--no-deps)
    log_info "Starting without dependency wait"
  fi

  # Add --build if rebuild requested
  if [ "$REBUILD" = true ]; then
    up_args+=(--build)
    log_info "Forcing image rebuild"
  fi

  # Start specific services or all
  if [ -n "$SERVICES" ]; then
    IFS=',' read -ra service_array <<< "$SERVICES"
    log_info "Starting specific services: ${service_array[*]}"
    docker compose "${compose_args[@]}" "${up_args[@]}" "${service_array[@]}"
  else
    log_info "Starting all application services..."
    log_info ""
    log_info "Press Ctrl+C to stop all services"
    log_info "Services will continue running in the background with '--detach'"
    log_info ""

    # Start in foreground to show logs
    docker compose "${compose_args[@]}" "${up_args[@]}"
  fi
}

# Show service status
show_status() {
  log_section "Service Status"
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps

  echo ""
  log_info "View logs with: docker compose -f $COMPOSE_FILE logs -f [service-name]"
  log_info "Stop services with: docker compose -f $COMPOSE_FILE down"
  log_info "Restart a service with: docker compose -f $COMPOSE_FILE restart [service-name]"
}

# Cleanup function
cleanup() {
  log_warning "Shutting down services..."
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down
  log_success "Services stopped"
  exit 0
}

# Main execution
main() {
  local start_time=$(date +%s)

  parse_args "$@"

  cd "$WORKSPACE_ROOT"

  # Set up trap for Ctrl+C
  trap cleanup INT TERM

  log_section "Dental OS Docker Stack Launcher"
  log_info "Working directory: $WORKSPACE_ROOT"
  log_info "Compose file: $COMPOSE_FILE"
  log_info "Environment file: $ENV_FILE"

  # Execute steps
  check_prerequisites
  reset_volumes
  build_shared_packages
  start_infrastructure
  start_services

  local end_time=$(date +%s)
  local duration=$((end_time - start_time))

  log_section "Startup Complete"
  log_success "All services started in ${duration}s"
  show_status
}

main "$@"
