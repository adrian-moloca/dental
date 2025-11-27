/**
 * Appointment Status Badge
 * Shows appointment status with appropriate color and confirmation status
 */

import { Badge } from '../ui/Badge';
import type { AppointmentStatus } from '../../types/appointment.types';

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
  confirmed?: boolean;
  className?: string;
}

export function AppointmentStatusBadge({ status, confirmed, className }: AppointmentStatusBadgeProps) {
  const getStatusDisplay = () => {
    if (status === 'pending' && !confirmed) {
      return { text: 'Necesita confirmare', tone: 'warning' as const };
    }
    if (status === 'pending' && confirmed) {
      return { text: 'Confirmat', tone: 'success' as const };
    }

    switch (status) {
      case 'confirmed':
        return { text: 'Confirmat', tone: 'success' as const };
      case 'in_progress':
        return { text: 'In desfasurare', tone: 'warning' as const };
      case 'completed':
        return { text: 'Finalizat', tone: 'success' as const };
      case 'cancelled':
        return { text: 'Anulat', tone: 'neutral' as const };
      case 'no_show':
        return { text: 'Absent', tone: 'warning' as const };
      default:
        return { text: 'In asteptare', tone: 'neutral' as const };
    }
  };

  const { text, tone } = getStatusDisplay();

  return (
    <Badge tone={tone} className={className}>
      {text}
    </Badge>
  );
}
