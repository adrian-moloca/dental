/**
 * PatientSummaryCard Component
 *
 * Displays a summary of the selected patient's information.
 * Shows after patient is selected in appointment creation.
 */

import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Icon } from '../ui/Icon';
import type { PatientDto } from '../../types/patient.types';

interface PatientSummaryCardProps {
  patient: PatientDto;
}

export function PatientSummaryCard({ patient }: PatientSummaryCardProps) {
  const primaryPhone = patient.phones?.find((p) => p.isPrimary) || patient.phones?.[0];
  const primaryEmail = patient.emails?.find((e) => e.isPrimary) || patient.emails?.[0];

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card padding="md" tone="glass" className="border-l-4 border-l-[var(--brand)]">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-[#F4EFF0]">
            {patient.firstName} {patient.lastName}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-slate-400">
              {calculateAge(patient.dateOfBirth)} years old
            </span>
            {patient.gender && (
              <>
                <span className="text-slate-600">•</span>
                <Badge
                  variant="secondary"
                  size="sm"
                  className="capitalize"
                >
                  {patient.gender}
                </Badge>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {/* Contact Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {primaryPhone && (
            <div className="flex items-center gap-2 text-sm">
              <Icon name="phone" className="w-4 h-4 text-slate-400" aria-hidden="true" />
              <span className="text-[#F4EFF0]">{primaryPhone.number}</span>
              {primaryPhone.type && (
                <Badge variant="outline" size="sm" className="ml-auto">
                  {primaryPhone.type}
                </Badge>
              )}
            </div>
          )}

          {primaryEmail && (
            <div className="flex items-center gap-2 text-sm">
              <Icon name="mail" className="w-4 h-4 text-slate-400" aria-hidden="true" />
              <span className="text-[#F4EFF0] truncate">{primaryEmail.address}</span>
            </div>
          )}
        </div>

        {/* Date of Birth */}
        <div className="flex items-center gap-2 text-sm">
          <Icon name="calendar" className="w-4 h-4 text-slate-400" aria-hidden="true" />
          <span className="text-slate-400">Born:</span>
          <span className="text-[#F4EFF0]">{formatDate(patient.dateOfBirth)}</span>
        </div>

        {/* Address */}
        {patient.address && (
          <div className="flex items-start gap-2 text-sm">
            <Icon name="map" className="w-4 h-4 text-slate-400 mt-0.5" aria-hidden="true" />
            <span className="text-[#F4EFF0]">
              {patient.address.street}, {patient.address.city}, {patient.address.state}{' '}
              {patient.address.postalCode}
            </span>
          </div>
        )}

        {/* Emergency Contact */}
        {patient.emergencyContact && (
          <div className="flex items-start gap-2 text-sm pt-2 border-t border-[var(--border)]">
            <Icon name="alert" className="w-4 h-4 text-amber-400 mt-0.5" aria-hidden="true" />
            <div>
              <span className="text-slate-400">Emergency:</span>{' '}
              <span className="text-[#F4EFF0]">
                {patient.emergencyContact.name} ({patient.emergencyContact.relationship})
              </span>
              {patient.emergencyContact.phone && (
                <span className="text-slate-400 ml-2">
                  {patient.emergencyContact.phone}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Medical Notes/Alerts */}
        {patient.notes && (
          <div className="flex items-start gap-2 text-sm pt-2 border-t border-[var(--border)]">
            <Icon name="info" className="w-4 h-4 text-blue-400 mt-0.5" aria-hidden="true" />
            <div>
              <span className="text-slate-400">Notes:</span>{' '}
              <span className="text-[#F4EFF0]">{patient.notes}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
