/**
 * useDashboardLayout Hook
 *
 * Manages dashboard layout state, widget visibility, and edit mode.
 * Integrates with user preferences for persistence.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useUserPreferences } from '../../../hooks/useUserPreferences';
import type { Layout } from 'react-grid-layout';

// Default layout configuration for dashboard widgets
const DEFAULT_LAYOUT: Layout[] = [
  { i: 'quickStats', x: 0, y: 0, w: 12, h: 2, minW: 6, minH: 2 },
  { i: 'todayAppointments', x: 0, y: 2, w: 6, h: 4, minW: 4, minH: 3 },
  { i: 'upcomingAppointments', x: 6, y: 2, w: 6, h: 4, minW: 4, minH: 3 },
  { i: 'recentPatients', x: 0, y: 6, w: 4, h: 3, minW: 3, minH: 2 },
  { i: 'tasks', x: 4, y: 6, w: 4, h: 3, minW: 3, minH: 2 },
  { i: 'waitlist', x: 8, y: 6, w: 4, h: 3, minW: 3, minH: 2 },
  { i: 'revenueChart', x: 0, y: 9, w: 8, h: 4, minW: 6, minH: 3 },
  { i: 'lowStockAlerts', x: 8, y: 9, w: 4, h: 4, minW: 3, minH: 3 },
];

// Widget metadata
export interface WidgetMetadata {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'overview' | 'clinical' | 'operational' | 'financial';
}

export const WIDGET_METADATA: Record<string, WidgetMetadata> = {
  quickStats: {
    id: 'quickStats',
    title: 'Statistici Rapide',
    description: 'Metrici cheie pentru clinica',
    icon: 'ti ti-chart-bar',
    category: 'overview',
  },
  todayAppointments: {
    id: 'todayAppointments',
    title: 'Programari Astazi',
    description: 'Programarile de azi cu statusuri',
    icon: 'ti ti-calendar-event',
    category: 'clinical',
  },
  upcomingAppointments: {
    id: 'upcomingAppointments',
    title: 'Programari Viitoare',
    description: 'Calendar urmatorele 7 zile',
    icon: 'ti ti-calendar',
    category: 'clinical',
  },
  recentPatients: {
    id: 'recentPatients',
    title: 'Pacienti Recenti',
    description: 'Ultimii pacienti vizualizati/adaugati',
    icon: 'ti ti-users',
    category: 'clinical',
  },
  tasks: {
    id: 'tasks',
    title: 'Sarcini & Reminder-uri',
    description: 'Sarcini pendente si reminder-uri',
    icon: 'ti ti-checkbox',
    category: 'operational',
  },
  waitlist: {
    id: 'waitlist',
    title: 'Lista de Asteptare',
    description: 'Pacienti in asteptare',
    icon: 'ti ti-hourglass',
    category: 'operational',
  },
  revenueChart: {
    id: 'revenueChart',
    title: 'Venituri',
    description: 'Grafic venituri lunare',
    icon: 'ti ti-chart-line',
    category: 'financial',
  },
  lowStockAlerts: {
    id: 'lowStockAlerts',
    title: 'Alerte Stoc',
    description: 'Produse cu stoc scazut',
    icon: 'ti ti-alert-triangle',
    category: 'operational',
  },
};

export function useDashboardLayout() {
  const {
    dashboardPreferences,
    updateDashboardPreferences,
    isLoading: preferencesLoading,
  } = useUserPreferences();

  // Layout state
  const [layout, setLayout] = useState<Layout[]>(DEFAULT_LAYOUT);
  const [editMode, setEditMode] = useState(false);
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>([]);

  // Initialize from preferences
  useEffect(() => {
    if (dashboardPreferences.layout && dashboardPreferences.layout.length > 0) {
      setLayout(dashboardPreferences.layout);
    }
    if (dashboardPreferences.hiddenWidgets) {
      setHiddenWidgets(dashboardPreferences.hiddenWidgets);
    }
    if (dashboardPreferences.editMode !== undefined) {
      setEditMode(dashboardPreferences.editMode);
    }
  }, [dashboardPreferences]);

  /**
   * Handle layout change from react-grid-layout
   */
  const handleLayoutChange = useCallback(
    (newLayout: Layout[]) => {
      setLayout(newLayout);

      // Auto-save layout to preferences (debounced)
      updateDashboardPreferences({
        layout: newLayout,
      });
    },
    [updateDashboardPreferences]
  );

  /**
   * Toggle edit mode
   */
  const toggleEditMode = useCallback(() => {
    const newEditMode = !editMode;
    setEditMode(newEditMode);

    // Save immediately
    updateDashboardPreferences(
      {
        editMode: newEditMode,
      },
      { immediate: true }
    );
  }, [editMode, updateDashboardPreferences]);

  /**
   * Toggle widget visibility
   */
  const toggleWidget = useCallback(
    (widgetId: string) => {
      const newHiddenWidgets = hiddenWidgets.includes(widgetId)
        ? hiddenWidgets.filter((id) => id !== widgetId)
        : [...hiddenWidgets, widgetId];

      setHiddenWidgets(newHiddenWidgets);

      // Save immediately
      updateDashboardPreferences(
        {
          hiddenWidgets: newHiddenWidgets,
        },
        { immediate: true }
      );
    },
    [hiddenWidgets, updateDashboardPreferences]
  );

  /**
   * Show all widgets
   */
  const showAllWidgets = useCallback(() => {
    setHiddenWidgets([]);
    updateDashboardPreferences(
      {
        hiddenWidgets: [],
      },
      { immediate: true }
    );
  }, [updateDashboardPreferences]);

  /**
   * Reset layout to default
   */
  const resetLayout = useCallback(() => {
    setLayout(DEFAULT_LAYOUT);
    setHiddenWidgets([]);
    setEditMode(false);

    // Save immediately
    updateDashboardPreferences(
      {
        layout: DEFAULT_LAYOUT,
        hiddenWidgets: [],
        editMode: false,
      },
      { immediate: true }
    );
  }, [updateDashboardPreferences]);

  /**
   * Get visible layout (excluding hidden widgets)
   */
  const visibleLayout = useMemo(() => {
    return layout.filter((item) => !hiddenWidgets.includes(item.i));
  }, [layout, hiddenWidgets]);

  /**
   * Get widget metadata with visibility status
   */
  const widgetsList = useMemo(() => {
    return Object.values(WIDGET_METADATA).map((widget) => ({
      ...widget,
      visible: !hiddenWidgets.includes(widget.id),
    }));
  }, [hiddenWidgets]);

  /**
   * Group widgets by category
   */
  const widgetsByCategory = useMemo(() => {
    return widgetsList.reduce(
      (acc, widget) => {
        if (!acc[widget.category]) {
          acc[widget.category] = [];
        }
        acc[widget.category].push(widget);
        return acc;
      },
      {} as Record<string, Array<typeof widgetsList[0]>>
    );
  }, [widgetsList]);

  return {
    layout: visibleLayout,
    allLayout: layout,
    editMode,
    hiddenWidgets,
    widgetsList,
    widgetsByCategory,
    isLoading: preferencesLoading,
    handleLayoutChange,
    toggleEditMode,
    toggleWidget,
    showAllWidgets,
    resetLayout,
  };
}
