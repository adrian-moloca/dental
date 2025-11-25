# Frontend Cache Troubleshooting

## Problem: Code Changes Not Appearing

When you change frontend code but don't see updates after restarting Docker, use this guide.

## Quick Fix (Most Common)

```bash
# Method 1: Use the --clean flag
./launch_docker.sh down
./launch_docker.sh dev --clean

# Method 2: Use the dedicated script
./clear-frontend-cache.sh
./launch_docker.sh dev
```

Then in your browser:
- **Hard Refresh**: `Ctrl+Shift+R` (Linux/Windows) or `Cmd+Shift+R` (Mac)
- Check the **DevTools widget** (bottom-right corner) to verify new build time

## How to Verify Code Reloaded

### 1. DevTools Widget (Easiest)
Look at the bottom-right corner of the web app:
- Green dot + recent time = fresh build
- Shows HMR status (should be "connected")
- Shows number of hot updates received

### 2. Docker Logs
```bash
docker compose -f docker-compose.dev.yml logs web
```
Look for:
```
=== VITE DEV SERVER STARTING ===
Time: [timestamp]
================================
```

### 3. Browser Dev Console
Check for Vite HMR messages:
```
[vite] connected.
[vite] hot updated: /src/App.tsx
```

## Root Causes Fixed

### 1. Vite Cache in Mounted Volume
**Problem**: Vite cached in `node_modules/.vite` which was mounted from host
**Fix**:
- Excluded `node_modules/.vite` from volume mount
- Set `cacheDir: '/tmp/vite-cache'` in vite.config.ts
- Added `optimizeDeps.force: true` to bypass cache

### 2. Stale dist/ Directory
**Problem**: Old build artifacts in `dist/` being served
**Fix**: Excluded `dist/` directory from volume mount

### 3. Browser Cache
**Problem**: Browser caching old JavaScript bundles
**Fix**:
- Added `__BUILD_TIME__` constant for cache busting
- DevTools widget shows build time
- Instructions to hard refresh

### 4. No Visual Feedback
**Problem**: No way to know if code actually reloaded
**Fix**:
- DevTools widget with build time and HMR status
- Startup logs in Docker container
- Console logs for HMR events

## Troubleshooting Steps

### Step 1: Clear All Caches
```bash
./launch_docker.sh dev --clean
```

### Step 2: Check DevTools Widget
- Should appear in bottom-right corner
- Build time should be recent (green dot)
- HMR should show "connected" with green pulsing dot

### Step 3: Test Hot Reload
1. Make a small change to any `.tsx` file (add a comment)
2. Save the file
3. Watch DevTools widget - "Updates" counter should increment
4. Check console for: `[HMR] 🔥 Hot module update received`

### Step 4: Check Docker Logs
```bash
docker compose -f docker-compose.dev.yml logs -f web
```
Should see:
```
=== VITE DEV SERVER STARTING ===
Time: 2025-11-24T...
```

### Step 5: Verify Volume Mounts
```bash
docker inspect dentalos-web-1 | grep -A 20 "Mounts"
```
Should NOT see:
- `/workspace/apps/web-clinic-portal/dist`
- `/workspace/apps/web-clinic-portal/node_modules/.vite`

## Advanced Troubleshooting

### Complete Nuclear Option
```bash
# Stop everything
./launch_docker.sh down

# Clear all caches
rm -rf apps/web-clinic-portal/dist
rm -rf apps/web-clinic-portal/node_modules/.vite
rm -rf apps/web-clinic-portal/.vite

# Remove web container
docker compose -f docker-compose.dev.yml rm -f web

# Clear Docker cache volume
docker run --rm -v "$(pwd)":/workspace alpine sh -c 'rm -rf /tmp/vite-cache'

# Clear browser cache completely
# Chrome: Ctrl+Shift+Delete > Clear all time
# Firefox: Ctrl+Shift+Delete > Everything

# Restart fresh
./launch_docker.sh dev --clean
```

### Check Vite Config
File: `apps/web-clinic-portal/vite.config.ts`

Should have:
```typescript
export default defineConfig({
  // Force cache bypass
  optimizeDeps: {
    force: true,
  },
  // Store cache outside mounted volume
  cacheDir: '/tmp/vite-cache',
  // Build timestamp for verification
  define: {
    '__BUILD_TIME__': JSON.stringify(new Date().toISOString()),
  },
})
```

### Check Docker Compose
File: `docker-compose.dev.yml`

Web service should have:
```yaml
web:
  volumes:
    - .:/workspace:delegated
    - pnpm-store:/pnpm/store
    # Exclude these from mount:
    - /workspace/apps/web-clinic-portal/dist
    - /workspace/apps/web-clinic-portal/node_modules/.vite
```

## Prevention

### Always Use --clean When Unsure
```bash
./launch_docker.sh dev --clean
```
Small overhead, guaranteed fresh start.

### Watch DevTools Widget
Keep it visible during development to instantly see:
- When builds happen
- HMR connection status
- Update counts

### Use Browser Hard Refresh
After any Docker restart or major code change:
- `Ctrl+Shift+R` (Linux/Windows)
- `Cmd+Shift+R` (Mac)

### Check Docker Logs
If something feels off:
```bash
docker compose -f docker-compose.dev.yml logs web | tail -50
```

## Files Changed

### New Files
- `apps/web-clinic-portal/src/components/DevTools.tsx` - Visual indicator
- `apps/web-clinic-portal/src/vite-env.d.ts` - Type definitions
- `apps/web-clinic-portal/vite-startup-log.js` - Startup logging
- `clear-frontend-cache.sh` - Quick cache clear script
- `FRONTEND_CACHE_TROUBLESHOOTING.md` - This file

### Modified Files
- `apps/web-clinic-portal/vite.config.ts` - Cache config
- `apps/web-clinic-portal/package.json` - Startup script
- `apps/web-clinic-portal/src/App.tsx` - Added DevTools
- `docker-compose.dev.yml` - Volume exclusions
- `launch_docker.sh` - Added --clean flag

## Scripts Reference

### Clear Cache Script
```bash
./clear-frontend-cache.sh
```
Clears all frontend caches and removes web container.

### Launch with Clean
```bash
./launch_docker.sh dev --clean
```
Starts services with cache clearing.

### Manual Cache Clear
```bash
# Local
rm -rf apps/web-clinic-portal/dist
rm -rf apps/web-clinic-portal/node_modules/.vite

# Docker
docker run --rm -v "$(pwd)":/workspace alpine sh -c 'rm -rf /tmp/vite-cache'
```

## Support

If issues persist after following this guide:

1. Check Docker logs for errors
2. Verify file permissions (especially on Linux)
3. Ensure sufficient disk space for Docker
4. Try complete reinstall: `./launch_docker.sh --install`

## Technical Details

### Cache Locations
- **Vite Cache**: `/tmp/vite-cache` (inside container, not mounted)
- **Build Output**: `dist/` (excluded from mount)
- **Node Modules Cache**: `node_modules/.vite` (excluded from mount)

### Volume Strategy
- Mount source code: ✅ Enables hot reload
- Exclude dist: ✅ Prevents stale builds
- Exclude .vite: ✅ Prevents cache conflicts
- Shared pnpm-store: ✅ Faster installs

### HMR (Hot Module Replacement)
Vite's HMR works by:
1. Watching files in mounted volume
2. Detecting changes via filesystem events
3. Sending updates via WebSocket
4. Patching modules in browser without full reload

DevTools widget monitors this WebSocket connection.
