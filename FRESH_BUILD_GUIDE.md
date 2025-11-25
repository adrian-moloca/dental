# Fresh Build Script Guide

## Overview

`fresh_build.sh` is a bulletproof script designed to handle complete cache cleanup when encountering caching issues during development. It performs a nuclear-option rebuild that removes **every possible cache** from the project.

## What Gets Cleaned

### 1. **Docker Containers**
- Stops all running docker-compose services
- Removes orphaned containers
- Force-kills any related containers that won't stop gracefully

### 2. **Application Build Caches**
- `apps/*/dist` - Compiled output directories
- `apps/*/build` - Alternative build directories
- `apps/*/.next` - Next.js cache
- `apps/*/.vite` - Vite cache
- `apps/*/node_modules/.vite` - Vite cache in node_modules
- `apps/*/.turbo` - Turbo build cache
- `.next/` - Root Next.js cache (if exists)
- `.turbo/` - Root Turbo cache (if exists)

### 3. **Node Modules**
- Removes all `node_modules/` directories from apps
- Removes root `node_modules/` directory
- Fresh install via `pnpm install` during rebuild

### 4. **Dependency Lock (Always)**
- Removes `pnpm-lock.yaml` for fresh dependency resolution
- Regenerated during `pnpm install`

### 5. **Optional: Docker Volumes** (--volumes flag)
- Removes all docker volumes
- Clears database data
- Use with caution!

### 6. **Optional: pnpm Cache** (--pnpm flag)
- Clears pnpm store and cache
- Forces fresh download of all dependencies

## Usage

### Basic Usage (Recommended)
```bash
./fresh_build.sh
```
This performs a clean rebuild without destructive operations.

### With Database Wipe
```bash
./fresh_build.sh --volumes
```
Use when you need to reset database to a clean state.

### With Full Cache Clear
```bash
./fresh_build.sh --pnpm
```
Clears pnpm's internal cache. Use if experiencing dependency resolution issues.

### With Seed Data
```bash
./fresh_build.sh --seed
```
Automatically loads seed data after docker services start.

### Full Nuclear Option
```bash
./fresh_build.sh --volumes --pnpm --seed
```
Complete reset: fresh database, fresh dependency cache, fresh build, and loaded seed data.

## Script Flow

The script executes in this precise order:

```
1. Pre-flight Checks
   ├─ Verify docker-compose.yml exists
   ├─ Verify pnpm installed
   └─ Verify Docker daemon running

2. Stop Docker Containers
   ├─ docker-compose down
   ├─ Force kill remaining containers
   └─ Clean up orphaned containers

3. Remove Application Caches
   ├─ Find and remove dist/ directories
   ├─ Find and remove build/ directories
   ├─ Find and remove .vite/ directories
   ├─ Find and remove .turbo/ directories
   ├─ Find and remove .next/ directories
   └─ Safe removal with error handling

4. Remove Node Modules
   ├─ Remove all apps/*/node_modules/
   └─ Remove root node_modules/

5. Manage Docker Volumes (if --volumes)
   └─ Remove project-specific volumes

6. Clear pnpm Cache (if --pnpm)
   ├─ pnpm store prune
   └─ pnpm cache clean

7. Remove Lockfile
   └─ Remove pnpm-lock.yaml for fresh resolution

8. Install Dependencies
   └─ pnpm install --frozen-lockfile=false

9. Build Applications
   └─ pnpm build

10. Build Docker Images
    └─ docker-compose build --no-cache

11. Start Docker Services
    └─ docker-compose up -d

12. Run Seed (if --seed)
    └─ Attempt seed via pnpm or docker
```

## Flags Reference

| Flag | Effect | Destructive | Use Case |
|------|--------|------------|----------|
| `--volumes` | Remove docker volumes | Yes | Reset database to clean state |
| `--pnpm` | Clear pnpm cache | No | Fix dependency resolution issues |
| `--seed` | Run seed after start | No | Populate database with initial data |
| `--help` | Show usage information | No | Get script help |

## Error Handling

The script is designed to handle multiple failure scenarios:

### Safe Failures (Non-blocking)
- Container stop failures → Forced kill attempts
- Volume removal failures → Continues with build
- Seed failures → Logs warning, completes build
- Service health checks → Waits and continues

### Fatal Failures (Exit with error)
- docker-compose.yml not found → Exit 1
- pnpm not installed → Exit 1
- Docker daemon not running → Exit 1
- pnpm install fails → Exit 1
- pnpm build fails → Exit 1
- docker-compose build fails → Exit 1
- docker-compose up fails → Exit 1

## Output Format

The script uses color-coded logging:

- **BLUE [INFO]** - Informational messages
- **GREEN [SUCCESS]** - Successful completion of steps
- **YELLOW [WARNING]** - Non-fatal issues or destructive actions
- **RED [ERROR]** - Fatal errors requiring script exit

## When to Use This Script

Use `fresh_build.sh` when you encounter:

1. **Build cache issues**
   - Stale compiled code being used
   - Changes not reflected in running services
   - `dist/` conflicts

2. **Vite/Turbo cache problems**
   - Changes to configuration not picked up
   - Weird build behavior
   - Hot reload not working

3. **pnpm resolution issues**
   - Dependency conflicts
   - Missing transitive dependencies
   - Strange import errors

4. **Docker issues**
   - Orphaned containers
   - Volume conflicts
   - Stale images

5. **Database issues**
   - Need to reset to known state
   - Migration conflicts
   - Use with `--volumes --seed` flags

## Real-World Examples

### Scenario 1: Configuration Change Not Picked Up
```bash
./fresh_build.sh
```
Clears vite/turbo cache without losing database.

### Scenario 2: Database Corruption
```bash
./fresh_build.sh --volumes --seed
```
Wipes everything and starts fresh with seed data.

### Scenario 3: Persistent Build Failures
```bash
./fresh_build.sh --pnpm
```
Clears pnpm cache in case of dependency issues.

### Scenario 4: Clean Development Reset
```bash
./fresh_build.sh --volumes --seed
```
Full reset for starting development on clean slate.

## Timing

Typical execution times (on modern hardware):

- **With --volumes --pnpm --seed**: 3-5 minutes
- **Basic rebuild only**: 1-2 minutes
- **Add --seed flag**: +30 seconds
- **Add --volumes flag**: +30 seconds
- **Add --pnpm flag**: +30 seconds

Most time is spent on `pnpm install` and `docker-compose build --no-cache`.

## Performance Tips

1. **Monitor Progress**: `docker-compose logs -f` in another terminal
2. **Check Logs**: If build seems stuck, check container logs
3. **Partial Rebuild**: For faster rebuilds, use `docker-compose up -d` after stopping
4. **Selective Clean**: Remove only specific caches manually if time is critical

## Troubleshooting

### Script exits with "docker-compose.yml not found"
- Ensure you run the script from the project root
- The script auto-detects the root directory

### "pnpm is not installed"
- Install pnpm: `npm install -g pnpm`
- Or: `brew install pnpm` (macOS)

### "Docker daemon is not running"
- Start Docker Desktop (macOS/Windows) or Docker service (Linux)
- Verify with: `docker ps`

### Script hangs after "Building docker images"
- Check available disk space: `df -h`
- Check Docker disk space: `docker system df`
- Clean Docker: `docker system prune -a`

### Seed data fails to load
- Database might not be ready yet
- Run manually: `pnpm --filter="*auth*" run seed`
- Or via docker: `docker-compose exec backend-auth pnpm seed`

## Safety Considerations

### Before Using --volumes
- This **PERMANENTLY DELETES** database data
- Only use when you explicitly want to reset
- Consider backing up production databases

### Before Using --pnpm
- This clears the package cache
- Next install will be slower (network operations)
- Safe to use anytime

### Docker Services
- Services may take 10-30 seconds to become healthy
- Script waits 10 seconds by default
- Check health: `docker-compose ps`

## Integration with CI/CD

If using this in CI/CD:

```bash
#!/bin/bash
set -euo pipefail

# For CI: use all flags to ensure clean state
./fresh_build.sh --volumes --pnpm --seed

# Verify services are running
docker-compose ps
```

## Maintenance

The script is designed to be self-maintaining:

- Auto-discovers cache locations via glob patterns
- Uses `find` for safe recursive cleanup
- Handles both app and root level caches
- Compatible with monorepo structure

If you add new cache locations:
1. Add the pattern to `CACHE_PATTERNS` array
2. Restart script
3. Script will automatically clean them

## Advanced Usage

### Dry Run (See what would be deleted)
```bash
# View what caches exist:
find apps -type d -name "dist" -o -name ".vite" -o -name ".turbo"
```

### Manual Multi-Step Build
```bash
# If you want to control each step:
docker-compose down --remove-orphans  # Step 1
find apps -type d -name "dist" -exec rm -rf {} \;  # Step 2
rm -rf node_modules  # Step 3
pnpm install  # Step 8
pnpm build  # Step 9
docker-compose build --no-cache  # Step 10
docker-compose up -d  # Step 11
```

## Support

If the script fails or behaves unexpectedly:

1. Check the error message (marked in RED)
2. Verify pre-flight checks pass
3. Ensure sufficient disk space (>20GB recommended)
4. Check Docker is healthy: `docker info`
5. Try manual steps if script hangs

## Version History

- **v1.0** (2025-11-24)
  - Initial release
  - Full cache clearing functionality
  - Optional volume and pnpm cache clearing
  - Seed data support
  - Comprehensive error handling
