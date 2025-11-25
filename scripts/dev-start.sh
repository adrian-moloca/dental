#!/usr/bin/env bash

# ==============================================================================
# DentalOS Local Development Startup Script
# ==============================================================================
#
# This script starts all required services in the correct order with health
# checks, runs database migrations, seeds initial data, and starts backend
# services.
#
# USAGE:
#   ./scripts/dev-start.sh [options]
#
# OPTIONS:
#   --clean         Clean volumes and start fresh (WARNING: destroys data)
#   --skip-seed     Skip database seeding
#   --services-only Start only infrastructure services (no app services)
#   --build         Force rebuild of Docker images
#   --help          Show this help message
#
# REQUIREMENTS:
#   - Docker and Docker Compose installed
#   - .env.docker file configured
#   - Sufficient disk space for volumes
#
# ==============================================================================

set -euo pipefail  # Exit on error, undefined variables, and pipe failures

# ==============================================================================
# CONFIGURATION
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.dev.yml"
ENV_FILE="$PROJECT_ROOT/.env.docker"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Service groups
INFRASTRUCTURE_SERVICES=(
    "postgres"
    "postgres-subscription"
    "redis"
    "rabbitmq"
    "mongo"
    "minio"
)

BACKEND_SERVICES=(
    "auth"
    "subscription"
    "patient"
    "scheduling"
    "enterprise"
    "billing"
    "inventory"
    "clinical"
    "provider-schedule"
    "health-aggregator"
)

# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

show_help() {
    cat << EOF
DentalOS Local Development Startup Script

USAGE:
    ./scripts/dev-start.sh [options]

OPTIONS:
    --clean         Clean volumes and start fresh (WARNING: destroys data)
    --skip-seed     Skip database seeding
    --services-only Start only infrastructure services (no app services)
    --build         Force rebuild of Docker images
    --help          Show this help message

EXAMPLES:
    # Standard startup
    ./scripts/dev-start.sh

    # Clean start (destroys all data)
    ./scripts/dev-start.sh --clean

    # Start only infrastructure (useful for running apps locally)
    ./scripts/dev-start.sh --services-only

    # Force rebuild and start
    ./scripts/dev-start.sh --build

EOF
}

# ==============================================================================
# VALIDATION FUNCTIONS
# ==============================================================================

check_prerequisites() {
    print_header "Checking Prerequisites"

    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    log_success "Docker found: $(docker --version)"

    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    log_success "Docker Compose found: $(docker-compose --version)"

    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running. Please start Docker."
        exit 1
    fi
    log_success "Docker daemon is running"

    # Check if .env.docker exists
    if [ ! -f "$ENV_FILE" ]; then
        log_error ".env.docker file not found at $ENV_FILE"
        log_error "Please create .env.docker from .env.docker.example"
        exit 1
    fi
    log_success ".env.docker file found"

    # Check if docker-compose.dev.yml exists
    if [ ! -f "$COMPOSE_FILE" ]; then
        log_error "docker-compose.dev.yml not found at $COMPOSE_FILE"
        exit 1
    fi
    log_success "docker-compose.dev.yml found"
}

# ==============================================================================
# SERVICE HEALTH CHECK FUNCTIONS
# ==============================================================================

wait_for_postgres() {
    local service_name=$1
    local max_attempts=30
    local attempt=1

    log_info "Waiting for $service_name to be healthy..."

    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T "$service_name" pg_isready &> /dev/null; then
            log_success "$service_name is healthy"
            return 0
        fi

        echo -n "."
        sleep 2
        ((attempt++))
    done

    log_error "$service_name failed to become healthy after $max_attempts attempts"
    return 1
}

wait_for_redis() {
    local max_attempts=30
    local attempt=1

    log_info "Waiting for Redis to be healthy..."

    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T redis redis-cli -a devredis ping &> /dev/null; then
            log_success "Redis is healthy"
            return 0
        fi

        echo -n "."
        sleep 2
        ((attempt++))
    done

    log_error "Redis failed to become healthy after $max_attempts attempts"
    return 1
}

wait_for_rabbitmq() {
    local max_attempts=60
    local attempt=1

    log_info "Waiting for RabbitMQ to be healthy..."

    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T rabbitmq rabbitmq-diagnostics -q ping &> /dev/null; then
            log_success "RabbitMQ is healthy"
            return 0
        fi

        echo -n "."
        sleep 2
        ((attempt++))
    done

    log_error "RabbitMQ failed to become healthy after $max_attempts attempts"
    return 1
}

wait_for_mongo() {
    local max_attempts=30
    local attempt=1

    log_info "Waiting for MongoDB to be healthy..."

    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T mongo mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
            log_success "MongoDB is healthy"
            return 0
        fi

        echo -n "."
        sleep 2
        ((attempt++))
    done

    log_error "MongoDB failed to become healthy after $max_attempts attempts"
    return 1
}

# ==============================================================================
# DATABASE MIGRATION FUNCTIONS
# ==============================================================================

run_auth_migrations() {
    print_header "Running Auth Service Migrations"

    log_info "Running TypeORM migrations for auth service..."

    # Run migrations inside the auth container
    if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T auth \
        pnpm --filter @dentalos/backend-auth typeorm migration:run; then
        log_success "Auth service migrations completed"
    else
        log_error "Auth service migrations failed"
        return 1
    fi
}

run_subscription_migrations() {
    print_header "Running Subscription Service Migrations"

    log_info "Running TypeORM migrations for subscription service..."

    # Run migrations inside the subscription container
    if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T subscription \
        pnpm --filter @dentalos/backend-subscription-service typeorm migration:run; then
        log_success "Subscription service migrations completed"
    else
        log_error "Subscription service migrations failed"
        return 1
    fi
}

# ==============================================================================
# DATABASE SEEDING FUNCTIONS
# ==============================================================================

seed_subscription_modules() {
    print_header "Seeding Subscription Modules"

    log_info "Seeding module catalog data..."

    # Run seeder script
    if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T subscription \
        pnpm --filter @dentalos/backend-subscription-service seed:modules; then
        log_success "Module catalog seeded successfully"
    else
        log_warning "Module seeding failed or skipped (may already exist)"
    fi
}

# ==============================================================================
# MAIN FUNCTIONS
# ==============================================================================

clean_volumes() {
    print_header "Cleaning Volumes"

    log_warning "This will DELETE ALL DATA in Docker volumes!"
    read -p "Are you sure? (yes/no): " -r
    echo

    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "Cancelled volume cleanup"
        return 0
    fi

    log_info "Stopping all services..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down -v

    log_success "Volumes cleaned"
}

start_infrastructure() {
    print_header "Starting Infrastructure Services"

    local build_flag=""
    if [ "$BUILD" = true ]; then
        build_flag="--build"
    fi

    log_info "Starting infrastructure services..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d $build_flag "${INFRASTRUCTURE_SERVICES[@]}"

    # Wait for services to be healthy
    wait_for_postgres "postgres"
    wait_for_postgres "postgres-subscription"
    wait_for_redis
    wait_for_rabbitmq
    wait_for_mongo

    log_success "All infrastructure services are healthy"
}

start_backend_services() {
    print_header "Starting Backend Services"

    local build_flag=""
    if [ "$BUILD" = true ]; then
        build_flag="--build"
    fi

    log_info "Starting backend services..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d $build_flag "${BACKEND_SERVICES[@]}"

    log_success "Backend services started"
}

show_service_status() {
    print_header "Service Status"

    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps

    echo ""
    log_info "Access points:"
    echo "  - Auth Service:         http://localhost:3301"
    echo "  - Subscription Service: http://localhost:3311"
    echo "  - Swagger (Subscription): http://localhost:3311/api/docs"
    echo "  - Health Aggregator:    http://localhost:3399"
    echo "  - RabbitMQ Management:  http://localhost:15672 (user: dev, pass: dev)"
    echo "  - PostgreSQL Auth:      localhost:5433 (user: dev, pass: dev)"
    echo "  - PostgreSQL Subscription: localhost:5434 (user: dental_user, pass: dental_password)"
    echo "  - Redis:                localhost:6381 (pass: devredis)"
    echo "  - MongoDB:              localhost:27017"
    echo ""
}

# ==============================================================================
# MAIN SCRIPT
# ==============================================================================

main() {
    cd "$PROJECT_ROOT"

    # Parse command line arguments
    CLEAN=false
    SKIP_SEED=false
    SERVICES_ONLY=false
    BUILD=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --clean)
                CLEAN=true
                shift
                ;;
            --skip-seed)
                SKIP_SEED=true
                shift
                ;;
            --services-only)
                SERVICES_ONLY=true
                shift
                ;;
            --build)
                BUILD=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done

    print_header "DentalOS Development Environment"

    # Check prerequisites
    check_prerequisites

    # Clean volumes if requested
    if [ "$CLEAN" = true ]; then
        clean_volumes
    fi

    # Start infrastructure services
    start_infrastructure

    # Run migrations
    if [ "$SERVICES_ONLY" = false ]; then
        # Start backend services first
        start_backend_services

        # Wait a bit for services to initialize
        log_info "Waiting for backend services to initialize..."
        sleep 10

        # Run migrations
        run_auth_migrations || log_warning "Auth migrations failed"
        run_subscription_migrations || log_warning "Subscription migrations failed"

        # Seed data if not skipped
        if [ "$SKIP_SEED" = false ]; then
            seed_subscription_modules || log_warning "Seeding failed"
        fi
    fi

    # Show final status
    show_service_status

    log_success "DentalOS development environment is ready!"
    log_info "Use 'docker-compose -f docker-compose.dev.yml logs -f [service]' to view logs"
    log_info "Use 'docker-compose -f docker-compose.dev.yml down' to stop all services"
}

# Run main function
main "$@"
