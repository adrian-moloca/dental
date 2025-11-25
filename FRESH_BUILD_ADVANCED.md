# Fresh Build Script - Advanced Usage & Troubleshooting

## Table of Contents

1. [Advanced Usage Patterns](#advanced-usage-patterns)
2. [Partial Rebuilds](#partial-rebuilds)
3. [Troubleshooting Guide](#troubleshooting-guide)
4. [Integration with CI/CD](#integration-with-cicd)
5. [Performance Optimization](#performance-optimization)
6. [Safety & Backup Strategies](#safety--backup-strategies)
7. [Debugging Failed Builds](#debugging-failed-builds)

---

## Advanced Usage Patterns

### Pattern 1: Incremental Cleanup

Clean only specific caches without full rebuild:

```bash
# Just clear vite cache (fast):
find apps -type d -name ".vite" -exec rm -rf {} \;
docker-compose restart

# Just clear turbo cache:
rm -rf .turbo apps/*/.turbo/
pnpm build

# Just refresh images:
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Pattern 2: Rebuild Specific Service

If only one service needs cleaning:

```bash
# For backend-auth service only:
rm -rf apps/backend-auth/dist
rm -rf apps/backend-auth/node_modules
pnpm --filter backend-auth install
pnpm --filter backend-auth build
docker-compose up -d backend-auth
```

### Pattern 3: Clean All Except Database

Preserve existing database while rebuilding code:

```bash
# This is the default behavior:
./fresh_build.sh

# Equivalent manual steps:
docker-compose down --remove-orphans
rm -rf apps/*/dist apps/*/node_modules
pnpm install
pnpm build
docker-compose build --no-cache
docker-compose up -d
```

### Pattern 4: Database Only Reset

Keep code intact, reset database:

```bash
# Quick database reset:
./fresh_build.sh --volumes --seed

# Without code rebuild:
docker-compose down -v
docker-compose up -d
# Wait for services to initialize
docker-compose exec -T backend-auth pnpm seed
```

### Pattern 5: Continuous Integration Build

For CI/CD with strict requirements:

```bash
#!/bin/bash
set -euo pipefail

# From CI perspective:
cd /workspace

# Ensure absolutely clean state
./fresh_build.sh --pnpm

# Verify success
docker-compose ps
docker-compose exec -T backend-auth npm test
```

---

## Partial Rebuilds

### Rebuild Only Frontend

```bash
# Assumption: database and backend still running
docker-compose down web-clinic-portal

# Clean frontend caches:
rm -rf apps/web-clinic-portal/dist
rm -rf apps/web-clinic-portal/.next
rm -rf apps/web-clinic-portal/node_modules

# Rebuild:
pnpm --filter web-clinic-portal install
pnpm --filter web-clinic-portal build
docker-compose up -d web-clinic-portal
```

### Rebuild Only Backend

```bash
# Assumption: database still running
docker-compose down backend-auth backend-clinical backend-inventory-service

# Clean backend caches:
for app in backend-*; do
  rm -rf apps/$app/dist
  rm -rf apps/$app/node_modules
done

# Rebuild:
pnpm install
pnpm build
docker-compose build backend-auth backend-clinical backend-inventory-service
docker-compose up -d backend-auth backend-clinical backend-inventory-service
```

### Rebuild Without Database Reset

```bash
# Keep volumes intact
docker-compose down --remove-orphans

# Clean code caches
rm -rf apps/*/dist
rm -rf apps/*/node_modules
rm -rf .turbo

# Rebuild and start
pnpm install
pnpm build
docker-compose build --no-cache
docker-compose up -d

# Verify database still intact
docker-compose exec -T postgres psql -U postgres -c "\l"
```

---

## Troubleshooting Guide

### Issue 1: "No space left on device"

**Symptoms:**
- `ENOSPC` errors during build
- Docker build fails
- pnpm install fails

**Diagnosis:**
```bash
# Check disk space:
df -h

# Check Docker disk usage:
docker system df

# Check what's consuming space:
du -sh apps/ node_modules/ .turbo/ .next/
```

**Solution:**
```bash
# Clean up unused Docker data:
docker system prune -a --volumes

# Remove old images:
docker image prune -a

# Run fresh build:
./fresh_build.sh
```

---

### Issue 2: Docker Containers Won't Stop

**Symptoms:**
- Script hangs on "Stopping Docker Containers"
- Containers remain running after docker-compose down
- Force kill required

**Diagnosis:**
```bash
# Check for stuck containers:
docker ps -a | grep -v healthy

# Check for blocking processes:
docker logs [container-id]
```

**Solution:**
```bash
# Manual force cleanup:
docker kill $(docker ps -q)
docker system prune -a -f

# Then run:
./fresh_build.sh
```

---

### Issue 3: Build Cache Still Being Used

**Symptoms:**
- Changes not reflected in running services
- Old code being served despite rebuild
- Docker layer cache being used

**Diagnosis:**
```bash
# Verify caches removed:
find apps -type d -name "dist" -o -name ".vite" -o -name ".turbo"
ls -la .turbo/ dist/ 2>/dev/null || echo "Cleared"

# Check Docker build logs:
docker-compose build --verbose
```

**Solution:**
```bash
# Aggressive cache clearing:
./fresh_build.sh --pnpm

# Or manual:
find . -name "dist" -exec rm -rf {} \;
find . -name ".vite" -exec rm -rf {} \;
find . -name ".turbo" -exec rm -rf {} \;
pnpm store prune
docker system prune -a
./fresh_build.sh
```

---

### Issue 4: Dependency Installation Fails

**Symptoms:**
- `pnpm install` fails with network errors
- Package download timeouts
- Checksum mismatches

**Diagnosis:**
```bash
# Check network:
ping registry.npmjs.org

# Check pnpm cache:
pnpm store status

# View detailed error:
pnpm install --verbose
```

**Solution:**
```bash
# Clear pnpm cache and retry:
./fresh_build.sh --pnpm

# Or manually:
pnpm cache clean
rm -rf pnpm-lock.yaml
pnpm install
```

---

### Issue 5: Services Won't Start After Rebuild

**Symptoms:**
- `docker-compose up` fails
- Services crash immediately
- Health checks fail

**Diagnosis:**
```bash
# Check logs:
docker-compose logs

# Check specific service:
docker-compose logs backend-auth

# Check container status:
docker ps -a | grep dental

# Check port conflicts:
netstat -tulpn | grep LISTEN
```

**Solution:**
```bash
# Stop and check ports:
docker-compose down
lsof -i :5432  # Check postgres port
lsof -i :6379  # Check redis port

# Manual service check:
docker-compose up -d postgres redis
sleep 5
docker-compose up -d
```

---

### Issue 6: Database Corruption

**Symptoms:**
- Migration errors
- Schema mismatches
- Seed data fails
- Connection errors

**Diagnosis:**
```bash
# Check database status:
docker-compose exec postgres psql -U postgres -c "\l"

# Check migrations:
docker-compose exec -T backend-auth pnpm run typeorm migration:show

# View recent logs:
docker-compose logs backend-auth | tail -50
```

**Solution:**
```bash
# Full database reset:
./fresh_build.sh --volumes --seed

# Or manual:
docker-compose down -v
docker-compose up -d postgres
sleep 10
docker-compose up -d
docker-compose exec -T backend-auth pnpm seed
```

---

### Issue 7: Vite Hot Reload Not Working

**Symptoms:**
- Changes not reflected on page refresh
- Webpack/Vite cache stale
- Hot Module Replacement not connecting

**Diagnosis:**
```bash
# Check vite cache:
ls -la apps/web-clinic-portal/.vite/

# Check browser console:
# Look for failed WebSocket connections

# Check docker port mapping:
docker-compose ps | grep web
```

**Solution:**
```bash
# Clear vite cache:
rm -rf apps/web-clinic-portal/.vite/
rm -rf apps/web-clinic-portal/node_modules/.vite/

# Restart frontend:
docker-compose restart web-clinic-portal

# Or full rebuild:
./fresh_build.sh
```

---

### Issue 8: pnpm Lockfile Conflicts

**Symptoms:**
- Installation fails due to lockfile
- Dependency resolution conflicts
- Cannot find package versions

**Diagnosis:**
```bash
# Check lockfile status:
ls -la pnpm-lock.yaml
git status pnpm-lock.yaml

# Validate lockfile:
pnpm install --verify
```

**Solution:**
```bash
# Regenerate lockfile:
./fresh_build.sh

# Or manual:
rm pnpm-lock.yaml
pnpm install
git add pnpm-lock.yaml
git commit -m "Regenerate lockfile"
```

---

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Fresh Build and Test

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install Docker
        run: |
          docker --version
          docker-compose --version

      - name: Run Fresh Build
        run: |
          chmod +x ./fresh_build.sh
          ./fresh_build.sh --seed

      - name: Verify Services
        run: |
          docker-compose ps
          docker-compose exec -T backend-auth npm test

      - name: Cleanup
        if: always()
        run: docker-compose down -v
```

### GitLab CI Example

```yaml
stages:
  - build
  - test
  - cleanup

fresh-build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - apt-get update && apt-get install -y pnpm nodejs
    - chmod +x ./fresh_build.sh
    - ./fresh_build.sh --seed
  artifacts:
    paths:
      - .docker-compose.log
    expire_in: 1 hour

test:
  stage: test
  script:
    - docker-compose exec -T backend-auth npm test

cleanup:
  stage: cleanup
  script:
    - docker-compose down -v
  when: always
```

---

## Performance Optimization

### Strategy 1: Use Docker BuildKit for Faster Builds

```bash
# Enable BuildKit:
export DOCKER_BUILDKIT=1

# Then run:
./fresh_build.sh
```

### Strategy 2: Parallel Builds

```bash
# Manually build services in parallel:
docker-compose build --parallel

# With pnpm:
pnpm build --parallel
```

### Strategy 3: Selective Rebuilds During Development

Instead of full `fresh_build.sh` for small changes:

```bash
# Just restart running service:
docker-compose restart backend-auth

# Just rebuild one app:
pnpm --filter backend-auth build
docker-compose build backend-auth
docker-compose up -d backend-auth

# Just clear one cache:
rm -rf apps/backend-auth/.vite/
```

### Strategy 4: Cache Warming

```bash
# Pre-download dependencies (before build):
pnpm install --frozen-lockfile

# Pre-warm Docker cache:
docker-compose build --cache-from [previous-tag]
```

### Strategy 5: Use .dockerignore

```dockerfile
# In .dockerignore:
node_modules
dist
build
.next
.turbo
.vite
```

This reduces build context size.

---

## Safety & Backup Strategies

### Before Running --volumes

```bash
# Backup database:
docker-compose exec postgres pg_dump -U postgres > backup.sql

# Then run with confidence:
./fresh_build.sh --volumes

# If needed, restore:
docker-compose exec -T postgres psql -U postgres < backup.sql
```

### Automated Backups

```bash
#!/bin/bash
# backup_before_clean.sh

BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

echo "Backing up database..."
docker-compose exec postgres pg_dump -U postgres > \
  "$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).sql"

echo "Backing up volumes..."
docker run --rm -v dental_postgres_data:/data \
  -v "$BACKUP_DIR:/backup" \
  busybox tar czf /backup/postgres-$(date +%Y%m%d-%H%M%S).tar.gz -C /data .

echo "Backups created in $BACKUP_DIR"
```

### Quick Rollback

```bash
#!/bin/bash
# rollback_database.sh

BACKUP_FILE=$1

if [[ -z "$BACKUP_FILE" ]]; then
  echo "Usage: ./rollback_database.sh <backup.sql>"
  exit 1
fi

echo "Restoring from $BACKUP_FILE..."
docker-compose down -v
docker-compose up -d postgres
sleep 5
docker-compose exec -T postgres psql -U postgres < "$BACKUP_FILE"
docker-compose up -d
```

---

## Debugging Failed Builds

### Enable Verbose Logging

```bash
# Verbose pnpm install:
LOGLEVEL=debug pnpm install

# Verbose docker build:
docker-compose build --verbose --no-cache

# Verbose docker-compose up:
docker-compose --verbose up -d
```

### Capture Full Build Log

```bash
# Save complete build output:
./fresh_build.sh > build.log 2>&1

# View log:
cat build.log | grep -i error
tail -100 build.log
```

### Debug Individual Steps

```bash
# Step 1: Verify docker-compose.yml:
docker-compose config

# Step 2: Test dependencies:
pnpm install --dry-run

# Step 3: Test build:
pnpm build --verbose

# Step 4: Test docker build:
docker-compose build --no-cache

# Step 5: Test service start:
docker-compose up -d
docker-compose ps
docker-compose logs
```

### Check Resource Constraints

```bash
# Docker resources:
docker system df
docker stats

# System resources:
free -h
df -h
ps aux | head -20

# Network:
ping registry.npmjs.org
curl -I https://registry.npmjs.org
```

---

## Monitoring Script Execution

### Real-time Monitoring

```bash
# Terminal 1: Run script
./fresh_build.sh --seed

# Terminal 2: Monitor Docker
watch docker-compose ps

# Terminal 3: Monitor logs
docker-compose logs -f
```

### Script with Timing

```bash
# Time the full build:
time ./fresh_build.sh

# Time individual steps:
time pnpm install
time pnpm build
time docker-compose build --no-cache
time docker-compose up -d
```

### Build Metrics

```bash
# Image sizes:
docker images | grep dental

# Container stats:
docker stats --no-stream

# Volume sizes:
docker volume ls -q | xargs docker volume inspect | \
  grep -E "Name|Mountpoint"
```

---

## Advanced Scenarios

### Scenario: Multi-Stage Build Optimization

```dockerfile
# In Dockerfile:
FROM node:18 AS builder

WORKDIR /app
COPY pnpm-lock.yaml .
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:18-alpine
COPY --from=builder /app/dist /app/dist
```

### Scenario: Conditional Cache Clearing

```bash
#!/bin/bash
# smart-build.sh - Only clear necessary caches

if [[ -n $(git diff --name-only | grep -E "package.json|pnpm-lock.yaml") ]]; then
  echo "Dependencies changed, clearing node_modules"
  ./fresh_build.sh --pnpm
elif [[ -n $(git diff --name-only | grep "src/") ]]; then
  echo "Source changed, clearing dist only"
  rm -rf apps/*/dist
  pnpm build
else
  echo "No significant changes, skipping rebuild"
fi
```

### Scenario: Build Verification

```bash
#!/bin/bash
# verify-build.sh

echo "Checking for lingering caches..."
find apps -type d \( -name "dist" -o -name ".vite" -o -name ".turbo" \) | \
  grep -c . && echo "ERROR: Found cache directories" && exit 1

echo "Checking image freshness..."
docker images | grep dental | awk '{print $3, $6}'

echo "Checking service health..."
docker-compose ps | grep -q "healthy" && echo "All services healthy"

echo "Build verification complete!"
```

---

## Related Documentation

- **Quick Reference**: `./FRESH_BUILD_QUICK_REFERENCE.txt`
- **Full Guide**: `./FRESH_BUILD_GUIDE.md`
- **Cleanup Details**: `./CACHE_CLEANUP_CHECKLIST.md`
- **Main Script**: `./fresh_build.sh`

---

## Support & Escalation

### If Script Fails

1. Check error message (RED [ERROR] lines)
2. Review relevant troubleshooting section above
3. Try suggested solution
4. If still failing:
   - Check disk space and permissions
   - Verify Docker/pnpm installation
   - Try manual step-by-step
   - Check system logs: `journalctl -xe`

### Common Resolution Commands

```bash
# Nuclear option - complete system reset:
docker system prune -a --volumes
rm -rf ~/.pnpm-store
./fresh_build.sh --volumes --pnpm

# If services won't start:
docker-compose logs
docker-compose restart

# If dependencies broken:
pnpm install --verify
pnpm run typeorm migration:show

# If database broken:
./fresh_build.sh --volumes --seed
```

---

**Last Updated:** 2025-11-24
**Script Version:** 1.0
**Compatibility:** Linux, macOS, Windows (WSL2)
