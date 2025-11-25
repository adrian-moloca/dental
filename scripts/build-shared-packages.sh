#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# Build Shared Packages Script
# ============================================================================
# This script builds all shared packages in the correct dependency order.
# It ensures that packages with dependencies are built after their dependencies.
#
# Dependency Graph:
#   shared-types (no deps)
#     └── shared-domain
#         ├── shared-validation
#         ├── shared-auth
#         └── shared-errors
#             └── shared-events
#             └── shared-infra
#             └── shared-security
#             └── shared-testing
#             └── shared-tracing
#
# Usage:
#   ./scripts/build-shared-packages.sh [--watch] [--clean]
#
# Options:
#   --watch    Build in watch mode (continuous rebuild on changes)
#   --clean    Clean dist folders before building
#   --verbose  Show detailed build output
# ============================================================================

# Colors for output
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m'

# Configuration
WATCH_MODE=false
CLEAN_MODE=false
VERBOSE=false
WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Parse arguments
parse_args() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      --watch)
        WATCH_MODE=true
        shift
        ;;
      --clean)
        CLEAN_MODE=true
        shift
        ;;
      --verbose)
        VERBOSE=true
        shift
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
  echo -e "${GREEN}[✓]${NC} $*"
}

log_warning() {
  echo -e "${YELLOW}[!]${NC} $*"
}

log_error() {
  echo -e "${RED}[✗]${NC} $*"
}

log_step() {
  echo -e "${BLUE}▶${NC} $*"
}

# Build a single package
build_package() {
  local package_name=$1
  local package_path="$WORKSPACE_ROOT/packages/$package_name"

  if [ ! -d "$package_path" ]; then
    log_warning "Package not found: $package_name (skipping)"
    return 0
  fi

  log_step "Building @dentalos/$package_name..."

  # Clean dist folder if requested
  if [ "$CLEAN_MODE" = true ]; then
    if [ -d "$package_path/dist" ]; then
      rm -rf "$package_path/dist"
      log_info "Cleaned dist folder"
    fi
  fi

  # Build the package
  if [ "$VERBOSE" = true ]; then
    pnpm --filter "@dentalos/$package_name" build
  else
    pnpm --filter "@dentalos/$package_name" build > /dev/null 2>&1
  fi

  if [ $? -eq 0 ]; then
    log_success "@dentalos/$package_name built successfully"
  else
    log_error "Failed to build @dentalos/$package_name"
    return 1
  fi
}

# Build all packages in dependency order
build_all_packages() {
  log_info "Building shared packages in dependency order..."
  echo ""

  # Define build order based on dependency graph
  local packages=(
    "shared-types"          # No dependencies
    "shared-domain"         # Depends on: shared-types
    "shared-validation"     # Depends on: shared-domain, shared-types
    "shared-auth"           # Depends on: shared-domain, shared-types
    "shared-errors"         # Depends on: shared-auth, shared-types
    "shared-events"         # Depends on: shared-errors (transitively)
    "shared-infra"          # Depends on: shared-errors (transitively)
    "shared-security"       # Depends on: shared-auth, shared-errors
    "shared-testing"        # Depends on: shared-errors (transitively)
    "shared-tracing"        # Depends on: shared-errors (transitively)
  )

  local total=${#packages[@]}
  local current=0

  for package in "${packages[@]}"; do
    current=$((current + 1))
    echo -e "${BLUE}[$current/$total]${NC} $package"

    if ! build_package "$package"; then
      log_error "Build failed at package: $package"
      return 1
    fi
    echo ""
  done

  log_success "All shared packages built successfully!"
}

# Watch mode - rebuild on changes
watch_packages() {
  log_info "Starting watch mode..."
  log_warning "This is a simple implementation. For better watch support, use individual package watch scripts."

  while true; do
    log_info "Rebuilding packages..."
    build_all_packages

    log_info "Waiting for changes (Ctrl+C to stop)..."
    sleep 10
  done
}

# Main execution
main() {
  parse_args "$@"

  cd "$WORKSPACE_ROOT"

  echo "============================================"
  echo "DentalOS - Shared Packages Builder"
  echo "============================================"
  echo "Workspace: $WORKSPACE_ROOT"
  echo "Watch mode: $WATCH_MODE"
  echo "Clean mode: $CLEAN_MODE"
  echo "Verbose: $VERBOSE"
  echo "============================================"
  echo ""

  # Check if pnpm is available
  if ! command -v pnpm &> /dev/null; then
    log_error "pnpm is not installed or not in PATH"
    log_info "Install with: npm install -g pnpm"
    exit 1
  fi

  # Build packages
  if [ "$WATCH_MODE" = true ]; then
    watch_packages
  else
    build_all_packages
  fi

  echo ""
  log_success "Build complete!"
  echo ""
  echo "Next steps:"
  echo "  - Run services with: pnpm dev:backend"
  echo "  - Or use Docker: ./launch-app-docker.sh"
  echo ""
}

main "$@"
