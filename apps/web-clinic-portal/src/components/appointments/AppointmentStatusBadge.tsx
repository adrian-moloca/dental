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
      return { text: 'Needs Confirmation', tone: 'warning' as const };
    }
    if (status === 'pending' && confirmed) {
      return { text: 'Confirmed', tone: 'success' as const };
    }

    switch (status) {
      case 'confirmed':
        return { text: 'Confirmed', tone: 'success' as const };
      case 'in_progress':
        return { text: 'In Progress', tone: 'warning' as const };
      case 'completed':
        return { text: 'Completed', tone: 'success' as const };
      case 'cancelled':
        return { text: 'Cancelled', tone: 'neutral' as const };
      case 'no_show':
        return { text: 'No Show', tone: 'warning' as const };
      default:
        return { text: 'Pending', tone: 'neutral' as const };
    }
  };

  const { text, tone } = getStatusDisplay();

  return (
    <Badge tone={tone} className={className}>
      {text}
    </Badge>
  );
}
