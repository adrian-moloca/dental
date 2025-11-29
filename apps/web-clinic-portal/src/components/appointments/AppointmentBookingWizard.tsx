/**
 * Appointment Booking Wizard
 *
 * Multi-step appointment creation wizard with:
 * - Step 1: Select Patient (with inline create option)
 * - Step 2: Select Service & Provider
 * - Step 3: Select Date & Time
 * - Step 4: Confirmation & Reminders
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, addMinutes, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';
import { PatientSearchSelect } from './PatientSearchSelect';
import { ProviderSelect } from './ProviderSelect';
import { AppointmentTypeSelect } from './AppointmentTypeSelect';
import { Button } from '../ui-new/Button';
import { Icon } from '../ui/Icon';
import type { PatientDto } from '../../types/patient.types';
import type { CreateAppointmentDto } from '../../types/appointment.types';
import { patientsClient } from '../../api/patientsClient';

interface AppointmentBookingWizardProps {
  onSubmit: (data: CreateAppointmentDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  initialPatientId?: string;
  clinicId: string;
}

interface WizardFormData {
  // Step 1: Patient
  patientId: string;
  patient?: PatientDto;

  // Step 2: Service & Provider
  serviceCode: string;
  providerId: string;
  estimatedDuration: number;

  // Step 3: Date & Time
  appointmentDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm

  // Step 4: Confirmation
  notes: string;
  sendSmsReminder: boolean;
  sendEmailReminder: boolean;
  emergencyVisit: boolean;
}

type WizardStep = 'patient' | 'service' | 'datetime' | 'confirmation';

// Service duration mapping (in minutes)
const SERVICE_DURATIONS: Record<string, number> = {
  'EXAM': 30,
  'CLEANING': 60,
  'XRAY': 15,
  'FILLING': 60,
  'EXTRACTION': 45,
  'ROOT_CANAL': 90,
  'CROWN': 90,
  'WHITENING': 60,
  'ORTHODONTIC': 45,
  'EMERGENCY': 30,
  'FOLLOW_UP': 30,
  'CONSULT': 30,
};

export function AppointmentBookingWizard({
  onSubmit,
  onCancel,
  isSubmitting,
  initialPatientId,
  clinicId,
}: AppointmentBookingWizardProps) {
  const [step, setStep] = useState<WizardStep>('patient');

  const today = new Date();
  const defaultDate = format(today, 'yyyy-MM-dd');

  const [formData, setFormData] = useState<WizardFormData>({
    patientId: initialPatientId || '',
    patient: undefined,
    serviceCode: '',
    providerId: '',
    estimatedDuration: 30,
    appointmentDate: defaultDate,
    startTime: '09:00',
    endTime: '09:30',
    notes: '',
    sendSmsReminder: true,
    sendEmailReminder: true,
    emergencyVisit: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch patient details if initialPatientId is provided
  useEffect(() => {
    if (initialPatientId && !formData.patient) {
      patientsClient.getById(initialPatientId).then((patient) => {
        setFormData((prev) => ({ ...prev, patient }));
      }).catch(() => {
        // Patient not found, clear ID
        setFormData((prev) => ({ ...prev, patientId: '' }));
      });
    }
  }, [initialPatientId, formData.patient]);

  // Fetch patient's last visit and suggested follow-up
  const { data: patientHistory } = useQuery({
    queryKey: ['patient-history', formData.patientId],
    queryFn: async () => {
      // TODO: Replace with actual API call
      // This would fetch patient's last appointment and treatment history
      return {
        lastVisit: null as Date | null,
        lastProcedure: null as string | null,
        suggestedFollowUp: null as string | null,
        lastProvider: null as string | null,
      };
    },
    enabled: !!formData.patientId,
  });

  const updateFormData = useCallback((updates: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    const updatedKeys = Object.keys(updates);
    setErrors((prev) => {
      const newErrors = { ...prev };
      updatedKeys.forEach((key) => delete newErrors[key]);
      return newErrors;
    });
  }, []);

  // Auto-calculate end time when service or start time changes
  useEffect(() => {
    if (formData.serviceCode && formData.startTime) {
      const duration = SERVICE_DURATIONS[formData.serviceCode] || 30;
      const [hours, minutes] = formData.startTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);
      const endDate = addMinutes(startDate, duration);
      const endTime = format(endDate, 'HH:mm');

      if (endTime !== formData.endTime) {
        updateFormData({ endTime, estimatedDuration: duration });
      }
    }
  }, [formData.serviceCode, formData.startTime, formData.endTime, updateFormData]);

  // Validation functions
  const validatePatientStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientId) {
      newErrors.patientId = 'Te rog selecteaza un pacient';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateServiceStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.serviceCode) {
      newErrors.serviceCode = 'Te rog selecteaza tipul serviciului';
    }

    if (!formData.providerId) {
      newErrors.providerId = 'Te rog selecteaza un medic';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDateTimeStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'Te rog selecteaza o data';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Te rog selecteaza ora de inceput';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'Te rog selecteaza ora de sfarsit';
    }

    // Validate that end time is after start time
    if (formData.startTime && formData.endTime) {
      const start = parseISO(`${formData.appointmentDate}T${formData.startTime}`);
      const end = parseISO(`${formData.appointmentDate}T${formData.endTime}`);

      if (end <= start) {
        newErrors.endTime = 'Ora de sfarsit trebuie sa fie dupa ora de inceput';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation handlers
  const handleNext = () => {
    if (step === 'patient' && validatePatientStep()) {
      setStep('service');
    } else if (step === 'service' && validateServiceStep()) {
      setStep('datetime');
    } else if (step === 'datetime' && validateDateTimeStep()) {
      setStep('confirmation');
    }
  };

  const handleBack = () => {
    if (step === 'service') setStep('patient');
    else if (step === 'datetime') setStep('service');
    else if (step === 'confirmation') setStep('datetime');
  };

  const handlePatientChange = useCallback((patientId: string | undefined, patient: PatientDto | undefined) => {
    updateFormData({
      patientId: patientId || '',
      patient: patient || undefined,
    });
  }, [updateFormData]);

  const handleSubmit = async () => {
    const startDateTime = parseISO(`${formData.appointmentDate}T${formData.startTime}`);
    const endDateTime = parseISO(`${formData.appointmentDate}T${formData.endTime}`);

    const payload: CreateAppointmentDto = {
      patientId: formData.patientId,
      providerId: formData.providerId,
      locationId: clinicId, // Using clinicId as locationId for now
      serviceCode: formData.serviceCode,
      start: startDateTime,
      end: endDateTime,
      notes: formData.notes,
      emergencyVisit: formData.emergencyVisit,
      bookingSource: 'phone', // Default to phone booking
    };

    await onSubmit(payload);
  };

  const canProceedFromPatient = Boolean(formData.patientId && formData.patientId.length > 0);
  const canProceedFromService = Boolean(formData.serviceCode && formData.providerId);
  const canProceedFromDateTime = Boolean(formData.appointmentDate && formData.startTime && formData.endTime);

  return (
    <div className="space-y-4">
      {/* Progress Indicator */}
      <div className="d-flex align-items-center justify-content-center gap-2 mb-4">
        <StepIndicator
          number={1}
          label="Pacient"
          isActive={step === 'patient'}
          isCompleted={step !== 'patient' && canProceedFromPatient}
          onClick={() => setStep('patient')}
        />
        <div className="flex-shrink-0" style={{ width: '40px', height: '2px', background: 'var(--bs-border-color)' }} />
        <StepIndicator
          number={2}
          label="Serviciu"
          isActive={step === 'service'}
          isCompleted={(step === 'datetime' || step === 'confirmation') && canProceedFromService}
          onClick={() => canProceedFromPatient && setStep('service')}
        />
        <div className="flex-shrink-0" style={{ width: '40px', height: '2px', background: 'var(--bs-border-color)' }} />
        <StepIndicator
          number={3}
          label="Data & Ora"
          isActive={step === 'datetime'}
          isCompleted={step === 'confirmation' && canProceedFromDateTime}
          onClick={() => canProceedFromService && setStep('datetime')}
        />
        <div className="flex-shrink-0" style={{ width: '40px', height: '2px', background: 'var(--bs-border-color)' }} />
        <StepIndicator
          number={4}
          label="Confirmare"
          isActive={step === 'confirmation'}
          isCompleted={false}
          onClick={() => canProceedFromDateTime && setStep('confirmation')}
        />
      </div>

      {/* Step Content */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          {/* Step 1: Patient Selection */}
          {step === 'patient' && (
            <div>
              <div className="mb-4">
                <h4 className="fw-bold mb-2">Selecteaza Pacient</h4>
                <p className="text-muted small mb-0">
                  Cauta si selecteaza pacientul pentru programare sau creeaza un pacient nou
                </p>
              </div>

              <PatientSearchSelect
                value={formData.patientId}
                onChange={handlePatientChange}
                label="Pacient"
                error={errors.patientId}
                required
              />

              {formData.patient && (
                <div className="alert alert-soft-info mt-3">
                  <div className="d-flex align-items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="avatar avatar-md rounded-circle bg-primary-light">
                        <span className="avatar-text text-primary fw-bold">
                          {formData.patient.firstName[0]}{formData.patient.lastName[0]}
                        </span>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 fw-semibold">
                        {formData.patient.firstName} {formData.patient.lastName}
                      </h6>
                      {formData.patient.phones?.[0]?.number && (
                        <div className="small text-muted">
                          <i className="ti ti-phone me-1"></i>
                          {formData.patient.phones[0].number}
                        </div>
                      )}
                      {patientHistory?.lastVisit && (
                        <div className="small text-muted mt-1">
                          <i className="ti ti-calendar-check me-1"></i>
                          Ultima vizita: {format(patientHistory.lastVisit, 'dd MMM yyyy', { locale: ro })}
                        </div>
                      )}
                      {patientHistory?.lastProvider && formData.providerId !== patientHistory.lastProvider && (
                        <div className="small text-warning mt-1">
                          <i className="ti ti-info-circle me-1"></i>
                          Pacientul a vizitat anterior alt medic
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="alert alert-soft-secondary mt-3">
                <div className="d-flex gap-2">
                  <i className="ti ti-info-circle text-secondary"></i>
                  <div className="small">
                    <strong>Pacient nou?</strong> Poti crea un pacient nou direct din sistem inainte de a crea programarea.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Service & Provider Selection */}
          {step === 'service' && (
            <div>
              <div className="mb-4">
                <h4 className="fw-bold mb-2">Selecteaza Serviciu si Medic</h4>
                <p className="text-muted small mb-0">
                  Alege tipul serviciului si medicul care va efectua procedura
                </p>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <AppointmentTypeSelect
                    value={formData.serviceCode}
                    onChange={(serviceCode) => updateFormData({ serviceCode })}
                    label="Tip Serviciu"
                    error={errors.serviceCode}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <ProviderSelect
                    value={formData.providerId}
                    onChange={(providerId) => updateFormData({ providerId })}
                    clinicId={clinicId}
                    label="Medic"
                    error={errors.providerId}
                    required
                  />
                </div>
              </div>

              {formData.serviceCode && (
                <div className="alert alert-soft-info mt-3">
                  <div className="d-flex align-items-center gap-2">
                    <i className="ti ti-clock text-info"></i>
                    <span className="small">
                      Durata estimata: <strong>{SERVICE_DURATIONS[formData.serviceCode] || 30} minute</strong>
                    </span>
                  </div>
                </div>
              )}

              {patientHistory?.suggestedFollowUp && (
                <div className="alert alert-soft-success mt-3">
                  <div className="d-flex gap-2">
                    <i className="ti ti-bulb text-success"></i>
                    <div className="small">
                      <strong>Sugestie:</strong> Pe baza ultimei vizite, se recomanda: {patientHistory.suggestedFollowUp}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Date & Time Selection */}
          {step === 'datetime' && (
            <div>
              <div className="mb-4">
                <h4 className="fw-bold mb-2">Selecteaza Data si Ora</h4>
                <p className="text-muted small mb-0">
                  Alege data si intervalul orar pentru programare
                </p>
              </div>

              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">
                    Data Programare <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => updateFormData({ appointmentDate: e.target.value })}
                    min={format(today, 'yyyy-MM-dd')}
                    className={`form-control ${errors.appointmentDate ? 'is-invalid' : ''}`}
                  />
                  {errors.appointmentDate && (
                    <div className="invalid-feedback">{errors.appointmentDate}</div>
                  )}
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Ora Inceput <span className="text-danger">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => updateFormData({ startTime: e.target.value })}
                    className={`form-control ${errors.startTime ? 'is-invalid' : ''}`}
                  />
                  {errors.startTime && (
                    <div className="invalid-feedback">{errors.startTime}</div>
                  )}
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Ora Sfarsit <span className="text-danger">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => updateFormData({ endTime: e.target.value })}
                    className={`form-control ${errors.endTime ? 'is-invalid' : ''}`}
                  />
                  {errors.endTime && (
                    <div className="invalid-feedback">{errors.endTime}</div>
                  )}
                </div>
              </div>

              {/* Quick Time Slots */}
              <div className="mt-4">
                <label className="form-label small text-muted">Intervale rapide:</label>
                <div className="d-flex flex-wrap gap-2">
                  {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map((time) => (
                    <button
                      key={time}
                      type="button"
                      className={`btn btn-sm ${formData.startTime === time ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => updateFormData({ startTime: time })}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="alert alert-soft-warning mt-4">
                <div className="d-flex gap-2">
                  <i className="ti ti-alert-triangle text-warning"></i>
                  <div className="small">
                    <strong>Atentie:</strong> Asigura-te ca medicul este disponibil in intervalul selectat. Conflictele vor fi verificate automat.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 'confirmation' && (
            <div>
              <div className="mb-4">
                <h4 className="fw-bold mb-2">Confirmare Programare</h4>
                <p className="text-muted small mb-0">
                  Verifica detaliile si adauga note suplimentare
                </p>
              </div>

              {/* Summary */}
              <div className="card bg-light border-0 mb-4">
                <div className="card-body">
                  <h6 className="fw-semibold mb-3">Rezumat Programare</h6>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="d-flex align-items-start gap-2">
                        <i className="ti ti-user text-primary mt-1"></i>
                        <div>
                          <div className="small text-muted">Pacient</div>
                          <div className="fw-medium">
                            {formData.patient?.firstName} {formData.patient?.lastName}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="d-flex align-items-start gap-2">
                        <i className="ti ti-stethoscope text-info mt-1"></i>
                        <div>
                          <div className="small text-muted">Serviciu</div>
                          <div className="fw-medium">{formData.serviceCode}</div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="d-flex align-items-start gap-2">
                        <i className="ti ti-calendar text-success mt-1"></i>
                        <div>
                          <div className="small text-muted">Data si Ora</div>
                          <div className="fw-medium">
                            {format(parseISO(formData.appointmentDate), 'dd MMMM yyyy', { locale: ro })}
                            <br />
                            {formData.startTime} - {formData.endTime}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="d-flex align-items-start gap-2">
                        <i className="ti ti-clock text-warning mt-1"></i>
                        <div>
                          <div className="small text-muted">Durata</div>
                          <div className="fw-medium">{formData.estimatedDuration} minute</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-3">
                <label className="form-label">Note Aditionale</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => updateFormData({ notes: e.target.value })}
                  placeholder="Adauga note sau informatii importante despre programare..."
                  rows={3}
                  className="form-control"
                />
              </div>

              {/* Reminder Options */}
              <div className="mb-3">
                <label className="form-label">Optiuni Reminder</label>
                <div className="d-flex flex-column gap-2">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="sms-reminder"
                      checked={formData.sendSmsReminder}
                      onChange={(e) => updateFormData({ sendSmsReminder: e.target.checked })}
                      className="form-check-input"
                    />
                    <label htmlFor="sms-reminder" className="form-check-label">
                      Trimite reminder SMS cu 24h inainte
                    </label>
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="email-reminder"
                      checked={formData.sendEmailReminder}
                      onChange={(e) => updateFormData({ sendEmailReminder: e.target.checked })}
                      className="form-check-input"
                    />
                    <label htmlFor="email-reminder" className="form-check-label">
                      Trimite reminder Email cu 24h inainte
                    </label>
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="emergency-visit"
                      checked={formData.emergencyVisit}
                      onChange={(e) => updateFormData({ emergencyVisit: e.target.checked })}
                      className="form-check-input"
                    />
                    <label htmlFor="emergency-visit" className="form-check-label text-danger">
                      <i className="ti ti-alert-circle me-1"></i>
                      Marcheaza ca urgenta
                    </label>
                  </div>
                </div>
              </div>

              <div className="alert alert-soft-success">
                <div className="d-flex gap-2">
                  <i className="ti ti-check-circle text-success"></i>
                  <div className="small">
                    Pacientul va primi o confirmare automata prin metodele selectate mai sus.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="d-flex justify-content-between pt-3 border-top">
        <Button
          variant="outline-secondary"
          onClick={step === 'patient' ? onCancel : handleBack}
          disabled={isSubmitting}
        >
          <Icon name="arrow-left" className="me-2" />
          {step === 'patient' ? 'Anuleaza' : 'Inapoi'}
        </Button>

        <div className="d-flex gap-2">
          {step !== 'confirmation' && (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={
                (step === 'patient' && !canProceedFromPatient) ||
                (step === 'service' && !canProceedFromService) ||
                (step === 'datetime' && !canProceedFromDateTime)
              }
            >
              Urmatorul Pas
              <Icon name="arrow-right" className="ms-2" />
            </Button>
          )}

          {step === 'confirmation' && (
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              <Icon name="check" className="me-2" />
              Creeaza Programare
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Step Indicator Component
interface StepIndicatorProps {
  number: number;
  label: string;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

function StepIndicator({ number, label, isActive, isCompleted, onClick }: StepIndicatorProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="d-flex flex-column align-items-center gap-2 bg-transparent border-0 p-0"
      style={{ cursor: isCompleted || isActive ? 'pointer' : 'default' }}
    >
      <div
        className={`d-flex align-items-center justify-content-center rounded-circle fw-semibold transition-all`}
        style={{
          width: '40px',
          height: '40px',
          backgroundColor: isCompleted || isActive ? 'var(--bs-primary)' : 'var(--bs-gray-200)',
          color: isCompleted || isActive ? 'white' : 'var(--bs-gray-500)',
          fontSize: '14px',
        }}
      >
        {isCompleted ? <i className="ti ti-check"></i> : number}
      </div>
      <span
        className={`text-center small fw-medium`}
        style={{
          color: isActive ? 'var(--bs-body-color)' : 'var(--bs-gray-500)',
          minWidth: '70px',
        }}
      >
        {label}
      </span>
    </button>
  );
}
