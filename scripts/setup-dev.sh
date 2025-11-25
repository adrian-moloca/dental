#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# Dental OS - Development Environment Setup Script
# ============================================================================
# This script builds all shared packages in the correct dependency order
# to ensure clean builds without "Cannot find module" errors.
#
# Usage:
#   ./scripts/setup-dev.sh [options]
#
# Options:
#   --clean          Clean all package dist directories before building
#   --skip-install   Skip pnpm install step
#   --verbose        Show detailed build output
#   --help           Show this help message
# ============================================================================

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m' # No Color

# Configuration
CLEAN_BUILD=false
SKIP_INSTALL=false
VERBOSE=false
WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Parse command line arguments
parse_args() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      --clean)
        CLEAN_BUILD=true
        shift
        ;;
      --skip-install)
        SKIP_INSTALL=true
        shift
        ;;
      --verbose)
        VERBOSE=true
        shift
        ;;
      --help)
        head -n 20 "$0" | grep "^#" | sed 's/^# *//'
        exit 0
        ;;
      *)
        echo -e "${RED}Unknown option: $1${NC}"
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

# Build a single package
build_package() {
  local package_name=$1
  local package_path="$WORKSPACE_ROOT/packages/$package_name"

  if [ ! -d "$package_path" ]; then
    log_warning "Package directory not found: $package_path (skipping)"
    return 0
  fi

  # Check if package has a build script
  if ! grep -q '"build"' "$package_path/package.json" 2>/dev/null; then
    log_info "No build script for $package_name (skipping)"
    return 0
  fi

  # Clean if requested
  if [ "$CLEAN_BUILD" = true ] && [ -d "$package_path/dist" ]; then
    log_info "Cleaning $package_name..."
    rm -rf "$package_path/dist"
  fi

  # Build the package
  log_info "Building $package_name..."

  if [ "$VERBOSE" = true ]; then
    pnpm --filter "@dentalos/$package_name" run build
  else
    if ! pnpm --filter "@dentalos/$package_name" run build > /dev/null 2>&1; then
      log_error "Failed to build $package_name"
      return 1
    fi
  fi

  log_success "Built $package_name"
}

# Main setup function
setup_dev() {
  local start_time=$(date +%s)

  log_section "Dental OS Development Setup"

  # Step 1: Install dependencies
  if [ "$SKIP_INSTALL" = false ]; then
    log_section "Step 1: Installing Dependencies"
    log_info "Running pnpm install..."

    if [ "$VERBOSE" = true ]; then
      pnpm install
    else
      pnpm install --reporter=silent
    fi

    log_success "Dependencies installed"
  else
    log_section "Step 1: Skipping Dependency Installation"
  fi

  # Step 2: Build packages in dependency order
  log_section "Step 2: Building Shared Packages"

  # Define the build order based on package dependencies
  # Packages with no dependencies come first, then packages that depend on them
  declare -a BUILD_ORDER=(
    # Layer 1: No dependencies
    "shared-types"

    # Layer 2: Depends only on shared-types
    "shared-domain"

    # Layer 3: Depends on shared-types and/or shared-domain
    "shared-auth"
    "shared-errors"

    # Layer 4: Depends on previous layers
    "shared-validation"
    "shared-events"

    # Layer 5: Infrastructure and cross-cutting concerns
    "shared-security"
    "shared-infra"
    "shared-tracing"

    # Layer 6: Testing utilities (depends on most packages)
    "shared-testing"

    # Layer 7: UI Kit (if needed by backend for server-side rendering)
    "ui-kit"
  )

  local total_packages=${#BUILD_ORDER[@]}
  local current=0
  local failed_packages=()

  log_info "Building $total_packages packages in dependency order..."
  echo ""

  for package in "${BUILD_ORDER[@]}"; do
    current=$((current + 1))
    echo -e "${CYAN}[$current/$total_packages]${NC} Processing $package..."

    if ! build_package "$package"; then
      failed_packages+=("$package")
    fi
  done

  # Step 3: Report results
  log_section "Build Summary"

  local end_time=$(date +%s)
  local duration=$((end_time - start_time))

  if [ ${#failed_packages[@]} -eq 0 ]; then
    log_success "All packages built successfully!"
    log_info "Total time: ${duration}s"
    log_info ""
    log_info "Next steps:"
    log_info "  - Start services with: ./launch-app-docker.sh"
    log_info "  - Or run locally with: pnpm dev:backend"
    return 0
  else
    log_error "Failed to build ${#failed_packages[@]} package(s):"
    for package in "${failed_packages[@]}"; do
      echo -e "  ${RED}✗${NC} $package"
    done
    log_info ""
    log_info "Try running with --verbose flag to see detailed error messages:"
    log_info "  ./scripts/setup-dev.sh --verbose"
    return 1
  fi
}

# Cleanup function for interrupted builds
cleanup() {
  log_warning "Build interrupted"
  exit 130
}

# Trap Ctrl+C
trap cleanup INT

# Main execution
main() {
  parse_args "$@"

  cd "$WORKSPACE_ROOT"

  if ! setup_dev; then
    exit 1
  fi
}

main "$@"
