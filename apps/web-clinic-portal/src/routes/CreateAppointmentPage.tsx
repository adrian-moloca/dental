/**
 * Create Appointment Page
 */

import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCreateAppointment } from '../hooks/useAppointments';
import type { CreateAppointmentDto } from '../types/appointment.types';
import type { PatientDto } from '../types/patient.types';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { PatientSearchSelect } from '../components/appointments/PatientSearchSelect';
import { ProviderSelect } from '../components/appointments/ProviderSelect';
import { LocationSelect } from '../components/appointments/LocationSelect';
import { PatientSummaryCard } from '../components/appointments/PatientSummaryCard';
import { AppointmentTypeSelect } from '../components/appointments/AppointmentTypeSelect';

export default function CreateAppointmentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const createAppointment = useCreateAppointment();

  // TODO: Get clinicId from user context or application state
  const clinicId = 'temp-clinic-id';

  const [selectedPatient, setSelectedPatient] = useState<PatientDto | undefined>();
  const [formData, setFormData] = useState<Partial<CreateAppointmentDto>>({
    patientId: location.state?.patientId || '',
    providerId: '',
    locationId: '',
    serviceCode: '',
    start: new Date(),
    end: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientId) {
      newErrors.patientId = 'Patient is required';
    }
    if (!formData.providerId) {
      newErrors.providerId = 'Provider is required';
    }
    if (!formData.locationId) {
      newErrors.locationId = 'Location is required';
    }
    if (!formData.serviceCode || formData.serviceCode.trim() === '') {
      newErrors.serviceCode = 'Service code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePatientChange = (patientId: string | undefined, patient: PatientDto | undefined) => {
    setFormData({ ...formData, patientId: patientId || '' });
    setSelectedPatient(patient);
    if (patientId) {
      setErrors({ ...errors, patientId: '' });
    }
  };

  const handleProviderChange = (providerId: string) => {
    setFormData({ ...formData, providerId });
    if (providerId) {
      setErrors({ ...errors, providerId: '' });
    }
  };

  const handleLocationChange = (locationId: string) => {
    setFormData({ ...formData, locationId });
    if (locationId) {
      setErrors({ ...errors, locationId: '' });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createAppointment.mutateAsync(formData as CreateAppointmentDto);
      navigate('/appointments');
    } catch (error) {
      console.error('Failed to create appointment:', error);
      setErrors({
        submit: 'Failed to create appointment. Please try again.',
      });
    }
  };

  return (
    <AppShell
      title="Create appointment"
      subtitle="Lock the chair, set the provider, and capture the visit intent."
      actions={
        <Button as="a" href="/appointments" variant="ghost">
          Back to list
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card padding="lg" tone="glass">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Selection */}
              <div>
                <h3 className="text-sm font-semibold text-[#F4EFF0] mb-4">Patient Information</h3>
                <PatientSearchSelect
                  value={formData.patientId}
                  onChange={handlePatientChange}
                  label="Patient"
                  error={errors.patientId}
                  required
                />
              </div>

              {/* Provider and Location */}
              <div>
                <h3 className="text-sm font-semibold text-[#F4EFF0] mb-4">Appointment Details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ProviderSelect
                    value={formData.providerId}
                    onChange={handleProviderChange}
                    clinicId={clinicId}
                    label="Provider"
                    error={errors.providerId}
                    required
                  />
                  <LocationSelect
                    value={formData.locationId}
                    onChange={handleLocationChange}
                    clinicId={clinicId}
                    label="Treatment Room"
                    error={errors.locationId}
                    required
                    filterType="TREATMENT_ROOM"
                  />
                </div>
              </div>

              {/* Service and Timing */}
              <div>
                <h3 className="text-sm font-semibold text-[#F4EFF0] mb-4">Service Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <AppointmentTypeSelect
                    value={formData.serviceCode}
                    onChange={(serviceCode) => {
                      setFormData({ ...formData, serviceCode });
                      if (serviceCode) {
                        setErrors({ ...errors, serviceCode: '' });
                      }
                    }}
                    label="Appointment Type"
                    error={errors.serviceCode}
                    required
                  />
                  <Input
                    label="Start time"
                    type="datetime-local"
                    value={formData.start ? new Date(formData.start).toISOString().slice(0, 16) : ''}
                    onChange={(e) =>
                      setFormData({ ...formData, start: new Date(e.target.value) })
                    }
                    required
                    fullWidth
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="End time"
                      type="datetime-local"
                      value={formData.end ? new Date(formData.end).toISOString().slice(0, 16) : ''}
                      onChange={(e) =>
                        setFormData({ ...formData, end: new Date(e.target.value) })
                      }
                      required
                      fullWidth
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-[#F4EFF0] mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes or special requirements..."
                  rows={3}
                  className="w-full rounded-lg border border-[var(--border)] bg-[#1F1F2D] px-3 py-2 text-[#F4EFF0] placeholder:text-slate-400 focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {errors.submit}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/appointments')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" loading={createAppointment.isPending} className="flex-1">
                  {createAppointment.isPending ? 'Creating...' : 'Create appointment'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Patient Summary Sidebar */}
        <div className="lg:col-span-1">
          {selectedPatient ? (
            <div>
              <h3 className="text-sm font-semibold text-[#F4EFF0] mb-3">Selected Patient</h3>
              <PatientSummaryCard patient={selectedPatient} />
            </div>
          ) : (
            <Card padding="lg" tone="glass" className="text-center">
              <div className="text-slate-400 py-8">
                <svg
                  className="w-16 h-16 mx-auto mb-4 opacity-20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <p className="text-sm">Select a patient to see their information</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
