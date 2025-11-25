#!/usr/bin/env bash

# Define variables for environments
LOCAL="local"
DEV="dev"
DOCKER="docker"
DEBUG_STRING=""

print_help() {
  echo "Usage: ./launch_docker.sh NODE_ENV [OPTIONS] | down | --install"
  echo "  NODE_ENV: specify the environment (${LOCAL}, ${DEV}, or ${DOCKER})"
  echo ""
  echo "Options:"
  echo "  --reset-db    Resets the databases and volumes"
  echo "  --seed        Seeds test data after services start (implies --wait)"
  echo "  --wait        Waits for services to be healthy before returning"
  echo "  --debug-mode  Enables debug mode with debugging profile"
  echo "  --clean       Clears ALL frontend caches (dist, .vite, browser cache)"
  echo "  down          Stops the containers"
  echo "  --install     Cleans pnpm cache, removes node_modules, dist folders, and reinstalls"
  echo ""
  echo "NODE_ENV values ${LOCAL}, ${DEV}, or ${DOCKER} has different consequences:"
  echo "  - ${LOCAL}: meant for local development with minimal services."
  echo "  - ${DEV}: meant for full local development with all backend services in containers."
  echo "    creates containers for each backend service with hot-reload."
  echo "  - ${DOCKER}: meant for production-like testing."
  echo "    similar to production build but locally"
  echo ""
  echo "Examples:"
  echo "  ./launch_docker.sh ${DEV}                # NODE_ENV=${DEV}"
  echo "  ./launch_docker.sh ${DEV} --reset-db     # NODE_ENV=${DEV} and resets database"
  echo "  ./launch_docker.sh ${DEV} --seed         # NODE_ENV=${DEV} and seeds test data"
  echo "  ./launch_docker.sh ${DEV} --clean        # NODE_ENV=${DEV} and clears frontend cache"
  echo "  ./launch_docker.sh ${DEV} --reset-db --seed  # Reset DB and seed fresh data"
  echo "  ./launch_docker.sh ${DOCKER}             # NODE_ENV=${DOCKER}"
  echo "  ./launch_docker.sh ${DOCKER} --reset-db  # NODE_ENV=${DOCKER} and resets database"
  echo "  ./launch_docker.sh ${DOCKER} --debug-mode  # NODE_ENV=${DOCKER} with the debug profile added"
  echo "  ./launch_docker.sh down                  # Stops the containers"
  echo "  ./launch_docker.sh --install             # Clean install"
}

if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
  print_help
  exit 0
fi

# Detect architecture
ARCH=$(uname -m)
if [[ "$ARCH" == "arm64" || "$ARCH" == "aarch64" ]]; then
  export DOCKER_PLATFORM=linux/arm64
elif [[ "$ARCH" == "x86_64" || "$ARCH" == "amd64" ]]; then
  export DOCKER_PLATFORM=linux/amd64
else
  echo "⚠️  Arch not supported/recognized/specified: $ARCH. using default linux/amd64."
  export DOCKER_PLATFORM=linux/amd64
fi

echo "📦 DOCKER_PLATFORM=${DOCKER_PLATFORM}"

# Handle --install
if [ "$1" == "--install" ]; then
  echo "🧹 Cleaning up installation..."
  pnpm cache clean --force
  sudo find . -name "dist" -type d -prune -exec rm -rf {} + 2>/dev/null || find . -name "dist" -type d -prune -exec rm -rf {} +
  sudo find . -type f -name "tsconfig.tsbuildinfo" -exec rm -f {} + 2>/dev/null || find . -type f -name "tsconfig.tsbuildinfo" -exec rm -f {} +
  sudo find . -name "node_modules" -type d -prune -exec rm -rf {} + 2>/dev/null || find . -name "node_modules" -type d -prune -exec rm -rf {} +
  rm -rf pnpm-lock.yaml

  if [ "$(uname -s)" = "Linux" ]; then
    echo "🔧 Running setup on Linux..."
    pnpm run setup:nix
  else
    echo "🐳 Running setup in Docker container..."
    docker run --platform ${DOCKER_PLATFORM} -it -v "$(pwd)":/workspace -w /workspace --rm node:22 bash -c 'corepack enable && pnpm run setup:nix'
  fi

  exit 0
fi

if [ -z "$1" ]; then
  echo "Error: NODE_ENV or 'down' must be specified"
  echo "Use flag -h or --help for more information and examples"
  exit 1
fi

# Stop containers first
echo "🛑 Stopping containers..."
DOCKER_PLATFORM=$DOCKER_PLATFORM docker compose -f docker-compose.dev.yml down 2>/dev/null || true
DOCKER_PLATFORM=$DOCKER_PLATFORM docker compose -f docker-compose.yml down 2>/dev/null || true

if [ "$1" == "down" ]; then
  echo "✅ All containers stopped"
  exit 0
fi

ALLOWED_ENVS=("${LOCAL}" "${DEV}" "${DOCKER}")

NODE_ENV=$1
RESET_DB=false
SEED_DATA=false
WAIT_FOR_SERVICES=false
CLEAN_CACHE=false

if [[ ! " ${ALLOWED_ENVS[@]} " =~ " ${NODE_ENV} " ]]; then
  echo "Error: NODE_ENV must be one of \"${ALLOWED_ENVS[@]// /|}\"."
  exit 1
fi

# Parse all flags
shift
while [[ $# -gt 0 ]]; do
  case "$1" in
    --reset-db)
      RESET_DB=true
      shift
      ;;
    --seed)
      SEED_DATA=true
      WAIT_FOR_SERVICES=true  # Seeding requires waiting for services
      shift
      ;;
    --wait)
      WAIT_FOR_SERVICES=true
      shift
      ;;
    --clean)
      CLEAN_CACHE=true
      shift
      ;;
    --debug-mode)
      DEBUG_STRING="--profile debug"
      export DEBUG_MODE="start:debug"
      shift
      ;;
    *)
      echo "Error: Unknown option $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

echo "🚀 NODE_ENV ${NODE_ENV}."
if [ "$RESET_DB" == true ]; then
  echo "♻️  Reset DB flag is set."
fi
if [ "$SEED_DATA" == true ]; then
  echo "🌱 Seed data flag is set."
fi
if [ "$CLEAN_CACHE" == true ]; then
  echo "🧹 Clean cache flag is set."
fi
if [ "$WAIT_FOR_SERVICES" == true ]; then
  echo "⏳ Will wait for services to be healthy."
fi

# Determine compose files based on NODE_ENV
if [ "$NODE_ENV" == "${DEV}" ] || [ "$NODE_ENV" == "${LOCAL}" ]; then
  COMPOSE_FILE="docker-compose.dev.yml"
  ENV_FILE=".env.docker"
else
  COMPOSE_FILE="docker-compose.yml"
  ENV_FILE=".env"
fi

# Handle database reset
if [ "$RESET_DB" == true ]; then
  echo "♻️  Removing volumes..."
  docker volume rm dentalos-pgdata-auth 2>/dev/null || true
  docker volume rm dentalos-pgdata-subscription 2>/dev/null || true
  docker volume rm dentalos-mongodata 2>/dev/null || true
  docker volume rm dentalos-miniodata 2>/dev/null || true
  docker volume rm dentalos-redisdata 2>/dev/null || true
  docker volume rm dentalos-rabbitmqdata 2>/dev/null || true
  echo "✅ Volumes removed"
fi

if [ "$CLEAN_CACHE" == true ]; then
  echo "🧹 Cleaning frontend caches..."

  echo "  - Removing dist directories..."
  find apps -maxdepth 2 -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true

  echo "  - Removing .vite directories..."
  find apps -maxdepth 2 -name ".vite" -type d -exec rm -rf {} + 2>/dev/null || true

  echo "  - Removing node_modules/.vite directories..."
  find apps -maxdepth 2 -path "*/node_modules/.vite" -type d -exec rm -rf {} + 2>/dev/null || true

  echo "✅ Frontend caches cleared"
  echo ""
  echo "🔥 CACHE CLEARED - Fresh build will occur on startup"
  echo "💡 After startup, hard refresh your browser (Ctrl+Shift+R / Cmd+Shift+R)"
  echo ""
fi

# Build shared packages for dev/local mode
if [ "$NODE_ENV" == "${DEV}" ] || [ "$NODE_ENV" == "${LOCAL}" ]; then
  echo "📦 Preparing development environment..."

  # Ensure env file exists
  if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  $ENV_FILE not found, creating from example..."
    cp .env.example "$ENV_FILE"
  fi

  # Check if bootstrap is needed
  NEED_BOOTSTRAP=false

  # Check if node_modules volume is empty or doesn't have pnpm-lock
  if ! docker volume inspect dentalos_node_modules &>/dev/null; then
    NEED_BOOTSTRAP=true
    echo "📥 First time setup - node_modules volume not found"
  elif ! docker run --rm -v dentalos_node_modules:/check alpine test -f /check/pnpm-lock.yaml &>/dev/null; then
    NEED_BOOTSTRAP=true
    echo "📥 Dependencies not installed in volume"
  fi

  if [ "$NEED_BOOTSTRAP" = true ]; then
    echo "📥 Running bootstrap (install + build packages)..."
    echo "⏱️  This may take 5-10 minutes on first run..."
    echo ""
    DOCKER_PLATFORM=$DOCKER_PLATFORM docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm bootstrap

    if [ $? -ne 0 ]; then
      echo ""
      echo "❌ Bootstrap failed!"
      echo "💡 Try running: ./launch_docker.sh --install"
      exit 1
    fi

    echo ""
    echo "✅ Bootstrap completed successfully"
  else
    echo "✅ Dependencies already installed, skipping bootstrap"
  fi
fi

# Start services
echo ""
echo "🚀 Starting services with: $COMPOSE_FILE"
echo "📊 View logs: docker compose -f $COMPOSE_FILE logs -f"
echo "🛑 Stop: ./launch_docker.sh down"
echo ""

# Start services in background if we need to wait or seed
if [ "$WAIT_FOR_SERVICES" == true ]; then
  echo "Starting services in background..."
  NODE_ENV=$NODE_ENV DOCKER_PLATFORM=$DOCKER_PLATFORM docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" $DEBUG_STRING up -d

  if [ $? -ne 0 ]; then
    echo "❌ Failed to start services"
    exit 1
  fi

  echo "⏳ Waiting for services to be healthy..."
  echo "This may take 60-90 seconds..."

  # Wait for health checks to pass
  sleep 10  # Give services time to start

  # Check health of key services
  RETRY_COUNT=0
  MAX_RETRIES=30

  while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    AUTH_HEALTH=$(docker compose -f "$COMPOSE_FILE" ps auth --format json 2>/dev/null | grep -o '"Health":"[^"]*"' | cut -d'"' -f4)

    if [ "$AUTH_HEALTH" == "healthy" ] || [ "$AUTH_HEALTH" == "" ]; then
      # Empty health means no healthcheck defined, which is ok
      echo "✅ Services are healthy"
      break
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -n "."
    sleep 2
  done

  echo ""

  if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "⚠️  Services did not become healthy in time, but will continue..."
  fi

  # Seed data if requested
  if [ "$SEED_DATA" == true ]; then
    echo ""
    echo "🌱 Seeding test data..."

    if [ -f "./seed-local-data.sh" ]; then
      ./seed-local-data.sh

      if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Test data seeded successfully!"
        echo ""
        echo "Test credentials are available in TEST_USERS.md"
      else
        echo ""
        echo "⚠️  Seeding failed, but services are running"
        echo "You can manually run: ./seed-local-data.sh"
      fi
    else
      echo "⚠️  seed-local-data.sh not found"
      echo "Cannot seed test data"
    fi
  fi

  echo ""
  echo "✅ Services are running!"
  echo ""
  echo "Useful commands:"
  echo "  View logs:     docker compose -f $COMPOSE_FILE logs -f"
  echo "  Stop services: ./launch_docker.sh down"
  echo "  Seed data:     ./seed-local-data.sh"
  echo ""

  # Keep running in foreground to show logs
  echo "Attaching to logs (Ctrl+C to detach, services will keep running)..."
  docker compose -f "$COMPOSE_FILE" logs -f
else
  # Start in foreground as usual
  NODE_ENV=$NODE_ENV DOCKER_PLATFORM=$DOCKER_PLATFORM docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" $DEBUG_STRING up
fi
