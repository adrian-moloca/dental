/**
 * Upcoming Appointments Panel Component
 *
 * Timeline view of appointments in the next 2 hours.
 */

import { format, isBefore } from 'date-fns';
import { Card, CardHeader, CardBody, Button, Badge } from '../ui-new';
import { useCheckInAppointment, useNoShowAppointment } from '../../hooks/useAppointments';
import toast from 'react-hot-toast';
import type { AppointmentDto } from '../../types/appointment.types';

interface UpcomingAppointmentsPanelProps {
  upcoming: AppointmentDto[];
}

function UpcomingAppointmentCard({ appointment }: { appointment: AppointmentDto }) {
  const checkIn = useCheckInAppointment();
  const noShow = useNoShowAppointment();
  const now = new Date();
  const startTime = new Date(appointment.start);
  const isLate = isBefore(startTime, now);

  const handleCheckIn = async () => {
    try {
      await checkIn.mutateAsync(appointment.id);
      toast.success('Check-in realizat cu succes!');
    } catch {
      toast.error('Eroare la check-in');
    }
  };

  const handleNoShow = async () => {
    if (!window.confirm('Marcati acest pacient ca absent?')) return;

    try {
      await noShow.mutateAsync(appointment.id);
      toast.success('Pacient marcat ca absent');
    } catch {
      toast.error('Eroare la marcare');
    }
  };

  const handleCallPatient = () => {
    // Simulate SMS/Call
    toast.success(`Apel trimis catre pacientul ${appointment.patientId?.slice(0, 8)}`);
  };

  return (
    <div className="card border mb-3 hover-shadow">
      <div className="card-body p-3">
        {/* Timeline Marker */}
        <div className="d-flex align-items-start gap-3">
          <div className="text-center" style={{ minWidth: 60 }}>
            <div className="fw-bold text-primary">{format(startTime, 'HH:mm')}</div>
            {isLate && (
              <Badge variant="soft-danger" className="mt-1">
                Intarziat
              </Badge>
            )}
          </div>

          <div className="flex-grow-1">
            {/* Patient Info */}
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center gap-2">
                <div className="avatar avatar-sm bg-primary-transparent rounded-circle">
                  <span className="avatar-text text-primary fw-medium">
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
              <Badge variant="soft-info">{appointment.status === 'confirmed' ? 'Confirmat' : 'Neconfirmat'}</Badge>
            </div>

            {/* Provider */}
            <div className="d-flex align-items-center gap-2 mb-3 text-muted small">
              <i className="ti ti-user-circle"></i>
              <span>Dr. {appointment.providerId?.slice(0, 8) || 'Nealocat'}</span>
            </div>

            {/* Quick Actions */}
            <div className="d-flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleCheckIn}
                loading={checkIn.isPending}
              >
                <i className="ti ti-user-check me-1"></i>
                Check-in
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={handleCallPatient}>
                <i className="ti ti-phone"></i>
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleNoShow}
                loading={noShow.isPending}
              >
                <i className="ti ti-user-x"></i>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UpcomingAppointmentsPanel({ upcoming }: UpcomingAppointmentsPanelProps) {
  return (
    <Card className="shadow-sm h-100">
      <CardHeader className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <i className="ti ti-calendar-time text-info fs-20"></i>
          <h5 className="mb-0 fw-bold">Urmatoarele 2 Ore</h5>
          <Badge variant="info">{upcoming.length}</Badge>
        </div>
        <Button variant="link" size="sm">
          <i className="ti ti-refresh"></i>
        </Button>
      </CardHeader>

      <CardBody className="p-3" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {upcoming.length === 0 ? (
          <div className="text-center py-5">
            <div className="avatar avatar-xl bg-light rounded-circle mx-auto mb-3">
              <i className="ti ti-calendar-off fs-32 text-muted"></i>
            </div>
            <h6 className="fw-semibold mb-2">Nicio programare urmatoare</h6>
            <p className="text-muted small mb-0">
              Nu exista programari in urmatoarele 2 ore
            </p>
          </div>
        ) : (
          <div className="timeline-list">
            {upcoming.map((apt) => (
              <UpcomingAppointmentCard key={apt.id} appointment={apt} />
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
