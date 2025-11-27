/**
 * Quick Actions Panel Component
 *
 * Provides easy access to common clinical workflows for a patient.
 * Displays a card with quick action buttons for appointments, invoices,
 * treatment plans, clinical notes, and reminders.
 */

import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button } from '../ui-new';

export interface QuickActionsPanelProps {
  /** Patient ID for action links */
  patientId: string;
  /** Optional patient name for display */
  patientName?: string;
  /** Additional CSS classes */
  className?: string;
}

export function QuickActionsPanel({ patientId, patientName, className }: QuickActionsPanelProps) {
  const navigate = useNavigate();

  const actions = [
    {
      icon: 'ti ti-calendar-plus',
      label: 'Programare Noua',
      description: 'Creaza o programare pentru pacient',
      variant: 'primary' as const,
      onClick: () => navigate('/appointments/create', { state: { patientId } }),
    },
    {
      icon: 'ti ti-file-invoice',
      label: 'Emite Factura',
      description: 'Genereaza o factura noua',
      variant: 'soft-success' as const,
      onClick: () => navigate(`/billing/invoices/new?patientId=${patientId}`),
    },
    {
      icon: 'ti ti-list-check',
      label: 'Plan Tratament Nou',
      description: 'Creaza un plan de tratament',
      variant: 'soft-info' as const,
      onClick: () => navigate(`/clinical/treatment-plans/new?patientId=${patientId}`),
    },
    {
      icon: 'ti ti-notes',
      label: 'Nota Clinica Rapida',
      description: 'Adauga o nota clinica',
      variant: 'soft-warning' as const,
      onClick: () => navigate(`/clinical/notes/new?patientId=${patientId}`),
    },
    {
      icon: 'ti ti-bell',
      label: 'Trimite Reminder',
      description: 'Trimite memento pacientului',
      variant: 'soft-secondary' as const,
      onClick: () => {
        // TODO: Implement reminder modal/functionality
        alert('Functionalitatea de reminder va fi disponibila in curand');
      },
    },
  ];

  return (
    <Card className={className}>
      <CardHeader
        title={patientName ? `Actiuni Rapide - ${patientName}` : 'Actiuni Rapide'}
        icon="ti ti-bolt"
      />
      <CardBody>
        <div className="d-flex flex-column gap-2">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant}
              onClick={action.onClick}
              className="text-start d-flex align-items-center gap-3"
              title={action.description}
            >
              <i className={`${action.icon} fs-20`}></i>
              <div className="flex-grow-1">
                <div className="fw-semibold">{action.label}</div>
                <small className="opacity-75">{action.description}</small>
              </div>
              <i className="ti ti-chevron-right opacity-50"></i>
            </Button>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

export default QuickActionsPanel;
