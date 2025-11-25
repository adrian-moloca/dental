# Cache Cleanup Checklist

This document details exactly what the `fresh_build.sh` script cleans at each step.

## Step-by-Step Cache Removal

### Step 1: Docker Containers (Always)

**Action:** Stop and remove all running docker containers

**Cleanup:**
- [ ] `docker-compose down --remove-orphans`
- [ ] Force kill remaining containers by pattern
- [ ] Remove any orphaned containers

**Result:** All containers stopped, ready for fresh start

---

### Step 2: Application Build Caches (Always)

**Action:** Find and remove all build output directories

**Patterns Cleaned:**

| Cache Type | Locations | Purpose |
|-----------|-----------|---------|
| **dist/** | `apps/*/dist` | Compiled output from esbuild/tsc |
| **build/** | `apps/*/build` | Alternative build output |
| **.next/** | `apps/*/.next` + `.next/` (root) | Next.js build cache |
| **.vite/** | `apps/*/.vite` + `apps/*/node_modules/.vite` | Vite build cache |
| **.turbo/** | `apps/*/.turbo` + `.turbo/` (root) | Turbo build system cache |

**Safe Removal Method:** Uses `find` with `-print0` and `xargs` for safe handling

**Result:** All stale build artifacts removed, forcing rebuild

---

### Step 3: Node Modules (Always)

**Action:** Completely remove all dependency directories

**Cleanup:**
- [ ] `find apps -type d -name "node_modules" -delete`
- [ ] `rm -rf /root/node_modules`

**Result:** Fresh state for dependency installation

---

### Step 4: Docker Volumes (Optional: --volumes flag)

**Action:** Remove docker volumes and persistent data

**Cleanup:**
- [ ] `docker volume rm` for volumes matching project name
- [ ] `docker volume rm` for postgres/redis/kafka volumes
- [ ] `docker-compose down -v` to remove anonymous volumes

**Impact:** DESTRUCTIVE - Deletes all database data

**Use Cases:**
- Reset database to clean state
- Remove volume conflicts
- Fresh development environment
- Testing database migrations

**Result:** All database data wiped, volumes recreated on next start

---

### Step 5: pnpm Cache (Optional: --pnpm flag)

**Action:** Clear pnpm's internal package cache

**Cleanup:**
- [ ] `pnpm store prune` - Remove unreferenced packages
- [ ] `pnpm cache clean` - Clear cache directory

**Result:** Forces fresh download of all dependencies from registry

**Use Cases:**
- Corrupted cache files
- Dependency resolution issues
- Disk space issues in cache
- Network timeout recovery

**Note:** Not destructive - just clears package cache

---

### Step 6: pnpm Lockfile (Always)

**Action:** Remove dependency lock file for fresh resolution

**Cleanup:**
- [ ] `rm -f pnpm-lock.yaml`

**Result:** `pnpm install` will regenerate from scratch

**Impact:**
- May download different minor versions
- Ensures fresh dependency tree
- Regenerated during step 8

---

### Step 7: Dependency Installation (Always)

**Action:** Reinstall all dependencies with fresh lockfile

**Command:** `pnpm install --frozen-lockfile=false`

**Cleanup:**
- [ ] Install root dependencies
- [ ] Install all workspace dependencies
- [ ] Regenerate pnpm-lock.yaml

**Result:** Clean, verified dependency tree

---

### Step 8: Application Build (Always)

**Action:** Rebuild all applications from source

**Command:** `pnpm build`

**Cleanup:**
- [ ] Rebuild all monorepo packages
- [ ] Generate new dist/ directories
- [ ] Fresh build artifacts

**Result:** Up-to-date compiled code

---

### Step 9: Docker Images (Always)

**Action:** Rebuild docker images without using cache

**Command:** `docker-compose build --no-cache`

**Cleanup:**
- [ ] Skip Docker layer cache
- [ ] Rebuild all images from Dockerfile
- [ ] Fresh image layers

**Result:** No stale images, fresh containers on start

---

### Step 10: Docker Services (Always)

**Action:** Start all services with fresh images

**Command:** `docker-compose up -d`

**Cleanup:**
- [ ] Create new containers from fresh images
- [ ] Start services
- [ ] Wait for healthy state

**Result:** Running services ready for use

---

### Step 11: Seed Data (Optional: --seed flag)

**Action:** Populate database with initial data

**Command:** One of:
- `pnpm --filter="*auth*" run seed`
- `docker-compose exec -T backend-auth pnpm seed`

**Cleanup:**
- [ ] Clear any existing seed state
- [ ] Load initial data
- [ ] Initialize database schemas

**Result:** Database with known, clean data state

---

## Cleanup Matrix

| Item | Always | --volumes | --pnpm | --seed |
|------|--------|-----------|--------|--------|
| Docker containers | ✓ | ✓ | ✓ | ✓ |
| apps/*/dist | ✓ | ✓ | ✓ | ✓ |
| apps/*/.vite | ✓ | ✓ | ✓ | ✓ |
| apps/*/.turbo | ✓ | ✓ | ✓ | ✓ |
| node_modules | ✓ | ✓ | ✓ | ✓ |
| pnpm-lock.yaml | ✓ | ✓ | ✓ | ✓ |
| Docker volumes | | ✓ | | |
| pnpm cache | | | ✓ | |
| Seed data | | | | ✓ |

---

## Cache Sizes (Typical)

| Cache | Size | Impact |
|-------|------|--------|
| node_modules/ | 1-2 GB | Major - forces reinstall |
| dist/ (all) | 100-500 MB | Moderate - forces rebuild |
| .turbo/ | 50-200 MB | Minor - forces rebuild |
| .vite/ | 50-150 MB | Minor - forces rebuild |
| pnpm store | 500 MB - 2 GB | Major - forces redownload |
| Docker volumes | 1-10 GB | Major - deletes data |

---

## Verification Checklist

After running `fresh_build.sh`, verify:

### Pre-Cleanup State
- [ ] Identify what caches existed
- [ ] Note current disk usage: `du -sh apps/ node_modules/ .turbo/ .next/`

### Post-Cleanup State
- [ ] No dist/ directories: `find apps -name "dist" -type d`
- [ ] No node_modules: `find apps -name "node_modules" -type d`
- [ ] pnpm-lock.yaml regenerated: `ls -la pnpm-lock.yaml`
- [ ] Docker services running: `docker-compose ps`
- [ ] Services healthy: Check `docker-compose logs`

### Fresh Build State
- [ ] Applications built: Check console output for build success
- [ ] Docker images updated: `docker images | grep dental`
- [ ] Containers running: `docker ps --filter "name=dental"`

---

## Common Cleanup Scenarios

### Scenario: Vite Cache Issue
**Symptoms:** Changes to config not reflected, hot reload broken

**Clean Targets:**
```bash
rm -rf apps/*/.vite
rm -rf apps/*/node_modules/.vite
rm -rf dist/
```

**Script Usage:** `./fresh_build.sh` (basic rebuild)

---

### Scenario: Turbo Cache Corruption
**Symptoms:** Weird incremental build failures, inconsistent results

**Clean Targets:**
```bash
rm -rf .turbo/
rm -rf apps/*/.turbo/
```

**Script Usage:** `./fresh_build.sh` (basic rebuild)

---

### Scenario: Dependency Hell
**Symptoms:** Unresolved dependencies, version conflicts, strange errors

**Clean Targets:**
```bash
rm -rf node_modules/
rm -rf apps/*/node_modules/
rm pnpm-lock.yaml
pnpm store prune
```

**Script Usage:** `./fresh_build.sh --pnpm`

---

### Scenario: Database Corruption
**Symptoms:** Migration failures, data inconsistencies, schema mismatches

**Clean Targets:**
```bash
docker volume rm [project-volumes]
docker-compose down -v
[Run seed scripts]
```

**Script Usage:** `./fresh_build.sh --volumes --seed`

---

### Scenario: Docker Image Stale
**Symptoms:** Code changes not reflected in container, old behavior persisting

**Clean Targets:**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**Script Usage:** `./fresh_build.sh` (builds without cache)

---

## What NOT to Delete

- `.env` files (configuration)
- `src/` directories (source code)
- `docker-compose.yml` (configuration)
- `.git/` directory (version control)
- Workspace files (VS Code, etc)
- `package.json` / `pnpm-workspace.yaml` (manifests)

---

## Recovery If Something Goes Wrong

### If Database Was Wiped Accidentally
```bash
# If --volumes wasn't intended:
./fresh_build.sh --seed  # Reload seed data
# OR restore from backup if available
```

### If Build Is Still Failing
```bash
# Check for missed caches:
find . -name "dist" -o -name ".vite" -o -name ".turbo"

# Manual cleanup:
find . -name "dist" -exec rm -rf {} \;
find . -name ".vite" -exec rm -rf {} \;
rm -rf node_modules pnpm-lock.yaml
```

### If Docker Services Won't Start
```bash
# Check Docker logs:
docker-compose logs

# Force cleanup:
docker system prune -a
docker-compose down -v
./fresh_build.sh
```

---

## Performance Notes

### Fastest Cleanup
`./fresh_build.sh` - 1-2 minutes
- Skips pnpm cache clear
- Skips volume removal
- Skips seed data

### Slowest Cleanup
`./fresh_build.sh --volumes --pnpm --seed` - 3-5 minutes
- Clears all caches
- Removes volumes (data loss)
- Redownloads all packages
- Rebuilds everything
- Seeds database

### Optimization
Most time spent on:
1. `pnpm install` (downloading packages) - ~1 minute
2. `docker-compose build --no-cache` - ~1 minute
3. `pnpm build` (compilation) - ~30 seconds

To speed up:
- Ensure good internet for pnpm install
- Close other Docker containers
- Ensure 20+ GB free disk space
- Use `--no-cache` judiciously

---

## Related Commands

```bash
# View what would be cleaned (dry run):
find apps -type d -name "dist" -o -name ".vite" -o -name ".turbo"

# Selective cache clearing:
rm -rf apps/*/dist              # Just dist
rm -rf .turbo apps/*/.turbo/    # Just turbo
rm -rf apps/*/.vite/            # Just vite

# Docker cleanup:
docker system prune -a          # System-wide cleanup
docker volume ls                # List all volumes
docker images | grep dental     # View project images

# pnpm cleanup:
pnpm store list                 # Show cache contents
pnpm cache clean                # Clear cache
```

---

## Documentation Links

- Full Guide: `./FRESH_BUILD_GUIDE.md`
- Quick Reference: `./FRESH_BUILD_QUICK_REFERENCE.txt`
- Script: `./fresh_build.sh`

