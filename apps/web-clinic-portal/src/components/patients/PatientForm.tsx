/**
 * Patient Form Component - Enhanced for Romanian Dental Requirements
 *
 * Comprehensive patient form with all required fields for Romanian dental practice
 */

import { useState, useEffect } from 'react';
import { Input, Textarea, Select, MultiSelect } from '../ui-new';
import { Button } from '../ui/Button';
import type {
  CreatePatientDto,
  PhoneDto,
  EmailDto,
  AddressDto,
  AllergyDto,
  MedicalConditionDto,
  MedicationDto,
  EmergencyContactDto,
  InsuranceDto,
} from '../../types/patient.types';
import { useAuthStore } from '../../store/authStore';
import {
  validateCNP,
  extractDateFromCNP,
  extractGenderFromCNP,
  validateRomanianPhone,
  validateEmail,
  ROMANIAN_COUNTIES,
  EMERGENCY_CONTACT_RELATIONSHIPS,
  CONTACT_METHODS,
  ALLERGY_SEVERITY_LEVELS,
  PATIENT_FLAGS,
} from '../../utils/validation';

/** Internal form state (flat for easier form handling) */
interface PatientFormState {
  // Personal Information
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  cnp: string;
  dateOfBirth: Date | undefined;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | undefined;
  nationality: string;
  occupation?: string;
  employer?: string;

  // Contact Information
  phones: PhoneDto[];
  emails: EmailDto[];
  whatsappNumber?: string;
  whatsappSameAsPrimary: boolean;
  preferredContactMethod: 'phone' | 'email' | 'sms' | 'whatsapp';

  // Address
  address: Partial<AddressDto>;

  // Emergency Contact
  emergencyContact?: EmergencyContactDto;

  // Medical Alerts
  alerts: {
    allergies: AllergyDto[];
    medicalConditions: MedicalConditionDto[];
    medications: MedicationDto[];
    flags: string[];
  };

  // Insurance
  insurance?: Partial<InsuranceDto>;

  // GDPR Consent
  gdprConsent: boolean;
  marketingConsent: boolean;
  smsRemindersConsent: boolean;
  emailRemindersConsent: boolean;

  // Additional
  notes: string;
}

interface PatientFormProps {
  initialData?: Partial<PatientFormState>;
  onSubmit: (data: CreatePatientDto) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit';
}

export function PatientForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = 'create',
}: PatientFormProps) {
  const user = useAuthStore((state) => state.user);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    contact: true,
    address: false,
    emergency: false,
    medical: false,
    insurance: false,
    gdpr: true,
    additional: false,
  });

  const [formData, setFormData] = useState<PatientFormState>({
    // Personal Information
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    middleName: initialData?.middleName,
    preferredName: initialData?.preferredName,
    cnp: initialData?.cnp || '',
    dateOfBirth: initialData?.dateOfBirth || undefined,
    gender: initialData?.gender || undefined,
    nationality: initialData?.nationality || 'Romana',
    occupation: initialData?.occupation,
    employer: initialData?.employer,

    // Contact Information
    phones: initialData?.phones || [{ type: 'mobile', number: '', isPrimary: true }],
    emails: initialData?.emails || [{ type: 'personal', address: '', isPrimary: true }],
    whatsappNumber: initialData?.whatsappNumber,
    whatsappSameAsPrimary: initialData?.whatsappSameAsPrimary || false,
    preferredContactMethod: initialData?.preferredContactMethod || 'phone',

    // Address
    address: initialData?.address || {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Romania',
    },

    // Emergency Contact
    emergencyContact: initialData?.emergencyContact,

    // Medical Alerts
    alerts: initialData?.alerts || {
      allergies: [],
      medicalConditions: [],
      medications: [],
      flags: [],
    },

    // Insurance
    insurance: initialData?.insurance,

    // GDPR Consent
    gdprConsent: initialData?.gdprConsent ?? true,
    marketingConsent: initialData?.marketingConsent || false,
    smsRemindersConsent: initialData?.smsRemindersConsent || false,
    emailRemindersConsent: initialData?.emailRemindersConsent || false,

    // Additional
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-fill date of birth and gender from CNP
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

        // Clear CNP error if valid
        setErrors((prev) => ({ ...prev, cnp: '' }));
      }
    }
  }, [formData.cnp]);

  // Auto-fill WhatsApp from primary phone
  useEffect(() => {
    if (formData.whatsappSameAsPrimary && formData.phones?.[0]?.number) {
      setFormData((prev) => ({
        ...prev,
        whatsappNumber: formData.phones[0].number,
      }));
    }
  }, [formData.whatsappSameAsPrimary, formData.phones]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'Prenumele este obligatoriu';
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Numele este obligatoriu';
    }

    // CNP validation
    if (formData.cnp) {
      const cnpValidation = validateCNP(formData.cnp);
      if (!cnpValidation.valid) {
        newErrors.cnp = cnpValidation.error || 'CNP invalid';
      }
    }

    // Date of birth
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Data nasterii este obligatorie';
    }

    // Gender
    if (!formData.gender) {
      newErrors.gender = 'Genul este obligatoriu';
    }

    // Phone validation
    const primaryPhone = formData.phones?.[0]?.number;
    if (primaryPhone) {
      const phoneValidation = validateRomanianPhone(primaryPhone);
      if (!phoneValidation.valid) {
        newErrors.phone = phoneValidation.error || 'Numar de telefon invalid';
      }
    }

    // Email validation
    const primaryEmail = formData.emails?.[0]?.address;
    if (primaryEmail) {
      const emailValidation = validateEmail(primaryEmail);
      if (!emailValidation.valid) {
        newErrors.email = emailValidation.error || 'Email invalid';
      }
    }

    // GDPR consent required for new patients
    if (mode === 'create' && !formData.gdprConsent) {
      newErrors.gdprConsent = 'Consimtamantul GDPR este obligatoriu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Build the nested structure expected by backend
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
        phones: formData.phones?.filter((p) => p.number.trim()),
        emails: formData.emails?.filter((e) => e.address.trim()),
        addresses: formData.address?.street
          ? [
              {
                street: formData.address.street,
                street2: formData.address.street2,
                city: formData.address.city || '',
                state: formData.address.state || '',
                postalCode: formData.address.postalCode || '',
                country: formData.address.country,
                isPrimary: true,
              },
            ]
          : undefined,
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

  const updateField = <K extends keyof PatientFormState>(
    field: K,
    value: PatientFormState[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const updatePhone = (index: number, value: string) => {
    const newPhones = [...formData.phones];
    newPhones[index] = { ...newPhones[index], number: value };
    updateField('phones', newPhones);
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...formData.emails];
    newEmails[index] = { ...newEmails[index], address: value };
    updateField('emails', newEmails);
  };

  const updateAddress = (field: keyof AddressDto, value: string) => {
    updateField('address', { ...formData.address, [field]: value });
  };

  const updateEmergencyContact = (field: keyof EmergencyContactDto, value: string) => {
    updateField('emergencyContact', {
      ...formData.emergencyContact,
      [field]: value,
    } as EmergencyContactDto);
  };

  const addAllergy = () => {
    updateField('alerts', {
      ...formData.alerts,
      allergies: [...formData.alerts.allergies, { allergen: '', severity: 'mild' }],
    });
  };

  const updateAllergy = (index: number, field: keyof AllergyDto, value: string) => {
    const newAllergies = [...formData.alerts.allergies];
    newAllergies[index] = { ...newAllergies[index], [field]: value };
    updateField('alerts', { ...formData.alerts, allergies: newAllergies });
  };

  const removeAllergy = (index: number) => {
    const newAllergies = formData.alerts.allergies.filter((_, i) => i !== index);
    updateField('alerts', { ...formData.alerts, allergies: newAllergies });
  };

  const addMedicalCondition = () => {
    updateField('alerts', {
      ...formData.alerts,
      medicalConditions: [
        ...formData.alerts.medicalConditions,
        { condition: '', icd10Code: '', status: 'active' },
      ],
    });
  };

  const updateMedicalCondition = (
    index: number,
    field: keyof MedicalConditionDto,
    value: string
  ) => {
    const newConditions = [...formData.alerts.medicalConditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    updateField('alerts', { ...formData.alerts, medicalConditions: newConditions });
  };

  const removeMedicalCondition = (index: number) => {
    const newConditions = formData.alerts.medicalConditions.filter((_, i) => i !== index);
    updateField('alerts', { ...formData.alerts, medicalConditions: newConditions });
  };

  const addMedication = () => {
    updateField('alerts', {
      ...formData.alerts,
      medications: [...formData.alerts.medications, { name: '', dosage: '', frequency: '' }],
    });
  };

  const updateMedication = (index: number, field: keyof MedicationDto, value: string) => {
    const newMedications = [...formData.alerts.medications];
    newMedications[index] = { ...newMedications[index], [field]: value };
    updateField('alerts', { ...formData.alerts, medications: newMedications });
  };

  const removeMedication = (index: number) => {
    const newMedications = formData.alerts.medications.filter((_, i) => i !== index);
    updateField('alerts', { ...formData.alerts, medications: newMedications });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Personal Information Section */}
      <div className="card">
        <div
          className="card-header cursor-pointer"
          onClick={() => toggleSection('personal')}
          style={{ cursor: 'pointer' }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <i className="ti ti-user fs-20 text-primary"></i>
              <h5 className="mb-0">Informatii Personale</h5>
            </div>
            <i
              className={`ti ti-chevron-${expandedSections.personal ? 'up' : 'down'} fs-20`}
            ></i>
          </div>
        </div>
        {expandedSections.personal && (
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <Input
                  label="Prenume"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  error={errors.firstName}
                  required
                  autoComplete="given-name"
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
                  helperText="Cum doriți să fie adresat pacientul"
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
                  helperText="Data nașterii și genul vor fi completate automat"
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
                    { value: '', label: 'Selectează', disabled: true },
                    { value: 'male', label: 'Bărbat' },
                    { value: 'female', label: 'Femeie' },
                    { value: 'other', label: 'Altul' },
                    { value: 'prefer_not_to_say', label: 'Prefer să nu spun' },
                  ]}
                  error={errors.gender}
                  required
                />
              </div>
              <div className="col-md-6">
                <Input
                  label="Naționalitate"
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => updateField('nationality', e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <Input
                  label="Ocupație"
                  type="text"
                  value={formData.occupation || ''}
                  onChange={(e) => updateField('occupation', e.target.value || undefined)}
                />
              </div>
              <div className="col-md-6">
                <Input
                  label="Angajator"
                  type="text"
                  value={formData.employer || ''}
                  onChange={(e) => updateField('employer', e.target.value || undefined)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Information Section */}
      <div className="card">
        <div
          className="card-header cursor-pointer"
          onClick={() => toggleSection('contact')}
          style={{ cursor: 'pointer' }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <i className="ti ti-phone fs-20 text-primary"></i>
              <h5 className="mb-0">Informatii Contact</h5>
            </div>
            <i
              className={`ti ti-chevron-${expandedSections.contact ? 'up' : 'down'} fs-20`}
            ></i>
          </div>
        </div>
        {expandedSections.contact && (
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <Input
                  label="Telefon Principal"
                  type="tel"
                  value={formData.phones?.[0]?.number || ''}
                  onChange={(e) => updatePhone(0, e.target.value)}
                  error={errors.phone}
                  helperText="Format: +40xxxxxxxxx sau 07xxxxxxxx"
                  autoComplete="tel"
                />
              </div>
              <div className="col-md-6">
                <Input
                  label="Email Principal"
                  type="email"
                  value={formData.emails?.[0]?.address || ''}
                  onChange={(e) => updateEmail(0, e.target.value)}
                  error={errors.email}
                  autoComplete="email"
                />
              </div>
              <div className="col-md-6">
                <Input
                  label="WhatsApp"
                  type="tel"
                  value={formData.whatsappNumber || ''}
                  onChange={(e) => updateField('whatsappNumber', e.target.value || undefined)}
                  disabled={formData.whatsappSameAsPrimary}
                />
                <div className="form-check mt-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="whatsappSame"
                    checked={formData.whatsappSameAsPrimary}
                    onChange={(e) =>
                      updateField('whatsappSameAsPrimary', e.target.checked)
                    }
                  />
                  <label className="form-check-label" htmlFor="whatsappSame">
                    Folosește numărul principal
                  </label>
                </div>
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
                  options={CONTACT_METHODS}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Address Section */}
      <div className="card">
        <div
          className="card-header cursor-pointer"
          onClick={() => toggleSection('address')}
          style={{ cursor: 'pointer' }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <i className="ti ti-map-pin fs-20 text-primary"></i>
              <h5 className="mb-0">Adresă</h5>
            </div>
            <i
              className={`ti ti-chevron-${expandedSections.address ? 'up' : 'down'} fs-20`}
            ></i>
          </div>
        </div>
        {expandedSections.address && (
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12">
                <Input
                  label="Strada și Număr"
                  type="text"
                  value={formData.address?.street || ''}
                  onChange={(e) => updateAddress('street', e.target.value)}
                  autoComplete="street-address"
                />
              </div>
              <div className="col-md-4">
                <Input
                  label="Oraș"
                  type="text"
                  value={formData.address?.city || ''}
                  onChange={(e) => updateAddress('city', e.target.value)}
                  autoComplete="address-level2"
                />
              </div>
              <div className="col-md-4">
                <Select
                  label="Județ"
                  value={formData.address?.state || ''}
                  onChange={(e) => updateAddress('state', e.target.value)}
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
                  value={formData.address?.postalCode || ''}
                  onChange={(e) => updateAddress('postalCode', e.target.value)}
                  autoComplete="postal-code"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Contact Section */}
      <div className="card">
        <div
          className="card-header cursor-pointer"
          onClick={() => toggleSection('emergency')}
          style={{ cursor: 'pointer' }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <i className="ti ti-alert-circle fs-20 text-warning"></i>
              <h5 className="mb-0">Contact Urgență</h5>
            </div>
            <i
              className={`ti ti-chevron-${expandedSections.emergency ? 'up' : 'down'} fs-20`}
            ></i>
          </div>
        </div>
        {expandedSections.emergency && (
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <Input
                  label="Nume"
                  type="text"
                  value={formData.emergencyContact?.name || ''}
                  onChange={(e) => updateEmergencyContact('name', e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <Select
                  label="Relație"
                  value={formData.emergencyContact?.relationship || ''}
                  onChange={(e) => updateEmergencyContact('relationship', e.target.value)}
                  options={[
                    { value: '', label: 'Selectează' },
                    ...EMERGENCY_CONTACT_RELATIONSHIPS,
                  ]}
                />
              </div>
              <div className="col-md-4">
                <Input
                  label="Telefon"
                  type="tel"
                  value={formData.emergencyContact?.phone || ''}
                  onChange={(e) => updateEmergencyContact('phone', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Medical Alerts Section */}
      <div className="card border-danger">
        <div
          className="card-header bg-danger-transparent cursor-pointer"
          onClick={() => toggleSection('medical')}
          style={{ cursor: 'pointer' }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <i className="ti ti-alert-triangle fs-20 text-danger"></i>
              <h5 className="mb-0 text-danger">Alerte Medicale</h5>
            </div>
            <i
              className={`ti ti-chevron-${expandedSections.medical ? 'up' : 'down'} fs-20`}
            ></i>
          </div>
        </div>
        {expandedSections.medical && (
          <div className="card-body">
            {/* Allergies */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Alergii</h6>
                <Button type="button" variant="soft-danger" size="sm" onClick={addAllergy}>
                  <i className="ti ti-plus me-1"></i>
                  Adaugă Alergie
                </Button>
              </div>
              {formData.alerts.allergies.map((allergy, index) => (
                <div key={index} className="row g-2 mb-2 align-items-end">
                  <div className="col-md-5">
                    <Input
                      label={index === 0 ? 'Alergen' : ''}
                      type="text"
                      value={allergy.allergen}
                      onChange={(e) => updateAllergy(index, 'allergen', e.target.value)}
                      placeholder="ex: Penicilină, Latex"
                    />
                  </div>
                  <div className="col-md-3">
                    <Select
                      label={index === 0 ? 'Severitate' : ''}
                      value={allergy.severity || 'mild'}
                      onChange={(e) => updateAllergy(index, 'severity', e.target.value)}
                      options={ALLERGY_SEVERITY_LEVELS}
                    />
                  </div>
                  <div className="col-md-3">
                    <Input
                      label={index === 0 ? 'Reacție' : ''}
                      type="text"
                      value={allergy.reaction || ''}
                      onChange={(e) => updateAllergy(index, 'reaction', e.target.value)}
                      placeholder="ex: Erupție cutanată"
                    />
                  </div>
                  <div className="col-md-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAllergy(index)}
                      className="text-danger"
                    >
                      <i className="ti ti-trash"></i>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Medical Conditions */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Afecțiuni Medicale</h6>
                <Button
                  type="button"
                  variant="soft-warning"
                  size="sm"
                  onClick={addMedicalCondition}
                >
                  <i className="ti ti-plus me-1"></i>
                  Adaugă Afecțiune
                </Button>
              </div>
              {formData.alerts.medicalConditions.map((condition, index) => (
                <div key={index} className="row g-2 mb-2 align-items-end">
                  <div className="col-md-5">
                    <Input
                      label={index === 0 ? 'Afecțiune' : ''}
                      type="text"
                      value={condition.condition}
                      onChange={(e) =>
                        updateMedicalCondition(index, 'condition', e.target.value)
                      }
                      placeholder="ex: Diabet zaharat"
                    />
                  </div>
                  <div className="col-md-3">
                    <Input
                      label={index === 0 ? 'Cod ICD-10' : ''}
                      type="text"
                      value={condition.icd10Code || ''}
                      onChange={(e) =>
                        updateMedicalCondition(index, 'icd10Code', e.target.value)
                      }
                      placeholder="ex: E11"
                    />
                  </div>
                  <div className="col-md-3">
                    <Input
                      label={index === 0 ? 'Status' : ''}
                      type="text"
                      value={condition.status || ''}
                      onChange={(e) => updateMedicalCondition(index, 'status', e.target.value)}
                      placeholder="ex: Activ, Sub control"
                    />
                  </div>
                  <div className="col-md-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedicalCondition(index)}
                      className="text-danger"
                    >
                      <i className="ti ti-trash"></i>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Current Medications */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Medicamente Curente</h6>
                <Button type="button" variant="soft-info" size="sm" onClick={addMedication}>
                  <i className="ti ti-plus me-1"></i>
                  Adaugă Medicament
                </Button>
              </div>
              {formData.alerts.medications.map((medication, index) => (
                <div key={index} className="row g-2 mb-2 align-items-end">
                  <div className="col-md-4">
                    <Input
                      label={index === 0 ? 'Medicament' : ''}
                      type="text"
                      value={medication.name}
                      onChange={(e) => updateMedication(index, 'name', e.target.value)}
                      placeholder="ex: Aspirină"
                    />
                  </div>
                  <div className="col-md-3">
                    <Input
                      label={index === 0 ? 'Doză' : ''}
                      type="text"
                      value={medication.dosage || ''}
                      onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                      placeholder="ex: 500mg"
                    />
                  </div>
                  <div className="col-md-4">
                    <Input
                      label={index === 0 ? 'Frecvență' : ''}
                      type="text"
                      value={medication.frequency || ''}
                      onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                      placeholder="ex: 2x pe zi"
                    />
                  </div>
                  <div className="col-md-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedication(index)}
                      className="text-danger"
                    >
                      <i className="ti ti-trash"></i>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Patient Flags */}
            <div>
              <h6 className="mb-3">Indicatori Pacient</h6>
              <MultiSelect
                options={PATIENT_FLAGS.map((flag) => ({
                  value: flag.value,
                  label: flag.label,
                }))}
                value={formData.alerts.flags}
                onChange={(values) =>
                  updateField('alerts', { ...formData.alerts, flags: values })
                }
                placeholder="Selectează indicatori"
              />
            </div>
          </div>
        )}
      </div>

      {/* Insurance Section */}
      <div className="card">
        <div
          className="card-header cursor-pointer"
          onClick={() => toggleSection('insurance')}
          style={{ cursor: 'pointer' }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <i className="ti ti-shield-check fs-20 text-success"></i>
              <h5 className="mb-0">Asigurare Medicală</h5>
            </div>
            <i
              className={`ti ti-chevron-${expandedSections.insurance ? 'up' : 'down'} fs-20`}
            ></i>
          </div>
        </div>
        {expandedSections.insurance && (
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <Input
                  label="Furnizor Asigurare"
                  type="text"
                  value={formData.insurance?.provider || ''}
                  onChange={(e) =>
                    updateField('insurance', {
                      ...formData.insurance,
                      provider: e.target.value,
                    })
                  }
                  placeholder="ex: Regina Maria, Medlife"
                />
              </div>
              <div className="col-md-6">
                <Input
                  label="Număr Poliță"
                  type="text"
                  value={formData.insurance?.policyNumber || ''}
                  onChange={(e) =>
                    updateField('insurance', {
                      ...formData.insurance,
                      policyNumber: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GDPR Consent Section */}
      <div className="card border-primary">
        <div
          className="card-header bg-primary-transparent cursor-pointer"
          onClick={() => toggleSection('gdpr')}
          style={{ cursor: 'pointer' }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <i className="ti ti-lock fs-20 text-primary"></i>
              <h5 className="mb-0">Consimțământ GDPR</h5>
            </div>
            <i
              className={`ti ti-chevron-${expandedSections.gdpr ? 'up' : 'down'} fs-20`}
            ></i>
          </div>
        </div>
        {expandedSections.gdpr && (
          <div className="card-body">
            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="gdprConsent"
                checked={formData.gdprConsent}
                onChange={(e) => updateField('gdprConsent', e.target.checked)}
                required={mode === 'create'}
              />
              <label className="form-check-label" htmlFor="gdprConsent">
                <strong>Consimțământ Procesare Date (OBLIGATORIU)</strong>
                <p className="text-muted small mb-0">
                  Accept procesarea datelor mele personale conform GDPR și reglementărilor locale
                </p>
              </label>
              {errors.gdprConsent && (
                <div className="text-danger small mt-1">{errors.gdprConsent}</div>
              )}
            </div>
            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="marketingConsent"
                checked={formData.marketingConsent}
                onChange={(e) => updateField('marketingConsent', e.target.checked)}
              />
              <label className="form-check-label" htmlFor="marketingConsent">
                Consimțământ Marketing
                <p className="text-muted small mb-0">
                  Accept să primesc comunicări promoționale
                </p>
              </label>
            </div>
            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="smsReminders"
                checked={formData.smsRemindersConsent}
                onChange={(e) => updateField('smsRemindersConsent', e.target.checked)}
              />
              <label className="form-check-label" htmlFor="smsReminders">
                Consimțământ Reminder SMS
                <p className="text-muted small mb-0">
                  Accept să primesc memento-uri prin SMS
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
                Consimțământ Reminder Email
                <p className="text-muted small mb-0">
                  Accept să primesc memento-uri prin email
                </p>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Additional Information Section */}
      <div className="card">
        <div
          className="card-header cursor-pointer"
          onClick={() => toggleSection('additional')}
          style={{ cursor: 'pointer' }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <i className="ti ti-notes fs-20 text-secondary"></i>
              <h5 className="mb-0">Informații Adiționale</h5>
            </div>
            <i
              className={`ti ti-chevron-${expandedSections.additional ? 'up' : 'down'} fs-20`}
            ></i>
          </div>
        </div>
        {expandedSections.additional && (
          <div className="card-body">
            <Textarea
              label="Note"
              value={formData.notes || ''}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={4}
              placeholder="Orice informații adiționale relevante despre pacient..."
            />
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="d-flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Salvare...
            </>
          ) : (
            <>
              <i className="ti ti-check me-2"></i>
              {mode === 'create' ? 'Creează Pacient' : 'Salvează Modificări'}
            </>
          )}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          <i className="ti ti-x me-2"></i>
          Anulează
        </Button>
      </div>
    </form>
  );
}
