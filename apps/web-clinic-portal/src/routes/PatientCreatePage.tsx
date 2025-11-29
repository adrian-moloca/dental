/**
 * Patient Registration Wizard - DentalOS
 *
 * Multi-step patient registration form with:
 * - 5 steps: Personal Data, Contact Info, Emergency Contact, Medical Info, Confirmation
 * - CNP validation and auto-extraction (birth date, gender)
 * - Form validation per step
 * - Save draft functionality
 * - GDPR consent management
 * - Romanian labels and messages
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCreatePatient } from '../hooks/usePatients';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader, CardBody, CardFooter } from '../components/ui-new/Card';
import { Button } from '../components/ui-new/Button';
import { Input, Textarea } from '../components/ui-new/Input';
import { Badge } from '../components/ui-new/Badge';
import type { CreatePatientDto, EmergencyContactDto } from '../types/patient.types';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

// CNP Validation and extraction utilities
const validateCNP = (cnp: string): boolean => {
  if (!/^\d{13}$/.test(cnp)) return false;

  const weights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
  const sum = cnp.slice(0, 12).split('').reduce((acc, digit, idx) => {
    return acc + parseInt(digit) * weights[idx];
  }, 0);

  const checkDigit = sum % 11 === 10 ? 1 : sum % 11;
  return checkDigit === parseInt(cnp[12]);
};

const extractDataFromCNP = (cnp: string): { dateOfBirth: Date | null; gender: 'male' | 'female' | null } => {
  if (!validateCNP(cnp)) return { dateOfBirth: null, gender: null };

  const s = parseInt(cnp[0]);
  const yy = parseInt(cnp.substring(1, 3));
  const mm = parseInt(cnp.substring(3, 5));
  const dd = parseInt(cnp.substring(5, 7));

  // Determine century and gender
  let year: number;
  let gender: 'male' | 'female';

  if (s === 1 || s === 2) {
    year = 1900 + yy;
    gender = s === 1 ? 'male' : 'female';
  } else if (s === 3 || s === 4) {
    year = 1800 + yy;
    gender = s === 3 ? 'male' : 'female';
  } else if (s === 5 || s === 6) {
    year = 2000 + yy;
    gender = s === 5 ? 'male' : 'female';
  } else if (s === 7 || s === 8) {
    // Resident foreigner
    year = 2000 + yy;
    gender = s === 7 ? 'male' : 'female';
  } else {
    return { dateOfBirth: null, gender: null };
  }

  const dateOfBirth = new Date(year, mm - 1, dd);
  return { dateOfBirth, gender };
};

// Form state interface
interface WizardFormData {
  // Step 1: Personal Data
  firstName: string;
  lastName: string;
  cnp: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | '';
  photoFile: File | null;

  // Step 2: Contact Information
  primaryPhone: string;
  secondaryPhone: string;
  email: string;
  street: string;
  street2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;

  // Step 3: Emergency Contact
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;

  // Step 4: Medical Information
  allergies: string[];
  medicalConditions: string[];
  currentMedications: string;
  specialNotes: string;

  // Step 5: Consent
  gdprConsent: boolean;
  marketingConsent: boolean;
  termsAccepted: boolean;
}

const initialFormData: WizardFormData = {
  firstName: '',
  lastName: '',
  cnp: '',
  dateOfBirth: '',
  gender: '',
  photoFile: null,
  primaryPhone: '',
  secondaryPhone: '',
  email: '',
  street: '',
  street2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Romania',
  emergencyName: '',
  emergencyRelationship: '',
  emergencyPhone: '',
  allergies: [],
  medicalConditions: [],
  currentMedications: '',
  specialNotes: '',
  gdprConsent: false,
  marketingConsent: false,
  termsAccepted: false,
};

const STEPS = [
  { number: 1, title: 'Date Personale', icon: 'ti ti-user' },
  { number: 2, title: 'Date Contact', icon: 'ti ti-phone' },
  { number: 3, title: 'Contact Urgenta', icon: 'ti ti-shield-check' },
  { number: 4, title: 'Informatii Medicale', icon: 'ti ti-heart-plus' },
  { number: 5, title: 'Confirmare', icon: 'ti ti-check' },
];

const RELATIONSHIP_OPTIONS = [
  'Sot/Sotie',
  'Mama',
  'Tata',
  'Fiu/Fiica',
  'Frate/Sora',
  'Bunic/Bunica',
  'Prieten/Prietena',
  'Altul',
];

const COMMON_ALLERGIES = [
  'Penicilina',
  'Latex',
  'Anestezice locale',
  'Aspirina',
  'Ibuprofen',
  'Lidocaina',
  'Metale (nichel, cobalt)',
  'Alte medicamente',
];

const COMMON_CONDITIONS = [
  'Diabet',
  'Hipertensiune',
  'Afectiuni cardiace',
  'Astm',
  'Epilepsie',
  'Probleme de coagulare',
  'Osteoporoza',
  'Imunitate scazuta',
  'Sarcina',
];

export default function PatientCreatePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const createPatient = useCreatePatient();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newAllergyInput, setNewAllergyInput] = useState('');
  const [newConditionInput, setNewConditionInput] = useState('');

  // CNP auto-extraction effect
  useEffect(() => {
    if (formData.cnp.length === 13 && validateCNP(formData.cnp)) {
      const { dateOfBirth, gender } = extractDataFromCNP(formData.cnp);
      if (dateOfBirth && gender) {
        setFormData(prev => ({
          ...prev,
          dateOfBirth: dateOfBirth.toISOString().split('T')[0],
          gender,
        }));
        toast.success('Data nasterii si genul au fost extrase automat din CNP');
      }
    }
  }, [formData.cnp]);

  const updateField = <K extends keyof WizardFormData>(field: K, value: WizardFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.firstName.trim()) {
          newErrors.firstName = 'Prenumele este obligatoriu';
        }
        if (!formData.lastName.trim()) {
          newErrors.lastName = 'Numele este obligatoriu';
        }
        if (!formData.dateOfBirth) {
          newErrors.dateOfBirth = 'Data nasterii este obligatorie';
        }
        if (!formData.gender) {
          newErrors.gender = 'Genul este obligatoriu';
        }
        if (formData.cnp && !validateCNP(formData.cnp)) {
          newErrors.cnp = 'CNP invalid (trebuie sa contina 13 cifre)';
        }
        break;

      case 2:
        if (!formData.primaryPhone.trim()) {
          newErrors.primaryPhone = 'Telefonul principal este obligatoriu';
        } else if (!/^[\d\s\-+()]{10,}$/.test(formData.primaryPhone)) {
          newErrors.primaryPhone = 'Format telefon invalid';
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Adresa de email invalida';
        }
        break;

      case 3:
        // Emergency contact is optional, but validate if provided
        if (formData.emergencyName && !formData.emergencyPhone) {
          newErrors.emergencyPhone = 'Telefonul contactului de urgenta este necesar';
        }
        if (formData.emergencyPhone && !/^[\d\s\-+()]{10,}$/.test(formData.emergencyPhone)) {
          newErrors.emergencyPhone = 'Format telefon invalid';
        }
        break;

      case 4:
        // Medical information is all optional
        break;

      case 5:
        if (!formData.gdprConsent) {
          newErrors.gdprConsent = 'Consimtamantul GDPR este obligatoriu';
        }
        if (!formData.termsAccepted) {
          newErrors.termsAccepted = 'Trebuie sa acceptati termenii si conditiile';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast.error('Completeaza toate campurile obligatorii');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipStep = () => {
    if (currentStep === 3 || currentStep === 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem('patientDraft', JSON.stringify(formData));
    toast.success('Progresul a fost salvat');
  };

  const handleLoadDraft = () => {
    const draft = localStorage.getItem('patientDraft');
    if (draft) {
      setFormData(JSON.parse(draft));
      toast.success('Progresul a fost incarcat');
    }
  };

  const addAllergy = () => {
    if (newAllergyInput.trim() && !formData.allergies.includes(newAllergyInput.trim())) {
      updateField('allergies', [...formData.allergies, newAllergyInput.trim()]);
      setNewAllergyInput('');
    }
  };

  const removeAllergy = (allergy: string) => {
    updateField('allergies', formData.allergies.filter(a => a !== allergy));
  };

  const addCondition = () => {
    if (newConditionInput.trim() && !formData.medicalConditions.includes(newConditionInput.trim())) {
      updateField('medicalConditions', [...formData.medicalConditions, newConditionInput.trim()]);
      setNewConditionInput('');
    }
  };

  const removeCondition = (condition: string) => {
    updateField('medicalConditions', formData.medicalConditions.filter(c => c !== condition));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      toast.error('Completeaza toate campurile obligatorii');
      return;
    }

    try {
      const submitData: CreatePatientDto = {
        clinicId: user?.clinicId || user?.organizationId || 'default-clinic',
        person: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: new Date(formData.dateOfBirth),
          gender: formData.gender as 'male' | 'female' | 'other' | 'prefer_not_to_say',
          cnp: formData.cnp || undefined,
        },
        contacts: {
          phones: [
            { type: 'mobile', number: formData.primaryPhone, isPrimary: true },
            ...(formData.secondaryPhone ? [{ type: 'home' as const, number: formData.secondaryPhone, isPrimary: false }] : []),
          ],
          emails: formData.email ? [{ type: 'personal' as const, address: formData.email, isPrimary: true }] : [],
          addresses: formData.street ? [{
            street: formData.street,
            street2: formData.street2 || undefined,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
            isPrimary: true,
          }] : undefined,
        },
        consent: {
          gdprConsent: formData.gdprConsent,
          marketingConsent: formData.marketingConsent,
        },
        notes: [
          formData.specialNotes,
          formData.currentMedications && `Medicatie curenta: ${formData.currentMedications}`,
          formData.allergies.length > 0 && `Alergii: ${formData.allergies.join(', ')}`,
          formData.medicalConditions.length > 0 && `Afectiuni: ${formData.medicalConditions.join(', ')}`,
        ].filter(Boolean).join('\n\n') || undefined,
      };

      // Add emergency contact if provided
      if (formData.emergencyName && formData.emergencyPhone) {
        const emergencyContact: EmergencyContactDto = {
          name: formData.emergencyName,
          relationship: formData.emergencyRelationship || 'Altul',
          phone: formData.emergencyPhone,
        };

        if (!submitData.contacts) {
          submitData.contacts = {};
        }
        // Note: Backend schema needs to support emergencyContact
        // For now, we'll add it to notes
        submitData.notes = (submitData.notes || '') +
          `\n\nContact Urgenta: ${emergencyContact.name} (${emergencyContact.relationship}) - ${emergencyContact.phone}`;
      }

      const patient = await createPatient.mutateAsync(submitData);

      if (patient?.id) {
        localStorage.removeItem('patientDraft');
        toast.success('Pacient inregistrat cu succes!');

        // Show success modal with options
        const action = await showSuccessOptions();
        handlePostSubmitAction(action, patient.id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare la inregistrarea pacientului';
      toast.error(message);
      console.error('Patient creation error:', error);
    }
  };

  const showSuccessOptions = (): Promise<'view' | 'schedule' | 'another'> => {
    return new Promise((resolve) => {
      // For now, just navigate to view - in production, show a modal
      setTimeout(() => resolve('view'), 100);
    });
  };

  const handlePostSubmitAction = (action: 'view' | 'schedule' | 'another', patientId: string) => {
    switch (action) {
      case 'view':
        navigate(`/patients/${patientId}`);
        break;
      case 'schedule':
        navigate(`/appointments/create?patientId=${patientId}`);
        break;
      case 'another':
        setFormData(initialFormData);
        setCurrentStep(1);
        break;
    }
  };

  const renderProgressStepper = () => (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center">
        {STEPS.map((step, index) => (
          <div key={step.number} className="d-flex align-items-center flex-fill">
            <div className="d-flex flex-column align-items-center" style={{ minWidth: '80px' }}>
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center ${
                  currentStep === step.number
                    ? 'bg-primary text-white'
                    : currentStep > step.number
                    ? 'bg-success text-white'
                    : 'bg-light text-muted'
                }`}
                style={{ width: '48px', height: '48px' }}
              >
                {currentStep > step.number ? (
                  <i className="ti ti-check fs-5"></i>
                ) : (
                  <i className={`${step.icon} fs-5`}></i>
                )}
              </div>
              <small className={`mt-2 text-center ${currentStep === step.number ? 'fw-semibold text-primary' : 'text-muted'}`}>
                {step.title}
              </small>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`flex-fill mx-2 ${currentStep > step.number ? 'bg-success' : 'bg-light'}`}
                style={{ height: '3px' }}
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="row g-4">
      <div className="col-md-6">
        <Input
          label="Prenume"
          value={formData.firstName}
          onChange={(e) => updateField('firstName', e.target.value)}
          error={errors.firstName}
          required
          placeholder="Introdu prenumele"
        />
      </div>
      <div className="col-md-6">
        <Input
          label="Nume"
          value={formData.lastName}
          onChange={(e) => updateField('lastName', e.target.value)}
          error={errors.lastName}
          required
          placeholder="Introdu numele"
        />
      </div>

      <div className="col-md-6">
        <Input
          label="CNP"
          value={formData.cnp}
          onChange={(e) => updateField('cnp', e.target.value)}
          error={errors.cnp}
          helperText="Optional - data nasterii si genul vor fi extrase automat"
          placeholder="1234567890123"
          maxLength={13}
        />
      </div>

      <div className="col-md-6">
        <Input
          label="Data Nasterii"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => updateField('dateOfBirth', e.target.value)}
          error={errors.dateOfBirth}
          required
        />
      </div>

      <div className="col-md-6">
        <div className="form-group">
          <label className="form-label">
            Gen <span className="text-danger">*</span>
          </label>
          <select
            className={`form-control ${errors.gender ? 'is-invalid' : ''}`}
            value={formData.gender}
            onChange={(e) => updateField('gender', e.target.value as WizardFormData['gender'])}
          >
            <option value="">Selecteaza genul</option>
            <option value="male">Masculin</option>
            <option value="female">Feminin</option>
            <option value="other">Altul</option>
            <option value="prefer_not_to_say">Prefer sa nu spun</option>
          </select>
          {errors.gender && (
            <div className="invalid-feedback d-flex align-items-center gap-1" style={{ display: 'block' }}>
              <i className="ti ti-alert-circle"></i>
              <span>{errors.gender}</span>
            </div>
          )}
        </div>
      </div>

      <div className="col-md-6">
        <div className="form-group">
          <label className="form-label">Fotografie Profil (Optional)</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={(e) => updateField('photoFile', e.target.files?.[0] || null)}
          />
          <small className="form-text text-muted">Formate acceptate: JPG, PNG (max 5MB)</small>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="row g-4">
      <div className="col-md-6">
        <Input
          label="Telefon Principal"
          type="tel"
          value={formData.primaryPhone}
          onChange={(e) => updateField('primaryPhone', e.target.value)}
          error={errors.primaryPhone}
          required
          placeholder="+40 712 345 678"
          icon="ti ti-phone"
        />
      </div>
      <div className="col-md-6">
        <Input
          label="Telefon Secundar"
          type="tel"
          value={formData.secondaryPhone}
          onChange={(e) => updateField('secondaryPhone', e.target.value)}
          placeholder="+40 712 345 679"
          icon="ti ti-phone"
        />
      </div>

      <div className="col-12">
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          error={errors.email}
          placeholder="exemplu@email.ro"
          icon="ti ti-mail"
        />
      </div>

      <div className="col-12">
        <h6 className="mb-3 text-muted">Adresa (Optional)</h6>
      </div>

      <div className="col-12">
        <Input
          label="Strada si Numar"
          value={formData.street}
          onChange={(e) => updateField('street', e.target.value)}
          placeholder="Str. Exemplu, nr. 123"
        />
      </div>

      <div className="col-12">
        <Input
          label="Bloc, Scara, Apartament"
          value={formData.street2}
          onChange={(e) => updateField('street2', e.target.value)}
          placeholder="Bl. A, Sc. 2, Ap. 45"
        />
      </div>

      <div className="col-md-4">
        <Input
          label="Oras"
          value={formData.city}
          onChange={(e) => updateField('city', e.target.value)}
          placeholder="Bucuresti"
        />
      </div>

      <div className="col-md-4">
        <Input
          label="Judet"
          value={formData.state}
          onChange={(e) => updateField('state', e.target.value)}
          placeholder="Bucuresti"
        />
      </div>

      <div className="col-md-4">
        <Input
          label="Cod Postal"
          value={formData.postalCode}
          onChange={(e) => updateField('postalCode', e.target.value)}
          placeholder="012345"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="row g-4">
      <div className="col-12">
        <div className="alert alert-info d-flex align-items-center gap-2">
          <i className="ti ti-info-circle"></i>
          <span>Informatiile de contact de urgenta sunt optionale, dar recomandate pentru situatii de urgenta.</span>
        </div>
      </div>

      <div className="col-md-6">
        <Input
          label="Nume Contact Urgenta"
          value={formData.emergencyName}
          onChange={(e) => updateField('emergencyName', e.target.value)}
          placeholder="Ion Popescu"
          icon="ti ti-user"
        />
      </div>

      <div className="col-md-6">
        <div className="form-group">
          <label className="form-label">Relatie</label>
          <select
            className="form-control"
            value={formData.emergencyRelationship}
            onChange={(e) => updateField('emergencyRelationship', e.target.value)}
          >
            <option value="">Selecteaza relatia</option>
            {RELATIONSHIP_OPTIONS.map((rel) => (
              <option key={rel} value={rel}>
                {rel}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="col-12">
        <Input
          label="Telefon Contact Urgenta"
          type="tel"
          value={formData.emergencyPhone}
          onChange={(e) => updateField('emergencyPhone', e.target.value)}
          error={errors.emergencyPhone}
          placeholder="+40 712 345 678"
          icon="ti ti-phone"
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="row g-4">
      <div className="col-12">
        <div className="alert alert-warning d-flex align-items-center gap-2">
          <i className="ti ti-alert-triangle"></i>
          <span>Informatiile medicale sunt importante pentru siguranta pacientului. Va rugam sa fie cat mai complete.</span>
        </div>
      </div>

      <div className="col-12">
        <div className="form-group">
          <label className="form-label">
            <i className="ti ti-alert-circle me-2"></i>
            Alergii
          </label>
          <div className="mb-2 d-flex flex-wrap gap-2">
            {COMMON_ALLERGIES.map((allergy) => (
              <Badge
                key={allergy}
                variant={formData.allergies.includes(allergy) ? 'soft-danger' : 'outline-secondary'}
                className="cursor-pointer"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (formData.allergies.includes(allergy)) {
                    removeAllergy(allergy);
                  } else {
                    updateField('allergies', [...formData.allergies, allergy]);
                  }
                }}
              >
                {formData.allergies.includes(allergy) && <i className="ti ti-check me-1"></i>}
                {allergy}
              </Badge>
            ))}
          </div>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Adauga o alta alergie..."
              value={newAllergyInput}
              onChange={(e) => setNewAllergyInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
            />
            <Button variant="outline-primary" onClick={addAllergy}>
              <i className="ti ti-plus"></i>
            </Button>
          </div>
          {formData.allergies.length > 0 && (
            <div className="mt-2 d-flex flex-wrap gap-2">
              {formData.allergies.map((allergy) => (
                <Badge key={allergy} variant="soft-danger">
                  {allergy}
                  <i
                    className="ti ti-x ms-1"
                    style={{ cursor: 'pointer' }}
                    onClick={() => removeAllergy(allergy)}
                  ></i>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="col-12">
        <div className="form-group">
          <label className="form-label">
            <i className="ti ti-heart-plus me-2"></i>
            Afectiuni Medicale
          </label>
          <div className="mb-2 d-flex flex-wrap gap-2">
            {COMMON_CONDITIONS.map((condition) => (
              <Badge
                key={condition}
                variant={formData.medicalConditions.includes(condition) ? 'soft-warning' : 'outline-secondary'}
                className="cursor-pointer"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (formData.medicalConditions.includes(condition)) {
                    removeCondition(condition);
                  } else {
                    updateField('medicalConditions', [...formData.medicalConditions, condition]);
                  }
                }}
              >
                {formData.medicalConditions.includes(condition) && <i className="ti ti-check me-1"></i>}
                {condition}
              </Badge>
            ))}
          </div>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Adauga o alta afectiune..."
              value={newConditionInput}
              onChange={(e) => setNewConditionInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
            />
            <Button variant="outline-primary" onClick={addCondition}>
              <i className="ti ti-plus"></i>
            </Button>
          </div>
          {formData.medicalConditions.length > 0 && (
            <div className="mt-2 d-flex flex-wrap gap-2">
              {formData.medicalConditions.map((condition) => (
                <Badge key={condition} variant="soft-warning">
                  {condition}
                  <i
                    className="ti ti-x ms-1"
                    style={{ cursor: 'pointer' }}
                    onClick={() => removeCondition(condition)}
                  ></i>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="col-12">
        <Textarea
          label="Medicatie Curenta"
          value={formData.currentMedications}
          onChange={(e) => updateField('currentMedications', e.target.value)}
          rows={3}
          placeholder="Medicamentele pe care le ia in prezent (nume, doza, frecventa)..."
        />
      </div>

      <div className="col-12">
        <Textarea
          label="Observatii Speciale"
          value={formData.specialNotes}
          onChange={(e) => updateField('specialNotes', e.target.value)}
          rows={3}
          placeholder="Alte informatii relevante pentru tratament..."
        />
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="row g-4">
      <div className="col-12">
        <Card variant="info" className="mb-4">
          <CardHeader>
            <h5 className="mb-0">
              <i className="ti ti-info-circle me-2"></i>
              Rezumat Date Pacient
            </h5>
          </CardHeader>
          <CardBody>
            <div className="row g-3">
              <div className="col-md-6">
                <h6 className="text-muted mb-2">Date Personale</h6>
                <p className="mb-1">
                  <strong>Nume:</strong> {formData.firstName} {formData.lastName}
                </p>
                <p className="mb-1">
                  <strong>CNP:</strong> {formData.cnp || '-'}
                </p>
                <p className="mb-1">
                  <strong>Data Nasterii:</strong> {formData.dateOfBirth || '-'}
                </p>
                <p className="mb-0">
                  <strong>Gen:</strong>{' '}
                  {formData.gender === 'male' ? 'Masculin' : formData.gender === 'female' ? 'Feminin' : formData.gender || '-'}
                </p>
              </div>

              <div className="col-md-6">
                <h6 className="text-muted mb-2">Date Contact</h6>
                <p className="mb-1">
                  <strong>Telefon:</strong> {formData.primaryPhone}
                </p>
                {formData.secondaryPhone && (
                  <p className="mb-1">
                    <strong>Telefon Secundar:</strong> {formData.secondaryPhone}
                  </p>
                )}
                {formData.email && (
                  <p className="mb-1">
                    <strong>Email:</strong> {formData.email}
                  </p>
                )}
                {formData.street && (
                  <p className="mb-0">
                    <strong>Adresa:</strong> {formData.street}, {formData.city}
                  </p>
                )}
              </div>

              {formData.emergencyName && (
                <div className="col-12">
                  <h6 className="text-muted mb-2">Contact Urgenta</h6>
                  <p className="mb-0">
                    {formData.emergencyName} ({formData.emergencyRelationship || 'Altul'}) - {formData.emergencyPhone}
                  </p>
                </div>
              )}

              {(formData.allergies.length > 0 || formData.medicalConditions.length > 0) && (
                <div className="col-12">
                  <h6 className="text-muted mb-2">Informatii Medicale</h6>
                  {formData.allergies.length > 0 && (
                    <p className="mb-1">
                      <strong>Alergii:</strong> {formData.allergies.join(', ')}
                    </p>
                  )}
                  {formData.medicalConditions.length > 0 && (
                    <p className="mb-0">
                      <strong>Afectiuni:</strong> {formData.medicalConditions.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            id="gdprConsent"
            checked={formData.gdprConsent}
            onChange={(e) => updateField('gdprConsent', e.target.checked)}
          />
          <label className="form-check-label" htmlFor="gdprConsent">
            <strong>Accept procesarea datelor personale conform GDPR</strong>
            <span className="text-danger ms-1">*</span>
            <br />
            <small className="text-muted">
              Confirm ca am citit si sunt de acord cu{' '}
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                politica de confidentialitate
              </a>
              .
            </small>
          </label>
        </div>
        {errors.gdprConsent && (
          <div className="text-danger small mb-3">
            <i className="ti ti-alert-circle me-1"></i>
            {errors.gdprConsent}
          </div>
        )}

        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            id="marketingConsent"
            checked={formData.marketingConsent}
            onChange={(e) => updateField('marketingConsent', e.target.checked)}
          />
          <label className="form-check-label" htmlFor="marketingConsent">
            Accept sa primesc comunicari de marketing (SMS, Email, WhatsApp)
            <br />
            <small className="text-muted">Optional - puteti retrage consimtamantul oricand</small>
          </label>
        </div>

        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            id="termsAccepted"
            checked={formData.termsAccepted}
            onChange={(e) => updateField('termsAccepted', e.target.checked)}
          />
          <label className="form-check-label" htmlFor="termsAccepted">
            <strong>Accept termenii si conditiile</strong>
            <span className="text-danger ms-1">*</span>
            <br />
            <small className="text-muted">
              Am citit si sunt de acord cu{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer">
                termenii si conditiile
              </a>{' '}
              clinicii.
            </small>
          </label>
        </div>
        {errors.termsAccepted && (
          <div className="text-danger small">
            <i className="ti ti-alert-circle me-1"></i>
            {errors.termsAccepted}
          </div>
        )}
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return null;
    }
  };

  return (
    <AppShell
      title="Inregistrare Pacient Nou"
      subtitle="Completeaza toate informatiile necesare pentru inregistrarea pacientului"
      actions={
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={handleLoadDraft} size="sm">
            <i className="ti ti-download me-1"></i>
            Incarca Draft
          </Button>
          <Button variant="outline-secondary" onClick={handleSaveDraft} size="sm">
            <i className="ti ti-device-floppy me-1"></i>
            Salveaza Draft
          </Button>
          <Link to="/patients" className="btn btn-outline-secondary">
            <i className="ti ti-arrow-left me-1"></i>
            Inapoi
          </Link>
        </div>
      }
    >
      <div className="row justify-content-center">
        <div className="col-xl-10">
          {renderProgressStepper()}

          <Card className="shadow-sm">
            <CardHeader>
              <div className="d-flex align-items-center gap-3">
                <div className={`avatar avatar-lg bg-primary-transparent rounded`}>
                  <i className={`${STEPS[currentStep - 1].icon} fs-3 text-primary`}></i>
                </div>
                <div>
                  <h5 className="mb-0">
                    Pasul {currentStep} din {STEPS.length}: {STEPS[currentStep - 1].title}
                  </h5>
                  <small className="text-muted">
                    {currentStep === 1 && 'Informatii personale de baza ale pacientului'}
                    {currentStep === 2 && 'Date de contact si adresa'}
                    {currentStep === 3 && 'Persoana de contact in caz de urgenta'}
                    {currentStep === 4 && 'Alergii, afectiuni si medicatie curenta'}
                    {currentStep === 5 && 'Verificare date si acorduri de confidentialitate'}
                  </small>
                </div>
              </div>
            </CardHeader>

            <CardBody>{renderCurrentStep()}</CardBody>

            <CardFooter between>
              <div className="d-flex gap-2">
                {currentStep > 1 && (
                  <Button variant="outline-secondary" onClick={handleBack}>
                    <i className="ti ti-arrow-left me-1"></i>
                    Inapoi
                  </Button>
                )}
                {(currentStep === 3 || currentStep === 4) && (
                  <Button variant="outline-secondary" onClick={handleSkipStep}>
                    <i className="ti ti-player-skip-forward me-1"></i>
                    Omite Pasul
                  </Button>
                )}
              </div>

              <div className="d-flex gap-2">
                {currentStep < 5 ? (
                  <Button variant="primary" onClick={handleNext}>
                    Continua
                    <i className="ti ti-arrow-right ms-1"></i>
                  </Button>
                ) : (
                  <Button
                    variant="success"
                    onClick={handleSubmit}
                    loading={createPatient.isPending}
                    icon="ti ti-check"
                  >
                    Finalizeaza Inregistrarea
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>

          {/* Quick Navigation */}
          <div className="mt-3 text-center">
            <small className="text-muted">
              Poti naviga direct la orice pas:{' '}
              {STEPS.map((step) => (
                <button
                  key={step.number}
                  className={`btn btn-link btn-sm ${currentStep === step.number ? 'fw-bold text-primary' : ''}`}
                  onClick={() => setCurrentStep(step.number)}
                >
                  {step.number}
                </button>
              ))}
            </small>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
