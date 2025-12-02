/**
 * Dashboard Page - Customizable Dashboard with Grid Layout
 *
 * Features:
 * - Draggable and resizable widgets using react-grid-layout
 * - Responsive breakpoints for different screen sizes
 * - Widget visibility toggles
 * - Edit mode for customization
 * - Auto-save preferences to backend
 * - Reset to default layout
 */

import { useState } from 'react';
import './dashboard.scss';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui-new';
import { useDashboardLayout } from './hooks/useDashboardLayout';
import { DashboardGrid } from './components/DashboardGrid';
import { DashboardSettings } from './components/DashboardSettings';
import {
  QuickStatsWidget,
  TodayAppointmentsWidget,
  RecentPatientsWidget,
  UpcomingAppointmentsWidget,
  TasksWidget,
  RevenueChartWidget,
  LowStockAlertsWidget,
  WaitlistWidget,
} from './components/widgets';

// Widget mapping
const WIDGET_COMPONENTS = {
  quickStats: QuickStatsWidget,
  todayAppointments: TodayAppointmentsWidget,
  recentPatients: RecentPatientsWidget,
  upcomingAppointments: UpcomingAppointmentsWidget,
  tasks: TasksWidget,
  revenueChart: RevenueChartWidget,
  lowStockAlerts: LowStockAlertsWidget,
  waitlist: WaitlistWidget,
};

export function Dashboard() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const {
    layout,
    editMode,
    widgetsList,
    isLoading,
    handleLayoutChange,
    toggleEditMode,
    toggleWidget,
    showAllWidgets,
    resetLayout,
  } = useDashboardLayout();

  return (
    <AppShell
      title="Dashboard"
      subtitle="Prezentare generala a clinicii"
      breadcrumbs={[
        { label: 'Acasa', path: '/' },
        { label: 'Dashboard' },
      ]}
      actions={
        <div className="d-flex gap-2">
          {editMode && (
            <Button variant="success" onClick={toggleEditMode}>
              <i className="ti ti-check me-2"></i>
              Salveaza
            </Button>
          )}
          <Button
            variant={editMode ? 'outline-secondary' : 'primary'}
            onClick={() => setSettingsOpen(true)}
          >
            <i className="ti ti-settings me-2"></i>
            Setari
          </Button>
        </div>
      }
    >
      {/* Loading State */}
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Se incarca...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Edit Mode Banner */}
          {editMode && (
            <div className="alert alert-info mb-4" role="alert">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <i className="ti ti-info-circle me-2"></i>
                  <strong>Mod Editare Activ:</strong> Trage widget-urile pentru a le reorganiza si
                  redimensioneaza dupa preferinte. Schimbarile sunt salvate automat.
                </div>
                <Button size="sm" variant="outline-primary" onClick={toggleEditMode}>
                  <i className="ti ti-x me-1"></i>
                  Iesire
                </Button>
              </div>
            </div>
          )}

          {/* Dashboard Grid */}
          <DashboardGrid
            layout={layout}
            onLayoutChange={handleLayoutChange}
            editMode={editMode}
          >
            {layout.map((item) => {
              const WidgetComponent = WIDGET_COMPONENTS[item.i as keyof typeof WIDGET_COMPONENTS];

              if (!WidgetComponent) {
                return (
                  <div key={item.i}>
                    <div className="card h-100 border-danger">
                      <div className="card-body d-flex align-items-center justify-content-center">
                        <div className="text-center text-danger">
                          <i className="ti ti-alert-triangle fs-48 mb-2"></i>
                          <p>Widget necunoscut: {item.i}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={item.i}>
                  <WidgetComponent editMode={editMode} />
                </div>
              );
            })}
          </DashboardGrid>

          {/* Empty State */}
          {layout.length === 0 && (
            <div className="text-center py-5">
              <i className="ti ti-layout-dashboard fs-64 text-muted mb-3 d-block"></i>
              <h4 className="text-muted mb-2">Niciun widget vizibil</h4>
              <p className="text-muted mb-4">
                Activeaza widget-uri din setari pentru a afisa informatii pe dashboard
              </p>
              <Button variant="primary" onClick={() => setSettingsOpen(true)}>
                <i className="ti ti-settings me-2"></i>
                Deschide Setari
              </Button>
            </div>
          )}
        </>
      )}

      {/* Settings Panel */}
      <DashboardSettings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        editMode={editMode}
        onToggleEditMode={toggleEditMode}
        widgetsList={widgetsList}
        onToggleWidget={toggleWidget}
        onShowAllWidgets={showAllWidgets}
        onResetLayout={resetLayout}
      />
    </AppShell>
  );
}

export default Dashboard;
