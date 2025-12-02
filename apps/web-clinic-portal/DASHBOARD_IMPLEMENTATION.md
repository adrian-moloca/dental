# Customizable Dashboard Implementation

## Overview

This document describes the implementation of a fully customizable dashboard for the web-clinic-portal application. The dashboard features draggable and resizable widgets, persistent user preferences, and responsive design.

## Features Implemented

### 1. Grid Layout System (react-grid-layout)
- **Draggable sections**: Users can drag widgets to reposition them
- **Resizable sections**: Widgets can be resized in both width and height
- **Responsive breakpoints**:
  - `lg`: 1200px (12 columns)
  - `md`: 996px (10 columns)
  - `sm`: 768px (6 columns)
  - `xs`: 480px (4 columns)
  - `xxs`: 0px (2 columns)

### 2. Dashboard Widgets (8 Total)

#### QuickStatsWidget
- Displays key metrics: total patients, appointments today, completed appointments
- Shows pending and in-progress counts
- Real-time data from API

#### TodayAppointmentsWidget
- Lists today's appointments with time, patient name, and status
- Status badges (pending, confirmed, checked-in, in-progress, completed, cancelled)
- Clickable links to appointment details
- Shows up to 8 appointments with "view all" option

#### RecentPatientsWidget
- Shows recently added patients
- Displays patient avatar, name, phone
- Links to patient detail pages
- Real-time data from patient search API

#### UpcomingAppointmentsWidget
- Calendar view for next 7 days
- Groups appointments by date
- Highlights today with special badge
- Shows appointment count per day
- Lists up to 3 appointments per day

#### TasksWidget
- Pending tasks and reminders (mock data currently)
- Priority levels: high (urgent), medium, low
- Checkbox interface for task completion
- Due date display

#### RevenueChartWidget
- ApexCharts line chart for monthly revenue
- Shows total annual, average monthly, and growth rate
- Smooth gradient fill
- Interactive tooltips

#### LowStockAlertsWidget
- Inventory items with low stock levels
- Critical stock indicators (out of stock)
- Progress bars showing stock levels
- Quick reorder button
- Links to inventory page

#### WaitlistWidget
- Patients waiting for appointments (mock data currently)
- Priority badges
- Wait time calculation
- Quick schedule button

### 3. Settings Panel

The settings panel provides comprehensive dashboard customization:

#### Edit Mode Toggle
- Enable/disable drag-and-drop functionality
- Visual indicator when edit mode is active
- Instructions overlay

#### Widget Visibility Management
- Toggle individual widgets on/off
- Organized by category:
  - Overview (QuickStats)
  - Clinical (TodayAppointments, UpcomingAppointments, RecentPatients)
  - Operational (Tasks, Waitlist, LowStockAlerts)
  - Financial (RevenueChart)
- "Show All" button to enable all widgets

#### Reset Layout
- Restore default dashboard configuration
- Confirmation step to prevent accidental resets
- Resets all customizations (layout, visibility, edit mode)

### 4. Persistence Layer

#### User Preferences API
**File**: `src/api/preferencesClient.ts`

Endpoints:
- `GET /users/me/preferences` - Fetch user preferences
- `PATCH /users/me/preferences` - Update preferences (partial)
- `DELETE /users/me/preferences` - Reset to defaults

Data structure:
```typescript
{
  dashboard: {
    layout: Layout[],        // Grid positions and sizes
    hiddenWidgets: string[], // Widget IDs to hide
    editMode: boolean        // Edit mode state
  }
}
```

#### Auto-save Hook
**File**: `src/hooks/useUserPreferences.ts`

Features:
- 1-second debounce for auto-save
- Optimistic updates for instant UI feedback
- Automatic error rollback
- React Query integration for caching
- Separate immediate save option for critical actions

### 5. Layout Management Hook
**File**: `src/pages/Dashboard/hooks/useDashboardLayout.ts`

Responsibilities:
- Manage layout state (positions, sizes)
- Handle widget visibility
- Control edit mode
- Integrate with user preferences
- Provide widget metadata

Default layout configuration:
- QuickStats: Full width (12 cols), height 2
- TodayAppointments: Half width (6 cols), height 4
- UpcomingAppointments: Half width (6 cols), height 4
- RecentPatients: Third width (4 cols), height 3
- Tasks: Third width (4 cols), height 3
- Waitlist: Third width (4 cols), height 3
- RevenueChart: Two-thirds width (8 cols), height 4
- LowStockAlerts: Third width (4 cols), height 4

### 6. Menu Integration

The dashboard page uses the existing `AppShell` component which includes:
- Collapsible sidebar navigation
- Header with user menu
- Breadcrumbs
- Page title and actions
- Skip navigation link (accessibility)

## File Structure

```
apps/web-clinic-portal/src/
├── api/
│   └── preferencesClient.ts           # User preferences API client
├── hooks/
│   └── useUserPreferences.ts          # Preferences hook with auto-save
├── pages/
│   └── Dashboard/
│       ├── Dashboard.tsx              # Main dashboard page
│       ├── dashboard.scss             # Dashboard-specific styles
│       ├── components/
│       │   ├── DashboardGrid.tsx      # Grid layout wrapper
│       │   ├── DashboardSettings.tsx  # Settings panel
│       │   └── widgets/
│       │       ├── index.ts
│       │       ├── WidgetWrapper.tsx
│       │       ├── QuickStatsWidget.tsx
│       │       ├── TodayAppointmentsWidget.tsx
│       │       ├── RecentPatientsWidget.tsx
│       │       ├── UpcomingAppointmentsWidget.tsx
│       │       ├── TasksWidget.tsx
│       │       ├── RevenueChartWidget.tsx
│       │       ├── LowStockAlertsWidget.tsx
│       │       └── WaitlistWidget.tsx
│       └── hooks/
│           └── useDashboardLayout.ts  # Layout state management
└── App.tsx                            # Updated to use new Dashboard
```

## Dependencies Added

```json
{
  "dependencies": {
    "react-grid-layout": "^1.4.4"
  },
  "devDependencies": {
    "@types/react-grid-layout": "^1.3.5"
  }
}
```

## Installation & Setup

1. **Install dependencies** (if not already done):
   ```bash
   pnpm install
   ```

2. **Run the development server**:
   ```bash
   pnpm dev
   ```

3. **Navigate to dashboard**:
   Open browser to `http://localhost:5173/dashboard`

## Usage Guide

### For End Users

1. **View Dashboard**: Navigate to `/dashboard` to see the default layout
2. **Customize Layout**:
   - Click "Setari" button in top-right
   - Toggle "Mod Editare" switch
   - Drag widgets to reposition
   - Resize widgets using corner handles
   - Click "Salveaza" when done
3. **Toggle Widgets**:
   - Open settings panel
   - Toggle switches to show/hide widgets
   - Changes save automatically
4. **Reset Layout**:
   - Open settings panel
   - Scroll to "Reseteaza Layout" section
   - Click "Reseteaza la Implicit"
   - Confirm action

### For Developers

#### Adding a New Widget

1. **Create widget component** in `src/pages/Dashboard/components/widgets/`:
   ```typescript
   export function MyWidget({ editMode = false }: { editMode?: boolean }) {
     return (
       <WidgetWrapper
         id="myWidget"
         title="My Widget"
         icon="ti ti-icon"
         editMode={editMode}
       >
         {/* Widget content */}
       </WidgetWrapper>
     );
   }
   ```

2. **Add to widget metadata** in `useDashboardLayout.ts`:
   ```typescript
   export const WIDGET_METADATA: Record<string, WidgetMetadata> = {
     // ... existing widgets
     myWidget: {
       id: 'myWidget',
       title: 'My Widget',
       description: 'Description of my widget',
       icon: 'ti ti-icon',
       category: 'operational',
     },
   };
   ```

3. **Add to default layout**:
   ```typescript
   const DEFAULT_LAYOUT: Layout[] = [
     // ... existing widgets
     { i: 'myWidget', x: 0, y: 10, w: 6, h: 3, minW: 4, minH: 2 },
   ];
   ```

4. **Register in Dashboard.tsx**:
   ```typescript
   import { MyWidget } from './components/widgets';

   const WIDGET_COMPONENTS = {
     // ... existing widgets
     myWidget: MyWidget,
   };
   ```

5. **Export from widgets index**:
   ```typescript
   export { MyWidget } from './MyWidget';
   ```

#### Customizing Grid Breakpoints

Edit `DashboardGrid.tsx`:
```typescript
const BREAKPOINTS = {
  lg: 1200,   // Large screens
  md: 996,    // Medium screens
  sm: 768,    // Small screens
  xs: 480,    // Extra small
  xxs: 0,     // Mobile
};

const COLS = {
  lg: 12,     // 12 columns on large
  md: 10,     // 10 columns on medium
  sm: 6,      // 6 columns on small
  xs: 4,      // 4 columns on extra small
  xxs: 2,     // 2 columns on mobile
};
```

#### Customizing Auto-save Behavior

Edit `useUserPreferences.ts`:
```typescript
const DEBOUNCE_DELAY = 1000; // Change delay in milliseconds
```

## Styling & Theming

### Dark Mode Support
The dashboard automatically adapts to dark mode preferences:
- Card backgrounds adjust
- Scrollbar colors change
- Border colors adapt
- Chart colors remain consistent

### Custom Styling
Add custom styles in `dashboard.scss`:
```scss
.dashboard-widget {
  .my-custom-class {
    // Your styles
  }
}
```

### Widget Specific Styles
Each widget can have its own styles. Common classes:
- `.stats-item` - Stats cards with hover effects
- `.upcoming-calendar` - Calendar day items
- `.widget-drag-handle` - Drag handle cursor
- `.react-grid-item` - Grid item wrapper

## Accessibility Features

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **ARIA Labels**: Proper labeling for screen readers
- **Skip Links**: Quick navigation to main content
- **Focus Management**: Visible focus indicators
- **Color Contrast**: WCAG 2.2 AA compliant colors
- **Semantic HTML**: Proper heading hierarchy and landmarks

## Performance Optimizations

1. **Debounced Auto-save**: Prevents excessive API calls (1-second delay)
2. **Optimistic Updates**: Instant UI feedback before server confirmation
3. **React Query Caching**: Reduces redundant API calls
4. **Code Splitting**: Lazy loading for heavy components
5. **Memoization**: useMemo for expensive calculations
6. **CSS Transitions**: Hardware-accelerated animations

## Known Limitations & Future Enhancements

### Current Limitations
1. TasksWidget and WaitlistWidget use mock data (API integration pending)
2. RevenueChart uses static data (needs real financial API)
3. No widget-specific settings (e.g., date range for charts)
4. No drag-drop between different pages

### Planned Enhancements
1. **Widget Configuration**: Per-widget settings (date ranges, filters)
2. **Widget Presets**: Save/load multiple layout configurations
3. **Export/Import**: Share layouts between users
4. **Widget Marketplace**: Add custom community widgets
5. **Real-time Updates**: WebSocket integration for live data
6. **Mobile Gestures**: Touch-optimized drag-drop on mobile
7. **Widget Search**: Quick find and add widgets
8. **Advanced Filters**: Per-widget data filtering

## Troubleshooting

### Dashboard Not Loading
- Check browser console for errors
- Verify API endpoint `/users/me/preferences` is accessible
- Ensure React Query is properly configured

### Layout Not Saving
- Check network tab for failed PATCH requests
- Verify authentication token is valid
- Check browser console for debounce errors

### Widgets Not Dragging
- Ensure edit mode is enabled
- Check for CSS conflicts with `cursor: move`
- Verify react-grid-layout CSS is loaded

### Dark Mode Issues
- Check CSS variables are defined
- Verify `prefers-color-scheme` media query
- Test with browser dev tools theme toggle

## Testing Checklist

- [ ] Dashboard loads with default layout
- [ ] Can drag widgets in edit mode
- [ ] Can resize widgets with corner handles
- [ ] Layout persists after page reload
- [ ] Settings panel opens/closes correctly
- [ ] Can toggle widget visibility
- [ ] Can toggle edit mode
- [ ] Reset layout restores defaults
- [ ] Auto-save debounces correctly (1 second)
- [ ] Optimistic updates work instantly
- [ ] Error handling rolls back changes
- [ ] Responsive breakpoints adjust layout
- [ ] Dark mode styles apply correctly
- [ ] All widgets load data successfully
- [ ] Links navigate to correct pages
- [ ] Accessibility features work (keyboard, screen reader)
- [ ] Browser console has no errors

## Support & Maintenance

For issues or questions:
1. Check this documentation first
2. Review browser console errors
3. Check network requests in dev tools
4. Verify API endpoints are responding
5. Test with React Query DevTools

## Changelog

### Version 1.0.0 (2025-12-01)
- Initial implementation
- 8 dashboard widgets
- react-grid-layout integration
- User preferences persistence
- Settings panel with edit mode
- Responsive design
- Dark mode support
- Accessibility features
