/**
 * Quick Actions Toolbar - Common clinical procedures toolbar
 *
 * Provides one-click access to frequently performed dental procedures
 * with customizable actions and keyboard shortcuts.
 */

import { useState } from 'react';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
  color?: string;
  onClick: () => void;
}

interface QuickActionsToolbarProps {
  onAddExam?: () => void;
  onAddCleaning?: () => void;
  onAddFilling?: () => void;
  onAddExtraction?: () => void;
  onAddRootCanal?: () => void;
  onAddCrown?: () => void;
  onAddXray?: () => void;
  onAddNote?: () => void;
  customActions?: QuickAction[];
  compact?: boolean;
}

export function QuickActionsToolbar({
  onAddExam,
  onAddCleaning,
  onAddFilling,
  onAddExtraction,
  onAddRootCanal,
  onAddCrown,
  onAddXray,
  onAddNote,
  customActions = [],
  compact = false,
}: QuickActionsToolbarProps) {
  const [showCustomize, setShowCustomize] = useState(false);

  const defaultActions: QuickAction[] = [
    {
      id: 'exam',
      label: 'Examinare',
      icon: 'ti-stethoscope',
      shortcut: 'Shift+E',
      color: 'primary',
      onClick: () => onAddExam?.(),
    },
    {
      id: 'cleaning',
      label: 'Detartraj',
      icon: 'ti-brush',
      shortcut: 'Shift+C',
      color: 'info',
      onClick: () => onAddCleaning?.(),
    },
    {
      id: 'filling',
      label: 'Plomba',
      icon: 'ti-droplet-filled',
      shortcut: 'Shift+F',
      color: 'success',
      onClick: () => onAddFilling?.(),
    },
    {
      id: 'extraction',
      label: 'Extractie',
      icon: 'ti-dental-broken',
      shortcut: 'Shift+X',
      color: 'danger',
      onClick: () => onAddExtraction?.(),
    },
    {
      id: 'root_canal',
      label: 'Canal Radicular',
      icon: 'ti-dental',
      shortcut: 'Shift+R',
      color: 'warning',
      onClick: () => onAddRootCanal?.(),
    },
    {
      id: 'crown',
      label: 'Coroana',
      icon: 'ti-crown',
      shortcut: 'Shift+W',
      color: 'purple',
      onClick: () => onAddCrown?.(),
    },
    {
      id: 'xray',
      label: 'Radiografie',
      icon: 'ti-radiation',
      shortcut: 'Shift+I',
      color: 'secondary',
      onClick: () => onAddXray?.(),
    },
    {
      id: 'note',
      label: 'Nota Rapida',
      icon: 'ti-note',
      shortcut: 'Shift+N',
      color: 'dark',
      onClick: () => onAddNote?.(),
    },
  ];

  const allActions = [...defaultActions, ...customActions];

  return (
    <div className="quick-actions-toolbar">
      <div className="card border-0 shadow-sm">
        <div className="card-body p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2">
              <i className="ti ti-bolt text-warning fs-5" aria-hidden="true"></i>
              <h6 className="mb-0 fw-semibold">Actiuni Rapide</h6>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-ghost-secondary"
              onClick={() => setShowCustomize(!showCustomize)}
              title="Personalizeaza toolbar"
              aria-label="Personalizeaza toolbar"
            >
              <i className="ti ti-settings" aria-hidden="true"></i>
            </button>
          </div>

          {/* Actions Grid */}
          <div className={`row g-2 ${compact ? 'row-cols-4' : 'row-cols-2 row-cols-md-4 row-cols-lg-8'}`}>
            {allActions.map((action) => (
              <div key={action.id} className="col">
                <button
                  type="button"
                  className={`btn btn-outline-${action.color || 'primary'} w-100 d-flex flex-column align-items-center gap-1 py-2`}
                  onClick={action.onClick}
                  title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
                  aria-label={action.shortcut ? `${action.label} (Scurtatura ${action.shortcut})` : action.label}
                  style={{ minHeight: compact ? '60px' : '70px' }}
                >
                  <i className={`ti ${action.icon} fs-4`} aria-hidden="true"></i>
                  <span className="small fw-medium text-truncate w-100">{action.label}</span>
                  {action.shortcut && !compact && (
                    <kbd className="small opacity-75">{action.shortcut}</kbd>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Customization Panel */}
          {showCustomize && (
            <div className="mt-3 pt-3 border-top">
              <div className="small text-muted mb-2">
                <i className="ti ti-info-circle me-1" aria-hidden="true"></i>
                Drag and drop pentru a reordona actiunile (coming soon)
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <button type="button" className="btn btn-sm btn-outline-secondary">
                  <i className="ti ti-plus me-1" aria-hidden="true"></i>
                  Adauga Actiune
                </button>
                <button type="button" className="btn btn-sm btn-outline-secondary">
                  <i className="ti ti-refresh me-1" aria-hidden="true"></i>
                  Reseteaza la Default
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="mt-2">
        <button
          type="button"
          className="btn btn-link btn-sm text-muted text-decoration-none"
          data-bs-toggle="modal"
          data-bs-target="#keyboardShortcutsModal"
          aria-label="Vezi toate comenzile rapide de tastatura"
        >
          <i className="ti ti-keyboard me-1" aria-hidden="true"></i>
          Vezi toate comenzile rapide
        </button>
      </div>
    </div>
  );
}
