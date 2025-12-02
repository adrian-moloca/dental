/**
 * DashboardSettings Component
 *
 * Settings panel for customizing dashboard layout and widget visibility.
 * Includes toggle switches for each widget and reset button.
 */

import { useState } from 'react';
import { Card, CardBody, Button } from '../../../components/ui-new';
import clsx from 'clsx';

interface DashboardSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  editMode: boolean;
  onToggleEditMode: () => void;
  widgetsList: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    category: string;
    visible: boolean;
  }>;
  onToggleWidget: (widgetId: string) => void;
  onShowAllWidgets: () => void;
  onResetLayout: () => void;
}

const CATEGORY_LABELS = {
  overview: 'Prezentare Generala',
  clinical: 'Clinica',
  operational: 'Operational',
  financial: 'Financiar',
};

export function DashboardSettings({
  isOpen,
  onClose,
  editMode,
  onToggleEditMode,
  widgetsList,
  onToggleWidget,
  onShowAllWidgets,
  onResetLayout,
}: DashboardSettingsProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const groupedWidgets = widgetsList.reduce(
    (acc, widget) => {
      const category = widget.category as keyof typeof CATEGORY_LABELS;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(widget);
      return acc;
    },
    {} as Record<string, typeof widgetsList>
  );

  const handleResetLayout = () => {
    onResetLayout();
    setShowResetConfirm(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="offcanvas-backdrop fade show"
        onClick={onClose}
        style={{ zIndex: 1040 }}
      ></div>

      {/* Settings Panel */}
      <div
        className={clsx('offcanvas offcanvas-end', { show: isOpen })}
        tabIndex={-1}
        style={{ width: 400, zIndex: 1045, visibility: 'visible' }}
        aria-labelledby="dashboardSettingsLabel"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title" id="dashboardSettingsLabel">
            <i className="ti ti-settings me-2"></i>
            Setari Dashboard
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Inchide"
          ></button>
        </div>

        <div className="offcanvas-body">
          {/* Edit Mode Toggle */}
          <Card className="mb-4">
            <CardBody>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="mb-1">Mod Editare</h6>
                  <small className="text-muted">
                    Activeaza pentru a reorganiza widget-urile
                  </small>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="editModeSwitch"
                    checked={editMode}
                    onChange={onToggleEditMode}
                  />
                </div>
              </div>

              {editMode && (
                <div className="alert alert-info mt-3 mb-0 small" role="alert">
                  <i className="ti ti-info-circle me-1"></i>
                  Trage si redimensioneaza widget-urile. Schimbarile sunt salvate automat.
                </div>
              )}
            </CardBody>
          </Card>

          {/* Widget Visibility */}
          <div className="mb-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="mb-0">Vizibilitate Widget-uri</h6>
              <Button size="sm" variant="link" onClick={onShowAllWidgets}>
                Arata Tot
              </Button>
            </div>

            {Object.entries(groupedWidgets).map(([category, widgets]) => (
              <div key={category} className="mb-3">
                <h6 className="text-muted small text-uppercase mb-2">
                  {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                </h6>
                <div className="list-group list-group-flush">
                  {widgets.map((widget) => (
                    <div
                      key={widget.id}
                      className="list-group-item border-0 px-0 py-2 d-flex align-items-center"
                    >
                      <div className="form-check form-switch flex-grow-1">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id={`widget-${widget.id}`}
                          checked={widget.visible}
                          onChange={() => onToggleWidget(widget.id)}
                        />
                        <label
                          className="form-check-label cursor-pointer"
                          htmlFor={`widget-${widget.id}`}
                        >
                          <div className="d-flex align-items-center">
                            <i className={`${widget.icon} me-2 fs-18`}></i>
                            <div>
                              <div className="fw-medium">{widget.title}</div>
                              <small className="text-muted">{widget.description}</small>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Reset Layout */}
          <Card className="border-danger">
            <CardBody>
              <h6 className="text-danger mb-2">
                <i className="ti ti-refresh me-2"></i>
                Reseteaza Layout
              </h6>
              <p className="text-muted small mb-3">
                Revino la configuratia implicita a dashboard-ului. Toate personalizarile vor fi
                pierdute.
              </p>

              {!showResetConfirm ? (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => setShowResetConfirm(true)}
                  className="w-100"
                >
                  Reseteaza la Implicit
                </Button>
              ) : (
                <div className="d-flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleResetLayout}
                    className="flex-grow-1"
                  >
                    <i className="ti ti-check me-1"></i>
                    Confirma
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-grow-1"
                  >
                    Anuleaza
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}

export default DashboardSettings;
