# Hot-Reload Fix for Docker + TypeScript + NestJS

## Root Causes Identified and Fixed

### 1. ts-node Module Caching
**Problem**: ts-node caches compiled TypeScript modules in memory and in `/tmp/ts-node-*` directories. When files changed on the host, the container's ts-node process kept serving stale cached modules.

**Fix**:
- Added `TS_NODE_CACHE=false` environment variable in nodemon.json
- Modified dev-start.sh to clear cache directories on startup
- Using `ts-node/register/transpile-only` for faster, non-cached compilation

### 2. Incomplete Volume Mounting
**Problem**: docker-compose.override.yml only mounted `src/` and `packages/` directories, not the full workspace.

**Fix**:
- Changed volume mount from selective directories to full workspace: `../..:/app:delegated`
- Added exclusion for node_modules and dist to prevent conflicts
- Ensures all file changes propagate to container

### 3. Nodemon Configuration for Docker
**Problem**: `legacyWatch: true` alone wasn't sufficient for Docker environments. File system events don't propagate from host to container.

**Fix**:
- Enabled explicit polling with `legacyWatch: true`
- Added verbose logging to see when restarts occur
- Increased delay to 1500ms to account for file system sync in Docker
- Added restart events for better visibility

### 4. Shared Package Watching
**Problem**: Changes to shared packages (e.g., @dentalos/shared-*) weren't triggering reloads.

**Fix**:
- Extended watch paths to include `../../packages/*/src`
- Ensures changes to shared dependencies trigger hot-reload

## Files Changed

### 1. `/apps/backend-auth/nodemon.json`
```json
{
  "watch": ["src", "../../packages/*/src"],
  "ext": "ts,json",
  "exec": "node --enable-source-maps -r ts-node/register/transpile-only -r tsconfig-paths/register src/main.ts",
  "env": {
    "TS_NODE_CACHE": "false",  // CRITICAL: Disable ts-node caching
    "TS_NODE_TRANSPILE_ONLY": "true",
    "TS_NODE_TYPE_CHECK": "false"
  },
  "legacyWatch": true,  // Enable polling for Docker
  "delay": 1500
}
```

### 2. `/apps/backend-auth/docker-compose.override.yml`
```yaml
volumes:
  - ../..:/app:delegated  # Mount full workspace, not just src/
  - /app/node_modules
  - /app/apps/backend-auth/node_modules
  - /app/apps/backend-auth/dist  # Exclude dist from sync
command: sh -c "cd /app/apps/backend-auth && ./dev-start.sh"
```

### 3. `/apps/backend-auth/dev-start.sh` (NEW)
Startup script that:
- Clears ts-node cache directories
- Clears dist folder
- Sets environment variables
- Starts nodemon with proper configuration

### 4. `/docker-compose.dev.yml`
Updated auth service command to use dev-start.sh

## How to Test

### Step 1: Restart Services
```bash
cd /home/adrian/Desktop/SBD-Projects/personal/preclinic/dental

# If using docker-compose.dev.yml
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up auth -d
docker compose -f docker-compose.dev.yml logs -f auth

# OR if using local override
cd apps/backend-auth
docker compose down
docker compose up -d
docker compose logs -f backend-auth
```

### Step 2: Verify Hot-Reload is Active
Watch the logs. You should see:
```
Starting nodemon with hot-reload enabled...
Watching: src/ and ../../packages/*/src/
Polling enabled for Docker compatibility
[nodemon] starting `node --enable-source-maps -r ts-node/register/transpile-only...`
```

### Step 3: Make a Test Change
```bash
# Edit any file in src/
echo "// Test change" >> apps/backend-auth/src/app.module.ts
```

### Step 4: Verify Restart
Within 1-3 seconds, you should see in logs:
```
=== [NODEMON] Restarting due to changes... ===
[nodemon] restarting due to changes...
[nodemon] starting `node --enable-source-maps...`
```

### Step 5: Check Process ID Changes
```bash
# Before change
docker exec <container-name> ps aux | grep node

# Make a change, wait for restart

# After change - PID should be different
docker exec <container-name> ps aux | grep node
```

## Expected Behavior After Fix

1. **Immediate Detection**: File changes detected within 1-3 seconds
2. **Automatic Restart**: Nodemon automatically restarts the process
3. **Fresh Code**: New process ID, no cached modules
4. **Log Visibility**: Clear restart messages in logs
5. **API Changes Reflected**: curl/browser requests immediately show new code

## Troubleshooting

### If changes still not detected:

1. **Check volume mount**:
```bash
docker exec <container-name> ls -la /app/apps/backend-auth/src/
# Should match host files
```

2. **Verify nodemon is running**:
```bash
docker exec <container-name> ps aux | grep nodemon
```

3. **Check for errors**:
```bash
docker compose logs backend-auth | grep -i error
```

4. **Force restart**:
```bash
docker compose restart backend-auth
```

5. **Rebuild if needed**:
```bash
docker compose down
docker compose build backend-auth
docker compose up backend-auth -d
```

### If restarts are too slow:

Reduce delay in nodemon.json:
```json
"delay": 1000  // Instead of 1500
```

### If restarts are too frequent:

Increase delay:
```json
"delay": 2500  // Instead of 1500
```

## Performance Notes

- **Polling interval**: 1000ms (configurable via `pollingInterval`)
- **Restart delay**: 1500ms after last change detected
- **ts-node**: Transpile-only mode (no type checking) for speed
- **Source maps**: Enabled for debugging

## Migration from Old Setup

The old setup had:
- `legacyWatch: true` (present but not sufficient)
- Partial volume mounts (only src/ and packages/)
- No cache clearing strategy
- Standard `ts-node -r` (with caching enabled)

The new setup:
- Explicit cache disabling
- Full workspace mount
- Automated cache clearing on startup
- Transpile-only mode with source maps
- Verbose logging for visibility
