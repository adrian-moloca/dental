/**
 * AlertBanner Component
 *
 * Displays medical alerts prominently at the top of patient profiles.
 * Red banner for allergies (with severity), yellow banner for medical conditions,
 * and info display for current medications.
 */

import { Badge } from '../ui/Badge';
import clsx from 'clsx';

interface Allergy {
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  reaction?: string;
}

interface MedicalCondition {
  condition: string;
  icd10Code?: string;
  status?: 'active' | 'resolved' | 'managed';
}

interface Medication {
  name: string;
  dosage?: string;
  frequency?: string;
}

interface AlertBannerProps {
  allergies?: Allergy[];
  medicalConditions?: MedicalCondition[];
  medications?: Medication[];
}

export function AlertBanner({ allergies, medicalConditions, medications }: AlertBannerProps) {
  const hasAllergies = allergies && allergies.length > 0;
  const hasConditions = medicalConditions && medicalConditions.length > 0;
  const hasMedications = medications && medications.length > 0;

  if (!hasAllergies && !hasConditions && !hasMedications) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Allergies - Red Alert */}
      {hasAllergies && (
        <div className="rounded-lg border-2 border-red-500/50 bg-red-950/40 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-red-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-bold text-red-300 uppercase tracking-wide">
                  ALLERGY ALERT
                </h3>
              </div>
              <div className="space-y-2">
                {allergies.map((allergy, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Badge
                      tone={allergy.severity === 'life-threatening' || allergy.severity === 'severe' ? 'warning' : 'neutral'}
                      className={clsx(
                        'shrink-0',
                        (allergy.severity === 'life-threatening' || allergy.severity === 'severe') &&
                        'bg-red-600/30 border-red-400'
                      )}
                    >
                      {allergy.severity}
                    </Badge>
                    <div className="text-sm">
                      <span className="font-semibold text-white">{allergy.allergen}</span>
                      {allergy.reaction && (
                        <span className="text-red-200 ml-1">- {allergy.reaction}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medical Conditions - Yellow Alert */}
      {hasConditions && (
        <div className="rounded-lg border border-yellow-500/50 bg-yellow-950/30 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-yellow-300 uppercase tracking-wide mb-2">
                Medical Conditions
              </h3>
              <div className="flex flex-wrap gap-2">
                {medicalConditions.map((condition, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <span className="text-sm text-white font-medium">{condition.condition}</span>
                    {condition.status && (
                      <Badge tone="neutral" className="text-xs">
                        {condition.status}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Medications - Info */}
      {hasMedications && (
        <div className="rounded-lg border border-blue-500/50 bg-blue-950/20 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-blue-300 uppercase tracking-wide mb-2">
                Current Medications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {medications.map((medication, index) => (
                  <div key={index} className="text-sm text-white">
                    <span className="font-medium">{medication.name}</span>
                    {(medication.dosage || medication.frequency) && (
                      <span className="text-slate-300 text-xs ml-1">
                        {[medication.dosage, medication.frequency].filter(Boolean).join(' • ')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
