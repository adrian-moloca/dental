/**
 * Waiting Queue Panel Component
 *
 * Displays checked-in patients waiting for treatment with drag-to-reorder capability.
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardBody, Button, Badge } from '../ui-new';
import { useWaitTimer } from '../../hooks/useWaitTimer';
import { useStartAppointment, useCancelAppointment } from '../../hooks/useAppointments';
import toast from 'react-hot-toast';
import type { AppointmentDto } from '../../types/appointment.types';

interface WaitingQueuePanelProps {
  waiting: AppointmentDto[];
}

function WaitingPatientCard({ appointment }: { appointment: AppointmentDto }) {
  const waitTime = useWaitTimer(appointment.start);
  const startAppointment = useStartAppointment();
  const cancelAppointment = useCancelAppointment();

  const handleStart = async () => {
    try {
      await startAppointment.mutateAsync(appointment.id);
      toast.success('Tratament inceput!');
    } catch {
      toast.error('Eroare la inceperea tratamentului');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Sigur doriti sa anulati programarea?')) return;

    try {
      await cancelAppointment.mutateAsync({
        id: appointment.id,
        data: { reason: 'Anulare din receptie', cancelledBy: 'reception' },
      });
      toast.success('Programare anulata');
    } catch {
      toast.error('Eroare la anulare');
    }
  };

  // Determine priority based on wait time
  const getPriorityBadge = () => {
    if (waitTime.isOverdue) {
      return (
        <Badge variant="soft-danger" className="badge-pulse">
          <i className="ti ti-alert-circle me-1"></i>
          Urgenta
        </Badge>
      );
    }
    if (waitTime.isWarning) {
      return (
        <Badge variant="soft-warning">
          <i className="ti ti-clock me-1"></i>
          Prioritate
        </Badge>
      );
    }
    return (
      <Badge variant="soft-success">
        <i className="ti ti-check me-1"></i>
        Routine
      </Badge>
    );
  };

  return (
    <div
      className={`card border mb-3 hover-shadow cursor-move ${
        waitTime.isOverdue ? 'border-danger' : waitTime.isWarning ? 'border-warning' : ''
      }`}
    >
      <div className="card-body p-3">
        {/* Header */}
        <div className="d-flex align-items-start justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <div className="avatar avatar-md bg-primary-transparent rounded-circle">
              <span className="avatar-text text-primary fw-bold">
                {appointment.patientId?.slice(0, 2).toUpperCase() || 'P'}
              </span>
            </div>
            <div>
              <h6 className="mb-0 fw-semibold">
                Pacient {appointment.patientId?.slice(0, 8) || 'N/A'}
              </h6>
              <small className="text-muted">{appointment.serviceCode || 'Consultatie'}</small>
            </div>
          </div>
          {getPriorityBadge()}
        </div>

        {/* Appointment Info */}
        <div className="mb-3">
          <div className="d-flex align-items-center gap-2 mb-2">
            <i className="ti ti-clock-hour-4 text-muted"></i>
            <span className="small">
              Programat: {format(new Date(appointment.start), 'HH:mm')}
            </span>
          </div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <i className="ti ti-user-circle text-muted"></i>
            <span className="small">
              Dr. {appointment.providerId?.slice(0, 8) || 'Nealocat'}
            </span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <i
              className={`ti ti-hourglass ${
                waitTime.isOverdue
                  ? 'text-danger'
                  : waitTime.isWarning
                    ? 'text-warning'
                    : 'text-success'
              }`}
            ></i>
            <span
              className={`small fw-medium ${
                waitTime.isOverdue
                  ? 'text-danger'
                  : waitTime.isWarning
                    ? 'text-warning'
                    : 'text-success'
              }`}
            >
              Asteapta: {waitTime.minutes} minute
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="d-flex gap-2">
          <Button
            variant="success"
            size="sm"
            className="flex-fill"
            onClick={handleStart}
            loading={startAppointment.isPending}
          >
            <i className="ti ti-player-play me-1"></i>
            Incepe
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleCancel}
            loading={cancelAppointment.isPending}
          >
            <i className="ti ti-x"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function WaitingQueuePanel({ waiting }: WaitingQueuePanelProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Note: Full drag-and-drop would require state management for queue order
  // This is a simplified version showing the UI structure

  return (
    <Card className="shadow-sm h-100">
      <CardHeader className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <i className="ti ti-users text-primary fs-20"></i>
          <h5 className="mb-0 fw-bold">Coada de Asteptare</h5>
          <Badge variant="primary">{waiting.length}</Badge>
        </div>
        <Button variant="link" size="sm">
          <i className="ti ti-arrows-sort"></i>
        </Button>
      </CardHeader>

      <CardBody className="p-3" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {waiting.length === 0 ? (
          <div className="text-center py-5">
            <div className="avatar avatar-xl bg-light rounded-circle mx-auto mb-3">
              <i className="ti ti-armchair-off fs-32 text-muted"></i>
            </div>
            <h6 className="fw-semibold mb-2">Niciun pacient in asteptare</h6>
            <p className="text-muted small mb-0">
              Pacientii cu check-in efectuat vor aparea aici
            </p>
          </div>
        ) : (
          <div className="queue-list">
            {waiting.map((apt, index) => (
              <WaitingPatientCard key={apt.id} appointment={apt} />
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
