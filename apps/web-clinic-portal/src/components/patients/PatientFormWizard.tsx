/**
 * Patient Form Wizard - Intuitive Multi-Step Patient Registration
 *
 * Key UX Improvements:
 * - Step-by-step wizard instead of overwhelming all-at-once form
 * - Clear progress indicator showing current step
 * - Required fields clearly marked with visual indicator
 * - Optional sections are clearly labeled
 * - Better spacing and visual hierarchy
 * - Smart defaults and auto-fill from CNP
 */

import { useState, useEffect, useCallback } from 'react';
import { Input, Textarea, Select } from '../ui-new';
import { Button } from '../ui/Button';
import type {
  CreatePatientDto,
  PhoneDto,
  EmailDto,
  AddressDto,
} from '../../types/patient.types';
import { useAuthStore } from '../../store/authStore';
import {
  validateCNP,
  extractDateFromCNP,
  extractGenderFromCNP,
  validateRomanianPhone,
  validateEmail,
  ROMANIAN_COUNTIES,
} from '../../utils/validation';

// =============================================================================
// Types
// =============================================================================

interface PatientFormState {
  // Step 1: Essential Info (Required)
  firstName: string;
  lastName: string;
  cnp: string;
  dateOfBirth: Date | undefined;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | undefined;

  // Step 2: Contact Info (Required phone OR email)
  phone: string;
  email: string;
  preferredContactMethod: 'phone' | 'email' | 'sms' | 'whatsapp';

  // Step 3: Additional Info (All Optional)
  middleName?: string;
  preferredName?: string;
  street?: string;
  city?: string;
  county?: string;
  postalCode?: string;

  // Step 4: Consent (GDPR Required)
  gdprConsent: boolean;
  marketingConsent: boolean;
  smsRemindersConsent: boolean;
  emailRemindersConsent: boolean;

  notes: string;
}

type WizardStep = 'essential' | 'contact' | 'additional' | 'consent';

interface PatientFormWizardProps {
  initialData?: Partial<PatientFormState>;
  onSubmit: (data: CreatePatientDto) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit';
}

// =============================================================================
// Step Configuration
// =============================================================================

const STEPS: { key: WizardStep; label: string; description: string; required: boolean }[] = [
  {
    key: 'essential',
    label: 'Date Personale',
    description: 'Informații de bază despre pacient',
    required: true,
  },
  {
    key: 'contact',
    label: 'Contact',
    description: 'Cum îl putem contacta',
    required: true,
  },
  {
    key: 'additional',
    label: 'Informații Extra',
    description: 'Adresă și alte detalii',
    required: false,
  },
  {
    key: 'consent',
    label: 'Consimțământ',
    description: 'GDPR și preferințe comunicare',
    required: true,
  },
];

// =============================================================================
// Main Component
// =============================================================================

export function PatientFormWizard({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = 'create',
}: PatientFormWizardProps) {
  const user = useAuthStore((state) => state.user);
  const [currentStep, setCurrentStep] = useState<WizardStep>('essential');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedSteps, setTouchedSteps] = useState<Set<WizardStep>>(new Set<WizardStep>(['essential']));

  const [formData, setFormData] = useState<PatientFormState>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    cnp: initialData?.cnp || '',
    dateOfBirth: initialData?.dateOfBirth || undefined,
    gender: initialData?.gender || undefined,
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    preferredContactMethod: initialData?.preferredContactMethod || 'phone',
    middleName: initialData?.middleName,
    preferredName: initialData?.preferredName,
    street: initialData?.street,
    city: initialData?.city,
    county: initialData?.county,
    postalCode: initialData?.postalCode,
    gdprConsent: initialData?.gdprConsent ?? false,
    marketingConsent: initialData?.marketingConsent || false,
    smsRemindersConsent: initialData?.smsRemindersConsent || false,
    emailRemindersConsent: initialData?.emailRemindersConsent || false,
    notes: initialData?.notes || '',
  });

  // Auto-fill from CNP
  useEffect(() => {
    if (formData.cnp && formData.cnp.length === 13) {
      const validation = validateCNP(formData.cnp);
      if (validation.valid) {
        const dateOfBirth = extractDateFromCNP(formData.cnp);
        const gender = extractGenderFromCNP(formData.cnp);

        setFormData((prev) => ({
          ...prev,
          dateOfBirth: dateOfBirth || prev.dateOfBirth,
          gender: gender || prev.gender,
        }));

        setErrors((prev) => ({ ...prev, cnp: '' }));
      }
    }
  }, [formData.cnp]);

  const updateField = useCallback(<K extends keyof PatientFormState>(
    field: K,
    value: PatientFormState[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // =============================================================================
  // Validation
  // =============================================================================

  const validateStep = useCallback((step: WizardStep): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'essential':
        if (!formData.firstName?.trim()) {
          newErrors.firstName = 'Prenumele este obligatoriu';
        }
        if (!formData.lastName?.trim()) {
          newErrors.lastName = 'Numele este obligatoriu';
        }
        if (formData.cnp) {
          const cnpValidation = validateCNP(formData.cnp);
          if (!cnpValidation.valid) {
            newErrors.cnp = cnpValidation.error || 'CNP invalid';
          }
        }
        if (!formData.dateOfBirth) {
          newErrors.dateOfBirth = 'Data nașterii este obligatorie';
        }
        if (!formData.gender) {
          newErrors.gender = 'Genul este obligatoriu';
        }
        break;

      case 'contact':
        // At least one contact method required
        if (!formData.phone?.trim() && !formData.email?.trim()) {
          newErrors.phone = 'Introduceți cel puțin un număr de telefon sau email';
          newErrors.email = 'Introduceți cel puțin un număr de telefon sau email';
        }
        if (formData.phone?.trim()) {
          const phoneValidation = validateRomanianPhone(formData.phone);
          if (!phoneValidation.valid) {
            newErrors.phone = phoneValidation.error || 'Număr de telefon invalid';
          }
        }
        if (formData.email?.trim()) {
          const emailValidation = validateEmail(formData.email);
          if (!emailValidation.valid) {
            newErrors.email = emailValidation.error || 'Email invalid';
          }
        }
        break;

      case 'additional':
        // All optional, no validation needed
        break;

      case 'consent':
        if (mode === 'create' && !formData.gdprConsent) {
          newErrors.gdprConsent = 'Consimțământul GDPR este obligatoriu pentru înregistrare';
        }
        break;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  }, [formData, mode]);

  const isStepValid = useCallback((step: WizardStep): boolean => {
    switch (step) {
      case 'essential':
        return !!(
          formData.firstName?.trim() &&
          formData.lastName?.trim() &&
          formData.dateOfBirth &&
          formData.gender &&
          (!formData.cnp || validateCNP(formData.cnp).valid)
        );
      case 'contact':
        return !!(
          (formData.phone?.trim() && validateRomanianPhone(formData.phone).valid) ||
          (formData.email?.trim() && validateEmail(formData.email).valid)
        );
      case 'additional':
        return true; // Always valid (optional)
      case 'consent':
        return mode === 'edit' || formData.gdprConsent;
      default:
        return false;
    }
  }, [formData, mode]);

  // =============================================================================
  // Navigation
  // =============================================================================

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);

  const goToStep = (step: WizardStep) => {
    const stepIndex = STEPS.findIndex((s) => s.key === step);
    const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

    // Can always go back
    if (stepIndex < currentIndex) {
      setCurrentStep(step);
      setTouchedSteps((prev) => new Set<WizardStep>([...Array.from(prev), step]));
      return;
    }

    // Validate all steps before the target
    for (let i = currentIndex; i < stepIndex; i++) {
      if (!validateStep(STEPS[i].key)) {
        setCurrentStep(STEPS[i].key);
        return;
      }
    }

    setCurrentStep(step);
    setTouchedSteps((prev) => new Set<WizardStep>([...Array.from(prev), step]));
  };

  const goNext = () => {
    if (!validateStep(currentStep)) return;

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      const nextStep = STEPS[nextIndex].key;
      setCurrentStep(nextStep);
      setTouchedSteps((prev) => new Set<WizardStep>([...Array.from(prev), nextStep]));
    }
  };

  const goPrev = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].key);
    }
  };

  // =============================================================================
  // Submit
  // =============================================================================

  const handleSubmit = async () => {
    // Validate all steps
    for (const step of STEPS) {
      if (!validateStep(step.key)) {
        setCurrentStep(step.key);
        return;
      }
    }

    const phones: PhoneDto[] = formData.phone?.trim()
      ? [{ type: 'mobile' as const, number: formData.phone, isPrimary: true }]
      : [];

    const emails: EmailDto[] = formData.email?.trim()
      ? [{ type: 'personal' as const, address: formData.email, isPrimary: true }]
      : [];

    const addresses: AddressDto[] =
      formData.street?.trim()
        ? [
            {
              street: formData.street,
              city: formData.city || '',
              state: formData.county || '',
              postalCode: formData.postalCode || '',
              country: 'Romania',
              isPrimary: true,
            },
          ]
        : [];

    const submitData: CreatePatientDto = {
      clinicId: user?.clinicId || user?.organizationId || 'default-clinic',
      person: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        preferredName: formData.preferredName,
        dateOfBirth: formData.dateOfBirth!,
        gender: formData.gender || 'prefer_not_to_say',
        cnp: formData.cnp || undefined,
      },
      contacts: {
        phones: phones.length > 0 ? phones : undefined,
        emails: emails.length > 0 ? emails : undefined,
        addresses: addresses.length > 0 ? addresses : undefined,
      },
      consent: {
        gdprConsent: formData.gdprConsent,
        marketingConsent: formData.marketingConsent,
        smsMarketing: formData.smsRemindersConsent,
        emailMarketing: formData.emailRemindersConsent,
      },
      notes: formData.notes || undefined,
    };

    await onSubmit(submitData);
  };

  // =============================================================================
  // Render
  // =============================================================================

  return (
    <div className="patient-form-wizard">
      {/* Progress Indicator */}
      <div className="wizard-progress mb-8">
        <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap">
          {STEPS.map((step, index) => {
            const isActive = step.key === currentStep;
            const isCompleted = touchedSteps.has(step.key) && isStepValid(step.key) && index < currentStepIndex;
            const isClickable = index <= currentStepIndex || (index === currentStepIndex + 1 && isStepValid(currentStep));

            return (
              <div key={step.key} className="d-flex align-items-center">
                {index > 0 && (
                  <div
                    className={`wizard-connector ${isCompleted || isActive ? 'active' : ''}`}
                    style={{
                      width: '40px',
                      height: '2px',
                      backgroundColor: isCompleted ? 'var(--primary)' : 'var(--border-color)',
                      marginRight: '12px',
                    }}
                  />
                )}
                <button
                  type="button"
                  onClick={() => isClickable && goToStep(step.key)}
                  disabled={!isClickable}
                  className={`wizard-step-button d-flex flex-column align-items-center ${
                    isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                  style={{
                    background: 'none',
                    border: 'none',
                    opacity: isClickable ? 1 : 0.5,
                  }}
                >
                  <div
                    className={`wizard-step-circle d-flex align-items-center justify-content-center mb-2`}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      fontSize: '14px',
                      fontWeight: 600,
                      backgroundColor: isActive
                        ? 'var(--primary)'
                        : isCompleted
                        ? 'var(--success)'
                        : 'var(--light-900)',
                      color: isActive || isCompleted ? 'white' : 'var(--gray-600)',
                      border: isActive ? '2px solid var(--primary)' : '2px solid var(--border-color)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {isCompleted ? (
                      <i className="ti ti-check" style={{ fontSize: '18px' }}></i>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="text-center">
                    <div
                      className="wizard-step-label"
                      style={{
                        fontSize: '13px',
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? 'var(--primary)' : 'var(--gray-700)',
                      }}
                    >
                      {step.label}
                    </div>
                    {!step.required && (
                      <span
                        className="badge bg-secondary-transparent text-secondary"
                        style={{ fontSize: '10px', marginTop: '4px' }}
                      >
                        Opțional
                      </span>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="wizard-content">
        <form onSubmit={(e) => e.preventDefault()}>
          {/* Step 1: Essential Info */}
          {currentStep === 'essential' && (
            <div className="wizard-step-content">
              <div className="step-header mb-4">
                <h4 className="mb-1">Date Personale de Bază</h4>
                <p className="text-muted small mb-0">
                  Câmpurile marcate cu <span className="text-danger">*</span> sunt obligatorii
                </p>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <Input
                        label="Prenume"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => updateField('firstName', e.target.value)}
                        error={errors.firstName}
                        required
                        autoComplete="given-name"
                        autoFocus
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        label="Nume"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => updateField('lastName', e.target.value)}
                        error={errors.lastName}
                        required
                        autoComplete="family-name"
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        label="CNP (Cod Numeric Personal)"
                        type="text"
                        value={formData.cnp}
                        onChange={(e) => updateField('cnp', e.target.value)}
                        error={errors.cnp}
                        maxLength={13}
                        helperText="Opțional - Data nașterii și genul se completează automat"
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        label="Data Nașterii"
                        type="date"
                        value={
                          formData.dateOfBirth
                            ? new Date(formData.dateOfBirth).toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) =>
                          updateField('dateOfBirth', e.target.value ? new Date(e.target.value) : undefined)
                        }
                        error={errors.dateOfBirth}
                        required
                        autoComplete="bday"
                      />
                    </div>
                    <div className="col-md-6">
                      <Select
                        label="Gen"
                        value={formData.gender || ''}
                        onChange={(e) =>
                          updateField('gender', (e.target.value || undefined) as PatientFormState['gender'])
                        }
                        options={[
                          { value: '', label: 'Selectează genul', disabled: true },
                          { value: 'male', label: 'Bărbat' },
                          { value: 'female', label: 'Femeie' },
                          { value: 'other', label: 'Altul' },
                          { value: 'prefer_not_to_say', label: 'Prefer să nu spun' },
                        ]}
                        error={errors.gender}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Info */}
          {currentStep === 'contact' && (
            <div className="wizard-step-content">
              <div className="step-header mb-4">
                <h4 className="mb-1">Informații de Contact</h4>
                <p className="text-muted small mb-0">
                  Completați cel puțin un număr de telefon <strong>sau</strong> o adresă de email
                </p>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <Input
                        label="Telefon"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        error={errors.phone}
                        helperText="Format: +40xxxxxxxxx sau 07xxxxxxxx"
                        autoComplete="tel"
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        error={errors.email}
                        autoComplete="email"
                      />
                    </div>
                    <div className="col-md-6">
                      <Select
                        label="Metodă Preferată de Contact"
                        value={formData.preferredContactMethod}
                        onChange={(e) =>
                          updateField(
                            'preferredContactMethod',
                            e.target.value as PatientFormState['preferredContactMethod']
                          )
                        }
                        options={[
                          { value: 'phone', label: 'Telefon' },
                          { value: 'email', label: 'Email' },
                          { value: 'sms', label: 'SMS' },
                          { value: 'whatsapp', label: 'WhatsApp' },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Additional Info (Optional) */}
          {currentStep === 'additional' && (
            <div className="wizard-step-content">
              <div className="step-header mb-4">
                <h4 className="mb-1">
                  Informații Suplimentare
                  <span className="badge bg-secondary-transparent text-secondary ms-2" style={{ fontSize: '12px' }}>
                    Opțional
                  </span>
                </h4>
                <p className="text-muted small mb-0">
                  Aceste informații sunt opționale și pot fi completate ulterior
                </p>
              </div>

              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-transparent border-bottom">
                  <h6 className="mb-0">
                    <i className="ti ti-user me-2 text-primary"></i>
                    Detalii Personale
                  </h6>
                </div>
                <div className="card-body p-4">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <Input
                        label="Nume de Mijloc"
                        type="text"
                        value={formData.middleName || ''}
                        onChange={(e) => updateField('middleName', e.target.value || undefined)}
                        autoComplete="additional-name"
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        label="Nume Preferat"
                        type="text"
                        value={formData.preferredName || ''}
                        onChange={(e) => updateField('preferredName', e.target.value || undefined)}
                        helperText="Cum preferă să fie adresat pacientul"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent border-bottom">
                  <h6 className="mb-0">
                    <i className="ti ti-map-pin me-2 text-primary"></i>
                    Adresă
                  </h6>
                </div>
                <div className="card-body p-4">
                  <div className="row g-4">
                    <div className="col-12">
                      <Input
                        label="Stradă și Număr"
                        type="text"
                        value={formData.street || ''}
                        onChange={(e) => updateField('street', e.target.value || undefined)}
                        autoComplete="street-address"
                      />
                    </div>
                    <div className="col-md-4">
                      <Input
                        label="Oraș"
                        type="text"
                        value={formData.city || ''}
                        onChange={(e) => updateField('city', e.target.value || undefined)}
                        autoComplete="address-level2"
                      />
                    </div>
                    <div className="col-md-4">
                      <Select
                        label="Județ"
                        value={formData.county || ''}
                        onChange={(e) => updateField('county', e.target.value || undefined)}
                        options={[
                          { value: '', label: 'Selectează județul' },
                          ...ROMANIAN_COUNTIES.map((county) => ({
                            value: county,
                            label: county,
                          })),
                        ]}
                      />
                    </div>
                    <div className="col-md-4">
                      <Input
                        label="Cod Poștal"
                        type="text"
                        value={formData.postalCode || ''}
                        onChange={(e) => updateField('postalCode', e.target.value || undefined)}
                        autoComplete="postal-code"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Consent */}
          {currentStep === 'consent' && (
            <div className="wizard-step-content">
              <div className="step-header mb-4">
                <h4 className="mb-1">Consimțământ și Preferințe</h4>
                <p className="text-muted small mb-0">
                  Conform GDPR, consimțământul pentru procesarea datelor este obligatoriu
                </p>
              </div>

              {/* GDPR Required */}
              <div className="card border-primary shadow-sm mb-4">
                <div className="card-header bg-primary-transparent border-bottom border-primary">
                  <h6 className="mb-0 text-primary">
                    <i className="ti ti-shield-lock me-2"></i>
                    Consimțământ GDPR <span className="text-danger">*</span>
                  </h6>
                </div>
                <div className="card-body p-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className={`form-check-input ${errors.gdprConsent ? 'is-invalid' : ''}`}
                      id="gdprConsent"
                      checked={formData.gdprConsent}
                      onChange={(e) => updateField('gdprConsent', e.target.checked)}
                      required={mode === 'create'}
                    />
                    <label className="form-check-label" htmlFor="gdprConsent">
                      <strong>Accept procesarea datelor personale</strong>
                      <p className="text-muted small mb-0 mt-1">
                        Datele dumneavoastră vor fi procesate în conformitate cu Regulamentul General
                        privind Protecția Datelor (GDPR) și legislația română în vigoare.
                        Datele clinice vor fi păstrate minimum 10 ani conform Legii 95/2006.
                      </p>
                    </label>
                    {errors.gdprConsent && (
                      <div className="invalid-feedback d-block">{errors.gdprConsent}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Optional Consents */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-transparent border-bottom">
                  <h6 className="mb-0">
                    <i className="ti ti-bell me-2 text-secondary"></i>
                    Preferințe Notificări
                    <span className="badge bg-secondary-transparent text-secondary ms-2" style={{ fontSize: '11px' }}>
                      Opțional
                    </span>
                  </h6>
                </div>
                <div className="card-body p-4">
                  <div className="d-flex flex-column gap-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="smsReminders"
                        checked={formData.smsRemindersConsent}
                        onChange={(e) => updateField('smsRemindersConsent', e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="smsReminders">
                        <strong>Memento-uri prin SMS</strong>
                        <p className="text-muted small mb-0">
                          Primesc notificări SMS pentru programări și reamintiri
                        </p>
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="emailReminders"
                        checked={formData.emailRemindersConsent}
                        onChange={(e) => updateField('emailRemindersConsent', e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="emailReminders">
                        <strong>Memento-uri prin Email</strong>
                        <p className="text-muted small mb-0">
                          Primesc notificări email pentru programări și rezultate
                        </p>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Marketing Consent */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-transparent border-bottom">
                  <h6 className="mb-0">
                    <i className="ti ti-speakerphone me-2 text-secondary"></i>
                    Marketing
                    <span className="badge bg-secondary-transparent text-secondary ms-2" style={{ fontSize: '11px' }}>
                      Opțional
                    </span>
                  </h6>
                </div>
                <div className="card-body p-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="marketingConsent"
                      checked={formData.marketingConsent}
                      onChange={(e) => updateField('marketingConsent', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="marketingConsent">
                      <strong>Comunicări promoționale</strong>
                      <p className="text-muted small mb-0">
                        Accept să primesc oferte, promoții și noutăți de la clinică
                      </p>
                    </label>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent border-bottom">
                  <h6 className="mb-0">
                    <i className="ti ti-notes me-2 text-secondary"></i>
                    Note Adiționale
                    <span className="badge bg-secondary-transparent text-secondary ms-2" style={{ fontSize: '11px' }}>
                      Opțional
                    </span>
                  </h6>
                </div>
                <div className="card-body p-4">
                  <Textarea
                    value={formData.notes || ''}
                    onChange={(e) => updateField('notes', e.target.value)}
                    rows={3}
                    placeholder="Orice informații relevante despre pacient (preferințe, observații speciale, etc.)..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div
            className="wizard-navigation d-flex justify-content-between align-items-center pt-5 mt-5"
            style={{ borderTop: '1px solid var(--border-color)' }}
          >
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <i className="ti ti-x me-2"></i>
              Anulează
            </Button>

            <div className="d-flex gap-3">
              {currentStepIndex > 0 && (
                <Button
                  type="button"
                  variant="soft"
                  onClick={goPrev}
                  disabled={isSubmitting}
                >
                  <i className="ti ti-arrow-left me-2"></i>
                  Înapoi
                </Button>
              )}

              {currentStepIndex < STEPS.length - 1 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={goNext}
                  disabled={!isStepValid(currentStep)}
                >
                  {STEPS[currentStepIndex + 1].required ? 'Continuă' : 'Continuă (sau Sari)'}
                  <i className="ti ti-arrow-right ms-2"></i>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.gdprConsent}
                  loading={isSubmitting}
                >
                  <i className="ti ti-check me-2"></i>
                  {mode === 'create' ? 'Creează Pacient' : 'Salvează Modificări'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
