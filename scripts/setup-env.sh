#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# DentalOS Environment Setup Script
# ============================================================================
# This script initializes the environment configuration for DentalOS
# - Copies .env.example to .env if it doesn't exist
# - Generates secure random secrets for JWT, encryption keys, etc.
# - Validates required environment variables
# - Creates database credentials
#
# Usage:
#   ./scripts/setup-env.sh [options]
#
# Options:
#   --force          Overwrite existing .env file
#   --skip-secrets   Skip secret generation (use example values)
#   --validate-only  Only validate existing .env without modifications
#   --help           Show this help message
# ============================================================================

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly MAGENTA='\033[0;35m'
readonly NC='\033[0m'

# Configuration
FORCE_OVERWRITE=false
SKIP_SECRETS=false
VALIDATE_ONLY=false
WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$WORKSPACE_ROOT/.env"
ENV_EXAMPLE_FILE="$WORKSPACE_ROOT/.env.example"

# Required secrets that must be generated or provided
declare -a REQUIRED_SECRETS=(
  "JWT_ACCESS_SECRET"
  "JWT_REFRESH_SECRET"
  "DEVICE_TOKEN_SECRET"
  "ENCRYPTION_KEY"
  "SESSION_SECRET"
  "REDIS_PASSWORD"
  "POSTGRES_PASSWORD"
  "POSTGRES_SUBSCRIPTION_PASSWORD"
  "RABBITMQ_PASS"
  "MINIO_SECRET_KEY"
)

# Required variables that must have non-default values in production
declare -a REQUIRED_VARS=(
  "NODE_ENV"
  "POSTGRES_USER"
  "POSTGRES_DB"
)

# Parse command line arguments
parse_args() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      --force)
        FORCE_OVERWRITE=true
        shift
        ;;
      --skip-secrets)
        SKIP_SECRETS=true
        shift
        ;;
      --validate-only)
        VALIDATE_ONLY=true
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

# Generate a secure random string
generate_secret() {
  local length=${1:-64}

  # Try multiple methods in order of preference
  if command -v openssl &> /dev/null; then
    openssl rand -base64 "$length" | tr -d "=+/" | cut -c1-"$length"
  elif command -v head &> /dev/null && [ -f /dev/urandom ]; then
    LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c "$length"
  else
    # Fallback to a less secure method
    log_warning "Using fallback random generation method"
    date +%s | sha256sum | base64 | head -c "$length"
  fi
}

# Check if .env.example exists
check_env_example() {
  if [ ! -f "$ENV_EXAMPLE_FILE" ]; then
    log_error ".env.example file not found at: $ENV_EXAMPLE_FILE"
    log_error "Please ensure you're running this script from the project root"
    exit 1
  fi
  log_success "Found .env.example file"
}

# Copy .env.example to .env
copy_env_file() {
  if [ -f "$ENV_FILE" ] && [ "$FORCE_OVERWRITE" = false ]; then
    log_info ".env file already exists"
    log_warning "Use --force to overwrite existing .env file"
    return 0
  fi

  if [ -f "$ENV_FILE" ] && [ "$FORCE_OVERWRITE" = true ]; then
    log_warning "Backing up existing .env to .env.backup"
    cp "$ENV_FILE" "$ENV_FILE.backup"
  fi

  log_info "Copying .env.example to .env..."
  cp "$ENV_EXAMPLE_FILE" "$ENV_FILE"
  log_success "Created .env file"
}

# Replace a placeholder in .env file
replace_env_value() {
  local key=$1
  local value=$2

  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS sed syntax
    sed -i '' "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    # Linux sed syntax
    sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  fi
}

# Generate and replace secrets
generate_secrets() {
  if [ "$SKIP_SECRETS" = true ]; then
    log_warning "Skipping secret generation (--skip-secrets flag)"
    return 0
  fi

  log_section "Generating Secure Secrets"

  local secrets_generated=0

  for secret in "${REQUIRED_SECRETS[@]}"; do
    # Check if secret needs to be generated (contains CHANGE_ME or is empty)
    local current_value
    current_value=$(grep "^${secret}=" "$ENV_FILE" | cut -d'=' -f2-)

    if [[ "$current_value" =~ ^CHANGE_ME ]] || [ -z "$current_value" ]; then
      local new_secret
      new_secret=$(generate_secret 64)
      replace_env_value "$secret" "$new_secret"
      log_success "Generated $secret"
      secrets_generated=$((secrets_generated + 1))
    else
      log_info "$secret already set (skipping)"
    fi
  done

  if [ $secrets_generated -gt 0 ]; then
    log_success "Generated $secrets_generated secrets"
  else
    log_info "All secrets already configured"
  fi
}

# Update RabbitMQ URI with generated password
update_rabbitmq_uri() {
  local rabbitmq_pass
  rabbitmq_pass=$(grep "^RABBITMQ_PASS=" "$ENV_FILE" | cut -d'=' -f2)
  local rabbitmq_user
  rabbitmq_user=$(grep "^RABBITMQ_USER=" "$ENV_FILE" | cut -d'=' -f2)

  if [ -n "$rabbitmq_pass" ] && [ -n "$rabbitmq_user" ]; then
    local new_uri="amqp://${rabbitmq_user}:${rabbitmq_pass}@rabbitmq:5672/"
    replace_env_value "RABBITMQ_URI" "$new_uri"
    log_success "Updated RABBITMQ_URI with credentials"
  fi
}

# Validate environment file
validate_env() {
  log_section "Validating Environment Configuration"

  if [ ! -f "$ENV_FILE" ]; then
    log_error ".env file not found at: $ENV_FILE"
    return 1
  fi

  local validation_errors=0
  local validation_warnings=0

  # Check required variables
  for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${var}=" "$ENV_FILE"; then
      log_error "Missing required variable: $var"
      validation_errors=$((validation_errors + 1))
    fi
  done

  # Check for CHANGE_ME placeholders in production
  local node_env
  node_env=$(grep "^NODE_ENV=" "$ENV_FILE" | cut -d'=' -f2 | tr -d '[:space:]')

  if [ "$node_env" = "production" ]; then
    log_info "Checking for placeholder values in production mode..."

    while IFS= read -r line; do
      if [[ "$line" =~ CHANGE_ME ]]; then
        local key
        key=$(echo "$line" | cut -d'=' -f1)
        log_error "Production mode: $key still has CHANGE_ME placeholder"
        validation_errors=$((validation_errors + 1))
      fi
    done < "$ENV_FILE"
  else
    # In development, just warn about CHANGE_ME values
    local change_me_count
    change_me_count=$(grep -c "CHANGE_ME" "$ENV_FILE" || true)

    if [ "$change_me_count" -gt 0 ]; then
      log_warning "Found $change_me_count CHANGE_ME placeholders"
      log_warning "Run without --skip-secrets to generate secure values"
      validation_warnings=$((validation_warnings + 1))
    fi
  fi

  # Check secret lengths (minimum 32 characters)
  for secret in "${REQUIRED_SECRETS[@]}"; do
    local value
    value=$(grep "^${secret}=" "$ENV_FILE" | cut -d'=' -f2-)

    if [ -n "$value" ] && [ "${#value}" -lt 32 ]; then
      log_warning "$secret is shorter than 32 characters (${#value} chars)"
      validation_warnings=$((validation_warnings + 1))
    fi
  done

  # Validate ports are numeric
  local port_vars
  port_vars=$(grep "_PORT=" "$ENV_FILE" | grep -v "^#")

  while IFS= read -r line; do
    local key
    key=$(echo "$line" | cut -d'=' -f1)
    local value
    value=$(echo "$line" | cut -d'=' -f2)

    if [ -n "$value" ] && ! [[ "$value" =~ ^[0-9]+$ ]]; then
      log_error "Invalid port value for $key: $value (must be numeric)"
      validation_errors=$((validation_errors + 1))
    fi
  done <<< "$port_vars"

  # Validate MongoDB URIs
  local mongo_uris
  mongo_uris=$(grep "^MONGO_URI" "$ENV_FILE")

  while IFS= read -r line; do
    local key
    key=$(echo "$line" | cut -d'=' -f1)
    local value
    value=$(echo "$line" | cut -d'=' -f2-)

    if [ -n "$value" ] && ! [[ "$value" =~ ^mongodb:// ]]; then
      log_error "Invalid MongoDB URI for $key: must start with mongodb://"
      validation_errors=$((validation_errors + 1))
    fi
  done <<< "$mongo_uris"

  # Report validation results
  echo ""
  if [ $validation_errors -eq 0 ] && [ $validation_warnings -eq 0 ]; then
    log_success "Environment validation passed with no issues"
    return 0
  elif [ $validation_errors -eq 0 ]; then
    log_warning "Environment validation passed with $validation_warnings warning(s)"
    return 0
  else
    log_error "Environment validation failed with $validation_errors error(s) and $validation_warnings warning(s)"
    return 1
  fi
}

# Display environment summary
display_summary() {
  log_section "Environment Configuration Summary"

  local node_env
  node_env=$(grep "^NODE_ENV=" "$ENV_FILE" | cut -d'=' -f2 | tr -d '[:space:]')

  echo -e "${CYAN}Environment:${NC} $node_env"
  echo ""

  echo -e "${CYAN}Database Services:${NC}"
  echo -e "  PostgreSQL (Auth):         localhost:$(grep "^HOST_POSTGRES_PORT=" "$ENV_FILE" | cut -d'=' -f2)"
  echo -e "  PostgreSQL (Subscription): localhost:$(grep "^HOST_POSTGRES_SUBSCRIPTION_PORT=" "$ENV_FILE" | cut -d'=' -f2)"
  echo -e "  MongoDB:                   localhost:27017"
  echo -e "  Redis:                     localhost:$(grep "^HOST_REDIS_PORT=" "$ENV_FILE" | cut -d'=' -f2)"
  echo ""

  echo -e "${CYAN}Application Services (Host Ports):${NC}"
  echo -e "  Auth Service:              localhost:$(grep "^HOST_AUTH_PORT=" "$ENV_FILE" | cut -d'=' -f2)"
  echo -e "  Subscription Service:      localhost:$(grep "^HOST_SUBSCRIPTION_PORT=" "$ENV_FILE" | cut -d'=' -f2)"
  echo -e "  Patient Service:           localhost:$(grep "^HOST_PATIENT_PORT=" "$ENV_FILE" | cut -d'=' -f2)"
  echo -e "  Scheduling Service:        localhost:$(grep "^HOST_SCHEDULING_PORT=" "$ENV_FILE" | cut -d'=' -f2)"
  echo -e "  Enterprise Service:        localhost:$(grep "^HOST_ENTERPRISE_PORT=" "$ENV_FILE" | cut -d'=' -f2)"
  echo -e "  Billing Service:           localhost:$(grep "^HOST_BILLING_PORT=" "$ENV_FILE" | cut -d'=' -f2)"
  echo -e "  Inventory Service:         localhost:$(grep "^HOST_INVENTORY_PORT=" "$ENV_FILE" | cut -d'=' -f2)"
  echo -e "  Clinical Service:          localhost:$(grep "^HOST_CLINICAL_PORT=" "$ENV_FILE" | cut -d'=' -f2)"
  echo -e "  Provider Schedule:         localhost:$(grep "^HOST_PROVIDER_PORT=" "$ENV_FILE" | cut -d'=' -f2)"
  echo -e "  Health Aggregator:         localhost:$(grep "^HOST_HEALTH_AGGREGATOR_PORT=" "$ENV_FILE" | cut -d'=' -f2)"
  echo -e "  Web Portal:                localhost:$(grep "^HOST_WEB_PORT=" "$ENV_FILE" | cut -d'=' -f2)"
  echo ""

  echo -e "${CYAN}Management Interfaces:${NC}"
  echo -e "  RabbitMQ Management:       localhost:15672"
  echo -e "  MinIO Console:             localhost:9001"
  echo ""

  if [ "$node_env" = "production" ]; then
    echo -e "${YELLOW}Production Environment Checklist:${NC}"
    echo -e "  ${YELLOW}[ ]${NC} Update all CHANGE_ME placeholders"
    echo -e "  ${YELLOW}[ ]${NC} Configure external databases"
    echo -e "  ${YELLOW}[ ]${NC} Set up SSL/TLS certificates"
    echo -e "  ${YELLOW}[ ]${NC} Configure backup strategies"
    echo -e "  ${YELLOW}[ ]${NC} Set up monitoring and alerting"
    echo -e "  ${YELLOW}[ ]${NC} Review and restrict CORS origins"
    echo -e "  ${YELLOW}[ ]${NC} Configure Stripe with production keys"
    echo -e "  ${YELLOW}[ ]${NC} Set up Sentry for error tracking"
    echo ""
  fi
}

# Main setup function
setup_environment() {
  local start_time
  start_time=$(date +%s)

  log_section "DentalOS Environment Setup"

  # Step 1: Check for .env.example
  check_env_example

  if [ "$VALIDATE_ONLY" = true ]; then
    validate_env
    exit $?
  fi

  # Step 2: Copy .env.example to .env
  copy_env_file

  # Step 3: Generate secrets
  generate_secrets

  # Step 4: Update dependent values
  update_rabbitmq_uri

  # Step 5: Validate configuration
  if ! validate_env; then
    log_warning "Environment setup completed with validation errors"
    log_info "Please review and fix the errors above"
    return 1
  fi

  # Step 6: Display summary
  display_summary

  local end_time
  end_time=$(date +%s)
  local duration=$((end_time - start_time))

  log_section "Setup Complete"
  log_success "Environment configured successfully in ${duration}s"
  log_info ""
  log_info "Next steps:"
  log_info "  1. Review .env file and update any service-specific settings"
  log_info "  2. Start services with: ./scripts/start-all.sh"
  log_info "  3. Access Health Dashboard: http://localhost:3399"
  log_info ""
  log_info "Configuration file: $ENV_FILE"

  return 0
}

# Cleanup function for interrupted setup
cleanup() {
  log_warning "Setup interrupted"
  exit 130
}

# Trap Ctrl+C
trap cleanup INT

# Main execution
main() {
  parse_args "$@"

  cd "$WORKSPACE_ROOT"

  if ! setup_environment; then
    exit 1
  fi
}

main "$@"
