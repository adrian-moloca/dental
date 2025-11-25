# HMR Status Indicator Component

## Overview

The enhanced DevTools component provides real-time visual feedback for development with:
- HMR (Hot Module Reload) connection status
- Last code reload timestamp
- Build time verification
- Recent reload history
- Quick action buttons

## Features

### 1. HMR Connection Status Display
Four distinct states with visual indicators:

- **Connected** (Green): Active HMR connection, ready for hot reloads
- **Updating** (Blue): Hot reload in progress with ping animation
- **Connecting** (Yellow): Attempting to establish connection
- **Disconnected** (Red): No HMR connection with auto-retry logic

### 2. Timestamp Tracking
- **Last Reload**: Displays elapsed time in human-readable format (seconds, minutes, hours)
- **Build Time**: Shows exact timestamp of current build
- **Mode Indicator**: Confirms development mode is active

### 3. Recent Reload History
- Tracks last 5 reload events
- Shows reload type and timestamp
- Visual hierarchy with bullet (●) for most recent, circles (○) for older

### 4. Visual Design
- Positioned in bottom-right corner
- Gradient backgrounds matching status
- Backdrop blur for modern appearance
- Collapsible to compact indicator pill
- Animated status dots with pulse/ping effects

### 5. Quick Actions
- **Hard Reload**: Full browser reload (Ctrl+Shift+R)
- **Clear Storage**: Clears localStorage/sessionStorage and reloads
- Cache location display

## State Transitions

```
Initial: connecting
    ↓
    └─→ connected (if HMR available)
            ├─→ updating (on hot reload)
            │   └─→ connected (reload complete)
            └─→ disconnected (on error/disconnect)
                └─→ connecting (auto-retry, max 3 attempts)
```

## Visual Indicators

### Status Dot Animation
- **Connected**: Subtle pulse animation
- **Updating**: Ping animation with white halo
- **Connecting**: Pulse animation while retrying
- **Disconnected**: Static, no animation

### Color Scheme
- Green/Emerald: Active, functional
- Blue/Cyan: Processing, transitional
- Yellow/Orange: Warning, retrying
- Red/Rose: Error, disconnected

## Integration Points

### Vite Configuration
Already configured in `vite.config.ts`:
```typescript
hmr: {
  host: 'localhost',
  port: 5173,
  protocol: 'ws',
  overlay: {
    errors: true,
    warnings: true,
  },
}
```

### Build Time Injection
Set in vite.config.ts:
```typescript
'__BUILD_TIME__': JSON.stringify(new Date().toISOString())
```

## Development Workflow

1. Component renders only in development mode (`import.meta.env.MODE === 'development'`)
2. Auto-connects to Vite HMR server on component mount
3. Tracks all hot reload events
4. Auto-retries connection up to 3 times on disconnect
5. Cleanup on unmount

## Auto-Retry Logic

- Maximum 3 retry attempts after disconnect
- 2-second delay between retry attempts
- Resets retry counter on successful connection
- Can manually trigger reload via buttons

## Responsive Behavior

### Expanded View (Default)
- Full information panel
- Status details and history
- Action buttons
- Located: bottom-right corner

### Collapsed View (When Hidden)
- Compact pill-shaped button
- Shows current status color
- Hover reveals status name
- Click to expand

## Edge Cases Handled

- HMR unavailable: Shows "disconnected" state
- Connection losses: Auto-retry with visual feedback
- Build time undefined: Shows "Unknown"
- No recent reloads: Hides reload history section
- Long-running development: Relative time formatting updates

## Browser Compatibility

- Requires modern CSS (backdrop-filter, gradients)
- WebSocket support for HMR
- ES2020+ JavaScript features
- Tested on Chrome/Edge/Firefox/Safari (latest versions)

## Performance

- Minimal runtime overhead (useState, useRef, useEffect only)
- No external dependencies beyond React
- Cleanup of timeouts on unmount
- Non-blocking animations (use transform/opacity)

## Accessibility

- Semantic HTML
- Clear status labels
- Title attributes on interactive elements
- Keyboard accessible buttons
- Visual indicators supplemented with text

## Customization

To adjust positioning:
- Change `bottom-4 right-4` classes for position
- Modify `z-50` for stacking order

To adjust colors:
- Edit `statusConfig` object
- Gradient colors in `bg-gradient-to-br` class
- Dot colors in `dotColor` field

## Production Behavior

Component returns `null` when `import.meta.env.MODE !== 'development'`, ensuring zero overhead in production builds.
