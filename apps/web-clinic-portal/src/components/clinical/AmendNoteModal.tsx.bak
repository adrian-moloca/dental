/**
 * AmendNoteModal - Modal for creating amendments to signed clinical notes
 *
 * Allows providers to create tracked amendments to signed notes while
 * maintaining the original note's immutability. Amendments require
 * a reason and password verification.
 */

import { useState, useCallback, useId } from 'react';
import { type ClinicalNoteDto, type NoteAmendment } from '../../api/clinicalClient';
import { useAmendNote } from '../../hooks/useClinical';
import { Icon } from '../ui/Icon';

interface AmendNoteModalProps {
  note: ClinicalNoteDto;
  providerName: string;
  providerCredentials: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const PenIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
    <path
      fillRule="evenodd"
      d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
      clipRule="evenodd"
    />
  </svg>
);

const EyeSlashIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z"
      clipRule="evenodd"
    />
    <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
  </svg>
);

const HistoryIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
      clipRule="evenodd"
    />
  </svg>
);

interface AmendmentFormData {
  reason: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export function AmendNoteModal({
  note,
  providerName,
  providerCredentials,
  isOpen,
  onClose,
  onSuccess,
}: AmendNoteModalProps) {
  const [formData, setFormData] = useState<AmendmentFormData>({
    reason: '',
    subjective: note.soap?.subjective || '',
    objective: note.soap?.objective || '',
    assessment: note.soap?.assessment || '',
    plan: note.soap?.plan || '',
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const passwordInputId = useId();
  const reasonInputId = useId();
  const dialogTitleId = useId();
  const dialogDescId = useId();

  const amendNote = useAmendNote();

  const handleInputChange = useCallback(
    (field: keyof AmendmentFormData) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      setError(null);
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!formData.reason.trim()) {
        setError('A reason for the amendment is required');
        return;
      }

      if (!password.trim()) {
        setError('Password is required to sign the amendment');
        return;
      }

      // Check if there are actual changes
      const hasChanges =
        formData.subjective !== (note.soap?.subjective || '') ||
        formData.objective !== (note.soap?.objective || '') ||
        formData.assessment !== (note.soap?.assessment || '') ||
        formData.plan !== (note.soap?.plan || '');

      if (!hasChanges) {
        setError('No changes detected. Please modify the note content before submitting.');
        return;
      }

      try {
        await amendNote.mutateAsync({
          noteId: note.id,
          data: {
            password,
            reason: formData.reason,
            soap: {
              subjective: formData.subjective,
              objective: formData.objective,
              assessment: formData.assessment,
              plan: formData.plan,
            },
          },
        });
        resetForm();
        onSuccess?.();
        onClose();
      } catch (err: any) {
        if (err?.response?.status === 401) {
          setError('Invalid password. Please check your credentials and try again.');
        } else {
          setError(err?.response?.data?.message || 'Failed to create amendment. Please try again.');
        }
      }
    },
    [formData, password, note, amendNote, onSuccess, onClose]
  );

  const resetForm = useCallback(() => {
    setFormData({
      reason: '',
      subjective: note.soap?.subjective || '',
      objective: note.soap?.objective || '',
      assessment: note.soap?.assessment || '',
      plan: note.soap?.plan || '',
    });
    setPassword('');
    setError(null);
    setShowPassword(false);
    setShowHistory(false);
  }, [note]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  if (!isOpen) return null;

  const amendments = note.amendments || [];
  const nextVersion = note.version + 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={dialogTitleId}
      aria-describedby={dialogDescId}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden bg-surface border border-white/10 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <PenIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 id={dialogTitleId} className="text-lg font-semibold text-foreground">
                Create Amendment
              </h2>
              <p id={dialogDescId} className="text-sm text-foreground/60">
                Version {nextVersion} - Amending signed note
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {amendments.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  showHistory
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'text-foreground/60 hover:text-foreground hover:bg-white/5'
                }`}
                aria-pressed={showHistory}
              >
                <HistoryIcon className="w-4 h-4" />
                {amendments.length} Amendment{amendments.length !== 1 ? 's' : ''}
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 text-foreground/40 hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Close dialog"
            >
              <Icon name="x" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 py-4 space-y-6">
          {/* Amendment History Panel */}
          {showHistory && amendments.length > 0 && (
            <div className="p-4 bg-surface-hover border border-white/5 rounded-lg space-y-3">
              <h3 className="text-sm font-medium text-foreground/70 uppercase tracking-wider">
                Amendment History
              </h3>
              <div className="space-y-3">
                {amendments.map((amendment: NoteAmendment, index: number) => (
                  <div
                    key={amendment.id}
                    className="p-3 bg-surface border border-white/5 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">
                        Version {amendment.version}
                      </span>
                      <span className="text-xs text-foreground/50">
                        {formatDateTime(amendment.amendedAt)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/70 mb-1">
                      <span className="text-foreground/50">Reason:</span> {amendment.reason}
                    </p>
                    <p className="text-xs text-foreground/50">
                      By {amendment.amendedByName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amendment Reason */}
          <div>
            <label
              htmlFor={reasonInputId}
              className="block text-sm font-medium text-foreground/70 mb-2"
            >
              Reason for Amendment <span className="text-red-400">*</span>
            </label>
            <textarea
              id={reasonInputId}
              value={formData.reason}
              onChange={handleInputChange('reason')}
              placeholder="Explain why this amendment is being made (e.g., 'Additional findings from lab results', 'Correction of transcription error')"
              rows={2}
              className="w-full px-4 py-3 bg-surface border border-white/10 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              required
            />
          </div>

          {/* SOAP Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground/70 uppercase tracking-wider">
              Updated Note Content
            </h3>

            <div>
              <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
                Subjective
              </label>
              <textarea
                value={formData.subjective}
                onChange={handleInputChange('subjective')}
                placeholder="Patient's subjective complaints and history..."
                rows={3}
                className="w-full px-4 py-3 bg-surface border border-white/10 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                Objective
              </label>
              <textarea
                value={formData.objective}
                onChange={handleInputChange('objective')}
                placeholder="Clinical findings, examination results, vital signs..."
                rows={3}
                className="w-full px-4 py-3 bg-surface border border-white/10 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                Assessment
              </label>
              <textarea
                value={formData.assessment}
                onChange={handleInputChange('assessment')}
                placeholder="Diagnosis, clinical impressions..."
                rows={3}
                className="w-full px-4 py-3 bg-surface border border-white/10 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                Plan
              </label>
              <textarea
                value={formData.plan}
                onChange={handleInputChange('plan')}
                placeholder="Treatment plan, prescriptions, follow-up..."
                rows={3}
                className="w-full px-4 py-3 bg-surface border border-white/10 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              />
            </div>
          </div>

          {/* Signature Information */}
          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg space-y-3">
            <h3 className="text-sm font-medium text-blue-400">Amendment Signature</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-foreground/50">Provider</span>
                <p className="font-medium text-foreground">
                  {providerName}
                  {providerCredentials && (
                    <span className="text-foreground/60">, {providerCredentials}</span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-foreground/50">Date</span>
                <p className="font-medium text-foreground">{formatDate(new Date().toISOString())}</p>
              </div>
            </div>
          </div>

          {/* Password Form */}
          <div>
            <label
              htmlFor={passwordInputId}
              className="block text-sm font-medium text-foreground/70 mb-2"
            >
              Enter your password to sign this amendment
            </label>
            <div className="relative">
              <input
                id={passwordInputId}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Enter your account password"
                className={`w-full px-4 py-3 pr-12 bg-surface border rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 transition-colors ${
                  error
                    ? 'border-red-500/50 focus:ring-red-500/50'
                    : 'border-white/10 focus:ring-brand'
                }`}
                autoComplete="current-password"
                aria-invalid={!!error}
                aria-describedby={error ? 'password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-foreground/40 hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {error && (
              <p id="password-error" className="mt-2 text-sm text-red-400" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-surface-hover/50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-lg font-medium transition-colors"
            disabled={amendNote.isPending}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={amendNote.isPending || !formData.reason.trim() || !password.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {amendNote.isPending ? (
              <>
                <Icon name="loading" className="w-4 h-4 animate-spin" />
                Saving Amendment...
              </>
            ) : (
              <>
                <PenIcon className="w-4 h-4" />
                Sign Amendment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AmendNoteModal;
