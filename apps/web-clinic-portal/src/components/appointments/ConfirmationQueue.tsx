import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { Icon } from '../ui/Icon';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import { ConfirmAppointmentModal } from './ConfirmAppointmentModal';
import { useAppointments, useBulkConfirmAppointments } from '../../hooks/useAppointments';
import type { AppointmentDto, ConfirmationMethod } from '../../types/appointment.types';

export function ConfirmationQueue() {
  const [selectedAppointmentIds, setSelectedAppointmentIds] = useState<Set<string>>(new Set());
  const [modalAppointment, setModalAppointment] = useState<AppointmentDto | null>(null);
  const [_bulkMethod, _setBulkMethod] = useState<ConfirmationMethod>('phone');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const endOfTomorrow = new Date(tomorrow);
  endOfTomorrow.setHours(23, 59, 59, 999);

  const { data, isLoading, isError, refetch } = useAppointments({
    startDate: tomorrow as any,
    endDate: endOfTomorrow as any,
    confirmed: false,
  });

  const bulkConfirmMutation = useBulkConfirmAppointments();

  const appointments = data?.data || [];
  const unconfirmedCount = appointments.length;

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedAppointmentIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedAppointmentIds(newSelection);
  };

  const selectAll = () => {
    setSelectedAppointmentIds(new Set(appointments.map((apt) => apt.id)));
  };

  const clearSelection = () => {
    setSelectedAppointmentIds(new Set());
  };

  const handleBulkConfirm = async () => {
    if (selectedAppointmentIds.size === 0) return;

    try {
      await bulkConfirmMutation.mutateAsync({
        ids: Array.from(selectedAppointmentIds),
        method: _bulkMethod,
      });
      clearSelection();
    } catch (error) {
      console.error('Bulk confirmation failed:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tomorrow's Unconfirmed Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="text" height={80} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tomorrow's Unconfirmed Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-400 mb-2">Failed to load appointments</div>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tomorrow's Unconfirmed Appointments</CardTitle>
              <p className="text-sm text-foreground/60 mt-1">
                {unconfirmedCount} {unconfirmedCount === 1 ? 'appointment' : 'appointments'} need
                confirmation
              </p>
            </div>
            {unconfirmedCount > 0 && (
              <div className="flex gap-2">
                {selectedAppointmentIds.size > 0 ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={clearSelection}>
                      Clear ({selectedAppointmentIds.size})
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleBulkConfirm}
                      loading={bulkConfirmMutation.isPending}
                    >
                      Confirm Selected
                    </Button>
                  </>
                ) : (
                  <Button variant="soft" size="sm" onClick={selectAll}>
                    Select All
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {unconfirmedCount === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="check" className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-foreground font-semibold mb-1">All Confirmed!</div>
              <div className="text-sm text-foreground/60">
                No appointments need confirmation for tomorrow
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className={`
                    p-4 rounded-lg border transition-all cursor-pointer
                    ${
                      selectedAppointmentIds.has(appointment.id)
                        ? 'border-brand bg-brand/5'
                        : 'border-white/10 bg-surface-hover hover:border-brand/50'
                    }
                  `}
                  onClick={() => toggleSelection(appointment.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 pt-1">
                      <input
                        type="checkbox"
                        checked={selectedAppointmentIds.has(appointment.id)}
                        onChange={() => toggleSelection(appointment.id)}
                        className="w-4 h-4 rounded border-white/20 text-brand focus:ring-brand focus:ring-offset-0"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select appointment for patient ${appointment.patientId}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="text-foreground font-semibold">
                            Patient #{appointment.patientId}
                          </div>
                          <div className="text-sm text-foreground/60">
                            {new Date(appointment.start).toLocaleString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                        <AppointmentStatusBadge
                          status={appointment.status}
                          confirmed={appointment.confirmed}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-foreground/50">
                        <Icon name="users" className="w-3 h-3" />
                        Provider #{appointment.providerId}
                      </div>
                    </div>
                    <Button
                      variant="soft"
                      size="sm"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setModalAppointment(appointment);
                      }}
                    >
                      Confirm
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmAppointmentModal
        open={!!modalAppointment}
        onClose={() => setModalAppointment(null)}
        appointment={modalAppointment}
        onSuccess={() => {
          selectedAppointmentIds.delete(modalAppointment?.id || '');
          setSelectedAppointmentIds(new Set(selectedAppointmentIds));
        }}
      />
    </>
  );
}
