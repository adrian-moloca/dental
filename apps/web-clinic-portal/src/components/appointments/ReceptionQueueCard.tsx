/**
 * Reception Queue Card
 * Displays appointment with quick action buttons
 */

import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import { AppointmentQuickActions } from './AppointmentQuickActions';
import { WaitTimeBadge } from './WaitTimeBadge';
import type { AppointmentDto } from '../../types/appointment.types';

interface ReceptionQueueCardProps {
  appointment: AppointmentDto;
}

export function ReceptionQueueCard({ appointment }: ReceptionQueueCardProps) {
  const startTime = new Date(appointment.start);
  const endTime = new Date(appointment.end);

  return (
    <Card hoverable className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {appointment.patientId}
            </h3>
            <AppointmentStatusBadge status={appointment.status} />
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Provider: {appointment.providerId}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600 dark:text-neutral-400">Time</span>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {startTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
            {' - '}
            {endTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600 dark:text-neutral-400">Service</span>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {appointment.serviceCode}
          </span>
        </div>

        {appointment.chairId && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">Chair</span>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {appointment.chairId}
            </span>
          </div>
        )}
      </div>

      <WaitTimeBadge appointment={appointment} />

      <AppointmentQuickActions appointment={appointment} />
    </Card>
  );
}
