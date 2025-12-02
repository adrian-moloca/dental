/**
 * LowStockAlerts Widget
 *
 * Shows inventory items with low stock levels.
 */

import { useLowStockItems } from '../../../../hooks/useDashboardStats';
import { WidgetWrapper } from './WidgetWrapper';
import { Badge } from '../../../../components/ui-new';
import { Link } from 'react-router-dom';

interface LowStockAlertsWidgetProps {
  editMode?: boolean;
}

export function LowStockAlertsWidget({ editMode = false }: LowStockAlertsWidgetProps) {
  const { data, isLoading, isError } = useLowStockItems();

  const lowStockItems = data?.items || [];
  const criticalCount = data?.criticalCount || 0;
  const isEmpty = lowStockItems.length === 0;

  return (
    <WidgetWrapper
      id="lowStockAlerts"
      title="Alerte Stoc"
      icon="ti ti-alert-triangle"
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
      emptyMessage="Toate produsele au stoc suficient"
      editMode={editMode}
      actions={
        data?.count ? (
          <Badge variant="danger">{data.count} alerte</Badge>
        ) : null
      }
    >
      {criticalCount > 0 && (
        <div className="alert alert-danger mb-3" role="alert">
          <i className="ti ti-alert-circle me-2"></i>
          <strong>{criticalCount}</strong> produse epuizate
        </div>
      )}

      <div className="list-group list-group-flush">
        {lowStockItems.map((item) => {
          const isCritical = item.stock.available === 0;
          const stockPercentage =
            (item.stock.available / (item.stock.reorderLevel || 1)) * 100;

          return (
            <div key={item.id} className="list-group-item border-0 py-3">
              <div className="d-flex align-items-start justify-content-between mb-2">
                <div className="flex-grow-1">
                  <div className="fw-medium">{item.name}</div>
                  <small className="text-muted">SKU: {item.sku}</small>
                </div>
                <Badge variant={isCritical ? 'danger' : 'warning'}>
                  {isCritical ? 'Epuizat' : 'Stoc Scazut'}
                </Badge>
              </div>

              <div className="d-flex align-items-center gap-2">
                <div className="flex-grow-1">
                  <div className="progress" style={{ height: 8 }}>
                    <div
                      className={`progress-bar ${
                        isCritical ? 'bg-danger' : stockPercentage < 50 ? 'bg-warning' : 'bg-info'
                      }`}
                      role="progressbar"
                      style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                      aria-valuenow={item.stock.available}
                      aria-valuemin={0}
                      aria-valuemax={item.stock.reorderLevel}
                      aria-label={`Stoc disponibil ${item.stock.available} din ${item.stock.reorderLevel}`}
                    ></div>
                  </div>
                </div>
                <small className="text-muted" style={{ minWidth: 80 }}>
                  {item.stock.available} / {item.stock.reorderLevel}
                </small>
              </div>

              {item.stock.available <= item.stock.reorderLevel / 2 && (
                <div className="mt-2">
                  <button className="btn btn-sm btn-outline-primary w-100">
                    <i className="ti ti-shopping-cart me-1"></i>
                    Comanda Acum
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {data && data.count > 5 && (
        <div className="text-center border-top pt-3 mt-2">
          <Link to="/inventory?filter=low-stock" className="btn btn-sm btn-link text-decoration-none">
            Vezi toate alertele ({data.count})
            <i className="ti ti-arrow-right ms-1"></i>
          </Link>
        </div>
      )}
    </WidgetWrapper>
  );
}

export default LowStockAlertsWidget;
