#!/bin/bash

###############################################################################
# Health Aggregator Setup Script
#
# Automated setup and verification for the DentalOS Health Aggregator service.
# This script will:
# 1. Check prerequisites
# 2. Install dependencies
# 3. Configure environment
# 4. Start the service
# 5. Verify health endpoints
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
SERVICE_DIR="$PROJECT_ROOT/apps/backend-health-aggregator"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}DentalOS Health Aggregator Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi
NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    print_warning "pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi
PNPM_VERSION=$(pnpm --version)
print_status "pnpm version: $PNPM_VERSION"

# Check if we're in the right directory
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    print_error "Could not find project root. Please run this script from the correct location."
    exit 1
fi
print_status "Project root: $PROJECT_ROOT"

echo ""

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
cd "$PROJECT_ROOT"

if [ ! -d "node_modules" ]; then
    print_info "Running pnpm install (this may take a few minutes)..."
    pnpm install
    print_status "Dependencies installed"
else
    print_status "Dependencies already installed"
fi

echo ""

# Build shared packages
echo -e "${BLUE}Building shared packages...${NC}"
print_info "Building @dentalos/shared-infra..."
pnpm --filter @dentalos/shared-infra build
print_status "Shared packages built"

echo ""

# Configure environment
echo -e "${BLUE}Configuring environment...${NC}"

ENV_FILE="$SERVICE_DIR/.env.local"
if [ ! -f "$ENV_FILE" ]; then
    print_info "Creating .env.local from .env.example..."
    cp "$SERVICE_DIR/.env.example" "$ENV_FILE"
    print_status "Environment file created: $ENV_FILE"
    print_warning "Please edit $ENV_FILE to configure webhook URLs"
else
    print_status "Environment file already exists: $ENV_FILE"
fi

echo ""

# Verify service health endpoints
echo -e "${BLUE}Verifying service health endpoints...${NC}"

check_service() {
    local name=$1
    local port=$2

    if curl -s "http://localhost:$port/health/detailed" > /dev/null 2>&1; then
        print_status "$name (port $port) - Healthy"
        return 0
    else
        print_warning "$name (port $port) - Not responding (service may not be running)"
        return 1
    fi
}

# Check common services
print_info "Checking for running services..."
check_service "Auth" 3301 || true
check_service "Subscription" 3311 || true
check_service "Patient" 3304 || true
check_service "Clinical" 3305 || true

echo ""

# Ask if user wants to start the service
echo -e "${BLUE}Starting Health Aggregator...${NC}"
read -p "Do you want to start the health aggregator now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd "$SERVICE_DIR"

    # Choose start mode
    echo ""
    echo "Select start mode:"
    echo "1) Development (with auto-reload)"
    echo "2) Development (standard)"
    echo "3) Production (requires build first)"
    read -p "Enter choice [1-3]: " mode

    case $mode in
        1)
            print_info "Starting in development mode with auto-reload..."
            pnpm start:watch &
            SERVICE_PID=$!
            ;;
        2)
            print_info "Starting in development mode..."
            pnpm start:dev &
            SERVICE_PID=$!
            ;;
        3)
            print_info "Building for production..."
            pnpm build
            print_info "Starting in production mode..."
            pnpm start:prod &
            SERVICE_PID=$!
            ;;
        *)
            print_error "Invalid choice. Exiting."
            exit 1
            ;;
    esac

    # Wait for service to start
    print_info "Waiting for service to start..."
    sleep 5

    # Verify service is running
    if curl -s http://localhost:3399/api/v1/health/liveness > /dev/null 2>&1; then
        print_status "Health Aggregator is running!"
        echo ""
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}Setup Complete!${NC}"
        echo -e "${GREEN}========================================${NC}"
        echo ""
        echo "Service URLs:"
        echo "  - API:         http://localhost:3399/api/v1"
        echo "  - Swagger:     http://localhost:3399/api/docs"
        echo "  - Health:      http://localhost:3399/api/v1/health/liveness"
        echo "  - All Services: http://localhost:3399/api/v1/health/all"
        echo ""
        echo "Process ID: $SERVICE_PID"
        echo ""
        echo "To stop the service:"
        echo "  kill $SERVICE_PID"
        echo ""
        echo "Next steps:"
        echo "  1. Configure webhook URL in $ENV_FILE"
        echo "  2. Start other microservices if not already running"
        echo "  3. Open http://localhost:3399/api/docs to explore API"
        echo "  4. Integrate dashboard component in web portal"
        echo ""
    else
        print_error "Service failed to start. Check logs for errors."
        exit 1
    fi
else
    echo ""
    echo -e "${GREEN}Setup complete!${NC}"
    echo ""
    echo "To start the service manually:"
    echo "  cd $SERVICE_DIR"
    echo "  pnpm start:dev    # Development mode"
    echo "  pnpm start:watch  # Development with auto-reload"
    echo "  pnpm build && pnpm start:prod  # Production mode"
    echo ""
    echo "To start with Docker:"
    echo "  cd $PROJECT_ROOT"
    echo "  docker-compose -f docker-compose.dev.yml up health-aggregator"
    echo ""
fi

echo "For detailed documentation, see:"
echo "  - README: $SERVICE_DIR/README.md"
echo "  - Implementation Guide: $SERVICE_DIR/IMPLEMENTATION_GUIDE.md"
echo ""
