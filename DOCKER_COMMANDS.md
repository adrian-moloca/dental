# Docker Commands Reference for Dental OS

This document provides quick commands for working with Dental OS using Docker, similar to the smambu setup.

## Quick Start Commands

### Development Mode (Recommended)
```bash
# Start all services in dev mode with hot-reload
npm run docker:dev

# Or directly:
./launch_docker.sh dev
```

### Reset and Clean Start
```bash
# Reset databases and start fresh
./launch_docker.sh dev --reset-db
```

### Stop All Services
```bash
# Stop all containers
npm run docker:down

# Or directly:
./launch_docker.sh down
```

### Clean Install
```bash
# Clean everything and reinstall (like smambu's --install)
npm run docker:install

# Or directly:
./launch_docker.sh --install
```

## Available Commands

### NPM Scripts (package.json)

#### Setup Commands
- `npm run setup:nix` - Install dependencies, build packages, sync env (Linux/Mac)
- `npm run setup` - Cross-platform setup (detects OS)
- `npm run assemble:env-docker` - Sync .env.docker with .env.example

#### Docker Launch Commands
- `npm run docker:dev` - Start in dev mode (hot-reload, all services)
- `npm run docker:local` - Start in local mode (minimal services)
- `npm run docker:docker` - Start in production-like mode
- `npm run docker:down` - Stop all containers
- `npm run docker:install` - Clean install everything

#### Legacy Commands (still work)
- `npm run docker:start` - Uses launch-app-docker.sh
- `npm run docker:stop` - Stop dev services
- `npm run docker:logs` - View logs

### Direct Script Usage

#### launch_docker.sh (New - Similar to smambu)
```bash
# Show help
./launch_docker.sh --help

# Start in dev mode
./launch_docker.sh dev

# Start with database reset
./launch_docker.sh dev --reset-db

# Start in docker (production-like) mode
./launch_docker.sh docker

# Debug mode
./launch_docker.sh docker --debug-mode

# Stop all containers
./launch_docker.sh down

# Clean install
./launch_docker.sh --install
```

#### Environment Sync
```bash
# Sync specific env file with .env.example
./sync-env.sh .env.docker

# NPM alternative
npm run assemble:env-docker
```

## Environment Modes

### `local`
- Minimal services for lightweight development
- Good for working on specific features without full stack

### `dev` (Recommended)
- Full development stack with hot-reload
- All backend services in containers
- Frontend can run locally or in container
- Similar to smambu's development mode

### `docker`
- Production-like build
- For testing production configurations locally
- No hot-reload

## Comparison with smambu

| smambu command | dental command | Description |
|---------------|----------------|-------------|
| `./launch_docker.sh localci` | `./launch_docker.sh dev` | Full dev with hot-reload |
| `./launch_docker.sh ci` | `./launch_docker.sh docker` | Production-like mode |
| `./launch_docker.sh docker` | `./launch_docker.sh local` | Local minimal mode |
| `./launch_docker.sh down` | `./launch_docker.sh down` | Stop containers |
| `./launch_docker.sh --install` | `./launch_docker.sh --install` | Clean install |
| `npm run setup:nix` | `npm run setup:nix` | Setup dependencies & build |

## Architecture Detection

The script automatically detects your architecture (arm64/aarch64 or x86_64/amd64) and sets `DOCKER_PLATFORM` accordingly.

## Files Created/Modified

1. **launch_docker.sh** - Main unified launcher (like smambu)
2. **sync-env.sh** - Environment file synchronization
3. **package.json** - Added new scripts for setup and docker commands
4. **.env.docker** - Development environment configuration
5. **.env.example** - Template for environment variables

## Common Workflows

### First Time Setup
```bash
# Simply run dev mode - bootstrap will run automatically
./launch_docker.sh dev

# The script will:
# 1. Check if dependencies are installed
# 2. Run bootstrap if needed (5-10 minutes first time)
# 3. Start all services with hot-reload

# Or use clean install if you have issues:
./launch_docker.sh --install
```

### Daily Development
```bash
# Start
npm run docker:dev

# Stop when done
npm run docker:down
```

### Database Reset
```bash
# When you need fresh databases
./launch_docker.sh dev --reset-db
```

### Troubleshooting

#### Services failing with "Cannot find module"
This means dependencies are not installed in the Docker volumes.

```bash
# Solution 1: Let the script bootstrap automatically
./launch_docker.sh down
./launch_docker.sh dev  # Will detect and run bootstrap

# Solution 2: Force clean install
./launch_docker.sh --install
./launch_docker.sh dev

# Solution 3: Manually run bootstrap
docker compose -f docker-compose.dev.yml --env-file .env.docker run --rm bootstrap
```

#### Database/Volume Issues
```bash
# Reset all volumes (WARNING: deletes all data)
./launch_docker.sh dev --reset-db

# Or manually remove specific volumes
docker volume rm dentalos_node_modules
docker volume rm dentalos_pnpm-store
docker volume rm dentalos-mongodata
```

#### General Issues
```bash
# Stop everything
./launch_docker.sh down

# Clean install
./launch_docker.sh --install

# Start fresh with clean DB
./launch_docker.sh dev --reset-db
```

## Notes

- The script works on both Linux and macOS
- Windows users should use WSL2 or adjust commands accordingly
- All volumes are persistent unless --reset-db is used
- Hot-reload is enabled in dev mode for all services
- Bootstrap container runs automatically when needed
