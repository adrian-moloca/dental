/**
 * Quick Appointment Booking Modal
 * 5-step wizard for quickly booking an appointment
 */

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Modal } from '../overlay/Modal';
import { Button } from '../ui/Button';
import { useAppointmentTypes } from '../../hooks/useAppointmentTypes';
import { useProviders } from '../../hooks/useProvidersList';
import { useCreateAppointment } from '../../hooks/useAppointments';
import { TimeSlotsGrid } from '../scheduling/TimeSlotsGrid';
import type { TimeSlot } from '../../types/scheduling.types';

interface QuickBookingModalProps {
  open: boolean;
  onClose: () => void;
  patientId?: string;
  patientName?: string;
  onSuccess?: (appointmentId: string) => void;
}

type Step = 1 | 2 | 3 | 4 | 5;

export function QuickBookingModal({ open, onClose, patientId, patientName, onSuccess }: QuickBookingModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');

  const { data: appointmentTypes, isLoading: loadingTypes } = useAppointmentTypes();
  const { data: providers, isLoading: loadingProviders } = useProviders();
  const createMutation = useCreateAppointment();

  const selectedType = appointmentTypes?.find((t) => t.id === selectedTypeId);
  const selectedProvider = providers?.find((p) => p.id === selectedProviderId);

  useEffect(() => {
    if (open) {
      // Reset state when modal opens
      setStep(1);
      setSelectedTypeId('');
      setSelectedProviderId('');
      setSelectedDate(null);
      setSelectedSlot(null);
      setNotes('');
    }
  }, [open]);

  const handleNext = () => {
    if (step < 5) {
      setStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as Step);
    }
  };

  const handleConfirm = async () => {
    if (!patientId || !selectedSlot || !selectedTypeId || !selectedProviderId) return;

    try {
      const result = await createMutation.mutateAsync({
        patientId,
        providerId: selectedProviderId,
        locationId: 'default', // TODO: Add location selection
        serviceCode: selectedTypeId,
        start: selectedSlot.start,
        end: selectedSlot.end,
        notes,
        bookingSource: 'phone',
      });

      onSuccess?.(result.id);
      onClose();
    } catch (_error) {
      // Error handled by mutation
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!selectedTypeId;
      case 2:
        return !!selectedProviderId;
      case 3:
        return !!selectedDate;
      case 4:
        return !!selectedSlot;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[var(--text)]">Selecteaza tipul programarii</label>
            {loadingTypes ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-[var(--surface-hover)] animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {appointmentTypes?.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedTypeId(type.id)}
                    className={`
                      w-full p-4 rounded-lg border-2 text-left transition-all
                      ${
                        selectedTypeId === type.id
                          ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                          : 'border-[var(--border)] hover:border-[var(--primary)]/50 bg-[var(--surface)]'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-[var(--text)]">{type.name}</div>
                        {type.description && (
                          <div className="text-sm text-[var(--text-secondary)] mt-1">{type.description}</div>
                        )}
                      </div>
                      <div className="text-sm text-[var(--text-tertiary)]">{type.duration} min</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[var(--text)]">Selecteaza medicul</label>
            {loadingProviders ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-[var(--surface-hover)] animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {providers?.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => setSelectedProviderId(provider.id)}
                    className={`
                      p-4 rounded-lg border-2 text-center transition-all
                      ${
                        selectedProviderId === provider.id
                          ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                          : 'border-[var(--border)] hover:border-[var(--primary)]/50 bg-[var(--surface)]'
                      }
                    `}
                  >
                    {provider.photo ? (
                      <img
                        src={provider.photo}
                        alt={`${provider.firstName} ${provider.lastName}`}
                        className="w-12 h-12 rounded-full mx-auto mb-2 object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-2">
                        <span className="text-lg font-semibold text-[var(--primary)]">
                          {provider.firstName[0]}
                          {provider.lastName[0]}
                        </span>
                      </div>
                    )}
                    <div className="font-semibold text-[var(--text)] text-sm">
                      Dr. {provider.firstName} {provider.lastName}
                    </div>
                    {provider.specialty && (
                      <div className="text-xs text-[var(--text-tertiary)] mt-1">{provider.specialty}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[var(--text)]">Selecteaza data</label>
            <div className="text-sm text-[var(--text-secondary)] mb-2">
              Alege o zi din calendar, apoi vei selecta ora in pasul urmator.
            </div>
            {/* For now, we'll use a simpler date picker approach */}
            <input
              type="date"
              value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : null)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="w-full px-4 py-3 bg-[var(--surface)] border-2 border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
          </div>
        );

      case 4:
        if (!selectedDate) return null;
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[var(--text)]">
              Selecteaza ora pentru {format(selectedDate, 'dd MMMM yyyy')}
            </label>
            <TimeSlotsGrid
              date={selectedDate}
              providerId={selectedProviderId}
              duration={selectedType?.duration || 30}
              onSelect={setSelectedSlot}
              selected={selectedSlot || undefined}
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--text)]">Confirma Programarea</h3>

            <div className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg p-4 space-y-3">
              <div>
                <div className="text-sm text-[var(--text-tertiary)]">Pacient</div>
                <div className="font-semibold text-[var(--text)]">{patientName || 'Necunoscut'}</div>
              </div>

              <div className="border-t border-[var(--border)] pt-3">
                <div className="text-sm text-[var(--text-tertiary)]">Tip Programare</div>
                <div className="font-semibold text-[var(--text)]">{selectedType?.name}</div>
              </div>

              <div className="border-t border-[var(--border)] pt-3">
                <div className="text-sm text-[var(--text-tertiary)]">Medic</div>
                <div className="font-semibold text-[var(--text)]">
                  Dr. {selectedProvider?.firstName} {selectedProvider?.lastName}
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-3">
                <div className="text-sm text-[var(--text-tertiary)]">Data si Ora</div>
                <div className="font-semibold text-[var(--text)]">
                  {selectedSlot && format(selectedSlot.start, 'dd MMMM yyyy, HH:mm')}
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-3">
                <div className="text-sm text-[var(--text-tertiary)]">Durata</div>
                <div className="font-semibold text-[var(--text)]">{selectedType?.duration} minute</div>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-[var(--text)] mb-2">
                Note (optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                placeholder="Adauga note despre programare..."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="lg" title="Programare Rapida">
      <div className="space-y-4">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all
                  ${
                    s === step
                      ? 'bg-[var(--primary)] text-white'
                      : s < step
                        ? 'bg-[var(--primary)]/20 text-[var(--primary)]'
                        : 'bg-[var(--surface-hover)] text-[var(--text-tertiary)]'
                  }
                `}
              >
                {s}
              </div>
              {s < 5 && <div className="flex-1 h-0.5 mx-2 bg-[var(--surface-hover)]" />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[400px]">{renderStep()}</div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-[var(--border)]">
          {step > 1 && (
            <Button variant="ghost" onClick={handleBack} disabled={createMutation.isPending}>
              Inapoi
            </Button>
          )}
          <Button variant="ghost" onClick={onClose} disabled={createMutation.isPending}>
            Anuleaza
          </Button>
          {step < 5 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Continua
            </Button>
          ) : (
            <Button onClick={handleConfirm} loading={createMutation.isPending} disabled={!canProceed()}>
              Confirma Programarea
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
