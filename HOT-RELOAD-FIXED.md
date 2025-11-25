# Hot-Reload Fix Summary

## Problem Identified
File changes on host were not triggering automatic rebuilds in Docker containers.

## Root Causes
1. **Named volume for node_modules** - Created isolation between host filesystem and container
2. **Missing polling configuration** - Docker volume file watchers unreliable without polling
3. **No nodemon config files** - Services using generic watch commands without proper file watching setup

## Changes Made

### 1. Volume Configuration (docker-compose.dev.yml)
**BEFORE:**
```yaml
volumes:
  - .:/workspace:delegated
  - pnpm-store:/pnpm/store
  - node_modules:/workspace/node_modules  # Named volume blocks hot-reload
```

**AFTER:**
```yaml
volumes:
  - .:/workspace:delegated
  - pnpm-store:/pnpm/store
  # Removed node_modules named volume - now uses host bind mount
```

### 2. Backend Services - Nodemon Configuration
Created `/apps/backend-*/nodemon.json` for all services:
```json
{
  "watch": ["src"],
  "ext": "ts,json",
  "ignore": ["src/**/*.spec.ts", "src/**/*.test.ts"],
  "exec": "ts-node -r tsconfig-paths/register src/main.ts",
  "legacyWatch": true,
  "delay": 1000
}
```

**Key settings:**
- `legacyWatch: true` - Uses polling for Docker volume compatibility
- `delay: 1000` - Debounces rapid file changes

### 3. Backend Service Commands
**BEFORE:**
```yaml
command: sh -c 'cd /workspace/apps/backend-auth && npm run ${DEBUG_MODE:-start:watch}'
```

**AFTER:**
```yaml
command: sh -c 'cd /workspace/apps/backend-auth && npx nodemon'
```

Applied to all backend services:
- auth
- patient
- scheduling
- enterprise
- billing
- inventory
- clinical
- provider-schedule
- subscription
- health-aggregator

### 4. Frontend - Vite Configuration
Updated `/apps/web-clinic-portal/vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,  // Enable polling for Docker
    },
    host: true,
    strictPort: true,
    port: 3001,
  },
})
```

## How to Apply Changes

### 1. Stop existing containers and remove old volume
```bash
docker compose -f docker-compose.dev.yml down -v
docker volume rm dentalos_node_modules 2>/dev/null || true
```

### 2. Start services with new configuration
```bash
docker compose -f docker-compose.dev.yml up -d
```

### 3. Verify hot-reload works
```bash
# Watch logs for a service
docker compose -f docker-compose.dev.yml logs -f auth

# In another terminal, edit a file
echo "// test change" >> apps/backend-auth/src/main.ts

# You should see nodemon detect the change and restart
```

## Testing
Run validation script:
```bash
./test-hot-reload.sh
```

## Expected Behavior
- **TypeScript changes** → Nodemon detects → Service restarts (1-2 seconds)
- **React/Vite changes** → HMR updates browser (instant)
- **No manual container restarts needed**

## Files Modified
- `/docker-compose.dev.yml` - Volume configuration and service commands
- `/apps/backend-*/nodemon.json` - Nodemon configs for all 10 backend services
- `/apps/web-clinic-portal/vite.config.ts` - Vite polling config
- `/test-hot-reload.sh` - Validation script (new)

## Comparison with smambu
The working smambu setup uses the same approach:
- Individual directory bind mounts (no named volumes for node_modules)
- Direct npm run dev commands that use file watchers
- All source code mounted from host to container

Our fix aligns with this proven pattern while adding explicit polling for better Docker compatibility.
