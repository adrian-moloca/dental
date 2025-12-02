/**
 * DashboardGrid Component
 *
 * Wrapper for react-grid-layout with responsive breakpoints and drag-drop functionality.
 * Provides a customizable grid layout for dashboard widgets.
 */

import { useMemo } from 'react';
import { Responsive, WidthProvider, type Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  layout: Layout[];
  onLayoutChange: (layout: Layout[]) => void;
  editMode: boolean;
  children: React.ReactNode;
}

// Responsive breakpoints (in pixels)
const BREAKPOINTS = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0,
};

// Columns for each breakpoint
const COLS = {
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
  xxs: 2,
};

export function DashboardGrid({ layout, onLayoutChange, editMode, children }: DashboardGridProps) {
  // Generate responsive layouts for all breakpoints
  const layouts = useMemo(() => {
    return {
      lg: layout,
      md: layout,
      sm: layout.map((item) => ({
        ...item,
        w: Math.min(item.w, COLS.sm),
      })),
      xs: layout.map((item) => ({
        ...item,
        w: COLS.xs,
      })),
      xxs: layout.map((item) => ({
        ...item,
        w: COLS.xxs,
      })),
    };
  }, [layout]);

  return (
    <ResponsiveGridLayout
      className="dashboard-grid"
      layouts={layouts}
      breakpoints={BREAKPOINTS}
      cols={COLS}
      rowHeight={80}
      margin={[16, 16]}
      containerPadding={[0, 0]}
      isDraggable={editMode}
      isResizable={editMode}
      compactType="vertical"
      preventCollision={false}
      useCSSTransforms={true}
      onLayoutChange={(currentLayout, allLayouts) => {
        // Only update if in edit mode and layout actually changed
        if (editMode) {
          onLayoutChange(allLayouts.lg || currentLayout);
        }
      }}
      draggableHandle={editMode ? '.widget-drag-handle' : undefined}
      resizeHandles={editMode ? ['se', 'sw', 'ne', 'nw'] : []}
    >
      {children}
    </ResponsiveGridLayout>
  );
}

export default DashboardGrid;
