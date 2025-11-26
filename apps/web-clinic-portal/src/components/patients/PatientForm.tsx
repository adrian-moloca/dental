/**
 * Patient Form Component
 *
 * Reusable form for creating and editing patients.
 * Sends data in backend-expected nested structure.
 */

import { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { CreatePatientDto, PhoneDto, EmailDto, AddressDto } from '../../types/patient.types';
import { useAuthStore } from '../../store/authStore';

/** Internal form state (flat for easier form handling) */
interface PatientFormState {
  firstName: string;
  lastName: string;
  dateOfBirth: Date | undefined;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | undefined;
  phones: PhoneDto[];
  emails: EmailDto[];
  address: Partial<AddressDto>;
  notes: string;
  gdprConsent: boolean;
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

  const [formData, setFormData] = useState<PatientFormState>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    dateOfBirth: initialData?.dateOfBirth || undefined,
    gender: initialData?.gender || undefined,
    phones: initialData?.phones || [{ type: 'mobile', number: '', isPrimary: true }],
    emails: initialData?.emails || [{ type: 'personal', address: '', isPrimary: true }],
    address: initialData?.address || {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Romania',
    },
    notes: initialData?.notes || '',
    gdprConsent: true, // Default to true for required consent
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    const primaryEmail = formData.emails?.[0]?.address;
    if (primaryEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(primaryEmail)) {
      newErrors.email = 'Invalid email address';
    }

    const primaryPhone = formData.phones?.[0]?.number;
    if (primaryPhone && !/^[\d\s\-+()]+$/.test(primaryPhone)) {
      newErrors.phone = 'Invalid phone number';
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
      // Use clinicId from user context, or default to organization for super admin
      clinicId: user?.clinicId || user?.organizationId || 'default-clinic',
      person: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth!,
        gender: formData.gender || 'prefer_not_to_say',
      },
      contacts: {
        phones: formData.phones?.filter(p => p.number.trim()),
        emails: formData.emails?.filter(e => e.address.trim()),
        addresses: formData.address?.street ? [{
          street: formData.address.street,
          street2: formData.address.street2,
          city: formData.address.city || '',
          state: formData.address.state || '',
          postalCode: formData.address.postalCode || '',
          country: formData.address.country,
          isPrimary: true,
        }] : undefined,
      },
      consent: {
        gdprConsent: formData.gdprConsent,
      },
      notes: formData.notes || undefined,
    };

    await onSubmit(submitData);
  };

  const updateField = <K extends keyof PatientFormState>(field: K, value: PatientFormState[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Personal Information</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="First Name"
            type="text"
            value={formData.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            error={errors.firstName}
            required
            fullWidth
            autoComplete="given-name"
          />
          <Input
            label="Last Name"
            type="text"
            value={formData.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            error={errors.lastName}
            required
            fullWidth
            autoComplete="family-name"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
            onChange={(e) => updateField('dateOfBirth', e.target.value ? new Date(e.target.value) : undefined)}
            error={errors.dateOfBirth}
            required
            fullWidth
            autoComplete="bday"
          />
          <div className="space-y-2">
            <label className="block text-sm text-slate-200">
              Gender <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.gender || ''}
              onChange={(e) => updateField('gender', (e.target.value || undefined) as PatientFormState['gender'])}
              className={`w-full rounded-lg border ${errors.gender ? 'border-red-500' : 'border-slate-700/80'} bg-ink-800/60 px-3 py-2 text-white focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-300`}
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
            {errors.gender && (
              <p className="text-xs text-red-400 mt-1">{errors.gender}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Contact Information</h3>

        <Input
          label="Email"
          type="email"
          value={formData.emails?.[0]?.address || ''}
          onChange={(e) => updateEmail(0, e.target.value)}
          error={errors.email}
          fullWidth
          autoComplete="email"
        />

        <Input
          label="Phone"
          type="tel"
          value={formData.phones?.[0]?.number || ''}
          onChange={(e) => updatePhone(0, e.target.value)}
          error={errors.phone}
          fullWidth
          autoComplete="tel"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Address</h3>

        <Input
          label="Street"
          type="text"
          value={formData.address?.street || ''}
          onChange={(e) => updateAddress('street', e.target.value)}
          fullWidth
          autoComplete="street-address"
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="City"
            type="text"
            value={formData.address?.city || ''}
            onChange={(e) => updateAddress('city', e.target.value)}
            fullWidth
            autoComplete="address-level2"
          />
          <Input
            label="State/County"
            type="text"
            value={formData.address?.state || ''}
            onChange={(e) => updateAddress('state', e.target.value)}
            fullWidth
            autoComplete="address-level1"
          />
          <Input
            label="Postal Code"
            type="text"
            value={formData.address?.postalCode || ''}
            onChange={(e) => updateAddress('postalCode', e.target.value)}
            fullWidth
            autoComplete="postal-code"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Additional Information</h3>

        <div className="space-y-2">
          <label className="block text-sm text-slate-200">Notes</label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => updateField('notes', e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-slate-700/80 bg-ink-800/60 px-3 py-2 text-white placeholder:text-slate-500 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-300"
            placeholder="Any additional notes or special instructions..."
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Patient' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
