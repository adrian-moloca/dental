/**
 * Patient Contact Actions Component
 *
 * Displays patient contact information with quick action links
 * (click-to-call, click-to-email, appointment status).
 */

import { Badge } from '../ui-new';

export interface PatientContactActionsProps {
  /** Patient phone number */
  phone?: string;
  /** Patient email */
  email?: string;
  /** Next appointment date (ISO string or Date) */
  nextAppointmentDate?: string | Date;
  /** Appointment status */
  appointmentStatus?: string;
  /** Additional CSS classes */
  className?: string;
}

export function PatientContactActions({
  phone,
  email,
  nextAppointmentDate,
  appointmentStatus = 'none',
  className = '',
}: PatientContactActionsProps) {
  const formatPhoneForTel = (phoneNumber: string) => {
    // Remove spaces, dashes, and parentheses for tel: link
    return phoneNumber.replace(/[\s\-()]/g, '');
  };

  const getAppointmentBadge = () => {
    if (!nextAppointmentDate || !appointmentStatus || appointmentStatus === 'none') {
      return (
        <Badge variant="soft-secondary" icon="ti ti-calendar-off">
          Fara Programare
        </Badge>
      );
    }

    const statusConfig: Record<string, { variant: 'soft-info' | 'soft-success' | 'soft-primary' | 'soft-warning' | 'soft-secondary' | 'soft-danger'; icon: string; label: string }> = {
      scheduled: { variant: 'soft-info', icon: 'ti ti-calendar-time', label: 'Programat' },
      confirmed: { variant: 'soft-success', icon: 'ti ti-calendar-check', label: 'Confirmat' },
      completed: { variant: 'soft-primary', icon: 'ti ti-calendar-event', label: 'Completat' },
      pending: { variant: 'soft-warning', icon: 'ti ti-calendar-time', label: 'In Asteptare' },
      cancelled: { variant: 'soft-secondary', icon: 'ti ti-calendar-off', label: 'Anulat' },
      no_show: { variant: 'soft-danger', icon: 'ti ti-calendar-x', label: 'Neprezentare' },
    };

    const config = statusConfig[appointmentStatus] || statusConfig.scheduled;

    return (
      <Badge variant={config.variant} icon={config.icon}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className={`d-flex flex-wrap align-items-center gap-3 ${className}`}>
      {/* Phone Number with Click-to-Call */}
      {phone && (
        <div className="d-flex align-items-center gap-2">
          <a
            href={`tel:${formatPhoneForTel(phone)}`}
            className="btn btn-soft-primary btn-sm d-flex align-items-center gap-2"
            title="Suna pacientul"
            aria-label={`Suna ${phone}`}
          >
            <i className="ti ti-phone"></i>
            <span className="d-none d-md-inline">{phone}</span>
          </a>
        </div>
      )}

      {/* Email with Click-to-Compose */}
      {email && (
        <div className="d-flex align-items-center gap-2">
          <a
            href={`mailto:${email}`}
            className="btn btn-soft-info btn-sm d-flex align-items-center gap-2"
            title="Trimite email"
            aria-label={`Trimite email la ${email}`}
          >
            <i className="ti ti-mail"></i>
            <span className="d-none d-md-inline">{email}</span>
          </a>
        </div>
      )}

      {/* Appointment Status Indicator */}
      <div className="d-flex align-items-center gap-2">
        {getAppointmentBadge()}
      </div>
    </div>
  );
}

export default PatientContactActions;
