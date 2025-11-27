/**
 * Current Treatments Panel Component
 *
 * Displays patients currently in treatment with completion capability.
 */

import { format } from 'date-fns';
import { Card, CardHeader, CardBody, Button, Badge } from '../ui-new';
import { useCompleteAppointment } from '../../hooks/useAppointments';
import { useWaitTimer } from '../../hooks/useWaitTimer';
import toast from 'react-hot-toast';
import type { AppointmentDto } from '../../types/appointment.types';

interface CurrentTreatmentsPanelProps {
  inProgress: AppointmentDto[];
}

function TreatmentCard({ appointment }: { appointment: AppointmentDto }) {
  const complete = useCompleteAppointment();
  const elapsedTime = useWaitTimer(appointment.start);

  const handleComplete = async () => {
    try {
      await complete.mutateAsync({ id: appointment.id });
      toast.success('Tratament finalizat!');
    } catch {
      toast.error('Eroare la finalizare');
    }
  };

  return (
    <div className="card border-info border mb-3">
      <div className="card-body p-3">
        {/* Header */}
        <div className="d-flex align-items-start justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <div className="avatar avatar-md bg-info-transparent rounded-circle position-relative">
              <span className="avatar-text text-info fw-bold">
                {appointment.patientId?.slice(0, 2).toUpperCase() || 'P'}
              </span>
              <span className="avatar-badge badge-pulse bg-info"></span>
            </div>
            <div>
              <h6 className="mb-0 fw-semibold">
                Pacient {appointment.patientId?.slice(0, 8) || 'N/A'}
              </h6>
              <small className="text-muted">{appointment.serviceCode || 'Tratament'}</small>
            </div>
          </div>
          <Badge variant="soft-info" className="badge-pulse">
            <i className="ti ti-activity me-1"></i>
            In Desfasurare
          </Badge>
        </div>

        {/* Treatment Info */}
        <div className="bg-light rounded p-2 mb-3">
          <div className="d-flex align-items-center gap-2 mb-2">
            <i className="ti ti-user-circle text-muted"></i>
            <span className="small">
              Dr. {appointment.providerId?.slice(0, 8) || 'Nealocat'}
            </span>
          </div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <i className="ti ti-door text-muted"></i>
            <span className="small">Cabinet 1</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <i className="ti ti-clock-play text-info"></i>
            <span className="small fw-medium text-info">
              Inceput la: {format(new Date(appointment.start), 'HH:mm')}
            </span>
          </div>
        </div>

        {/* Elapsed Time */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <span className="small text-muted">Timp scurs:</span>
          <div className="d-flex align-items-center gap-2">
            <i className="ti ti-hourglass-high text-primary"></i>
            <span className="fw-bold text-primary">{elapsedTime.minutes} minute</span>
          </div>
        </div>

        {/* Complete Button */}
        <Button
          variant="success"
          size="sm"
          className="w-100"
          onClick={handleComplete}
          loading={complete.isPending}
        >
          <i className="ti ti-check-circle me-2"></i>
          Finalizeaza Tratament
        </Button>
      </div>
    </div>
  );
}

export function CurrentTreatmentsPanel({ inProgress }: CurrentTreatmentsPanelProps) {
  return (
    <Card className="shadow-sm h-100">
      <CardHeader className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <i className="ti ti-stethoscope text-success fs-20"></i>
          <h5 className="mb-0 fw-bold">In Tratament</h5>
          <Badge variant="success" className="badge-pulse">
            {inProgress.length}
          </Badge>
        </div>
      </CardHeader>

      <CardBody className="p-3" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {inProgress.length === 0 ? (
          <div className="text-center py-5">
            <div className="avatar avatar-xl bg-light rounded-circle mx-auto mb-3">
              <i className="ti ti-dental-off fs-32 text-muted"></i>
            </div>
            <h6 className="fw-semibold mb-2">Niciun tratament activ</h6>
            <p className="text-muted small mb-0">
              Tratamentele in desfasurare vor aparea aici
            </p>
          </div>
        ) : (
          <div className="treatments-list">
            {inProgress.map((apt) => (
              <TreatmentCard key={apt.id} appointment={apt} />
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
