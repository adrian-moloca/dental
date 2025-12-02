/**
 * WaitlistWidget
 *
 * Shows patients in waiting list (mock data for now).
 */

import { WidgetWrapper } from './WidgetWrapper';
import { Badge } from '../../../../components/ui-new';

interface WaitlistWidgetProps {
  editMode?: boolean;
}

// Mock waitlist data
const MOCK_WAITLIST = [
  {
    id: '1',
    patientName: 'Maria Popescu',
    phone: '0721234567',
    requestedDate: new Date(Date.now() + 86400000),
    priority: 'high',
    reason: 'Durere dentara',
    waitingSince: new Date(Date.now() - 172800000),
  },
  {
    id: '2',
    patientName: 'Ion Georgescu',
    phone: '0721234568',
    requestedDate: new Date(Date.now() + 172800000),
    priority: 'medium',
    reason: 'Control periodic',
    waitingSince: new Date(Date.now() - 259200000),
  },
  {
    id: '3',
    patientName: 'Elena Dumitrescu',
    phone: '0721234569',
    requestedDate: new Date(Date.now() + 259200000),
    priority: 'low',
    reason: 'Albire dentara',
    waitingSince: new Date(Date.now() - 432000000),
  },
];

const PRIORITY_CONFIG = {
  high: { label: 'Urgent', color: 'danger' },
  medium: { label: 'Normal', color: 'warning' },
  low: { label: 'Scazut', color: 'info' },
};

export function WaitlistWidget({ editMode = false }: WaitlistWidgetProps) {
  const waitlist = MOCK_WAITLIST;
  const isEmpty = waitlist.length === 0;

  const calculateWaitTime = (date: Date) => {
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Astazi';
    if (days === 1) return '1 zi';
    return `${days} zile`;
  };

  return (
    <WidgetWrapper
      id="waitlist"
      title="Lista de Asteptare"
      icon="ti ti-hourglass"
      isEmpty={isEmpty}
      emptyMessage="Nu exista pacienti in lista de asteptare"
      editMode={editMode}
      actions={
        <span className="badge bg-warning-transparent text-warning">
          {waitlist.length} pacienti
        </span>
      }
    >
      <div className="list-group list-group-flush">
        {waitlist.map((entry) => {
          const priority = PRIORITY_CONFIG[entry.priority as keyof typeof PRIORITY_CONFIG];
          const waitTime = calculateWaitTime(entry.waitingSince);

          return (
            <div key={entry.id} className="list-group-item border-0 py-3">
              <div className="d-flex align-items-start justify-content-between mb-2">
                <div>
                  <div className="fw-medium">{entry.patientName}</div>
                  <small className="text-muted">
                    <i className="ti ti-phone fs-12 me-1"></i>
                    {entry.phone}
                  </small>
                </div>
                <Badge variant={priority.color as any}>{priority.label}</Badge>
              </div>

              <div className="d-flex align-items-center gap-3 mb-2">
                <small className="text-muted">
                  <i className="ti ti-stethoscope me-1"></i>
                  {entry.reason}
                </small>
              </div>

              <div className="d-flex align-items-center justify-content-between">
                <small className="text-muted">
                  <i className="ti ti-clock me-1"></i>
                  Asteapta: {waitTime}
                </small>
                <button className="btn btn-sm btn-outline-primary">
                  <i className="ti ti-calendar-plus me-1"></i>
                  Programeaza
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </WidgetWrapper>
  );
}

export default WaitlistWidget;
