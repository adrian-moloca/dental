/**
 * SignNoteModal - Modal for digitally signing clinical notes
 *
 * Displays note preview in SOAP format, provider information,
 * timestamp, and password verification for signature.
 */

import { useState, useCallback, useId } from 'react';
import { type ClinicalNoteDto } from '../../api/clinicalClient';
import { useSignNote } from '../../hooks/useClinical';
import { Icon } from '../ui/Icon';

interface SignNoteModalProps {
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

function formatTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
}

const LockIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
      clipRule="evenodd"
    />
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

const WarningIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
      clipRule="evenodd"
    />
  </svg>
);

export function SignNoteModal({
  note,
  providerName,
  providerCredentials,
  isOpen,
  onClose,
  onSuccess,
}: SignNoteModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(formatTime());

  const passwordInputId = useId();
  const dialogTitleId = useId();
  const dialogDescId = useId();

  const signNote = useSignNote();

  // Update current time every second while modal is open
  useState(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCurrentTime(formatTime());
    }, 1000);
    return () => clearInterval(interval);
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!password.trim()) {
        setError('Password is required to sign the note');
        return;
      }

      try {
        await signNote.mutateAsync({
          noteId: note.id,
          data: { password },
        });
        setPassword('');
        onSuccess?.();
        onClose();
      } catch (err: any) {
        if (err?.response?.status === 401) {
          setError('Invalid password. Please check your credentials and try again.');
        } else {
          setError(err?.response?.data?.message || 'Failed to sign note. Please try again.');
        }
      }
    },
    [password, note.id, signNote, onSuccess, onClose]
  );

  const handleClose = useCallback(() => {
    setPassword('');
    setError(null);
    setShowPassword(false);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  const noteTypeLabel = {
    soap: 'SOAP Note',
    progress: 'Progress Note',
    consult: 'Consultation Note',
    emergency: 'Emergency Note',
    operative: 'Operative Note',
  }[note.type];

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
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden bg-surface border border-white/10 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand/10 rounded-lg">
              <LockIcon className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h2 id={dialogTitleId} className="text-lg font-semibold text-foreground">
                Sign Clinical Note
              </h2>
              <p id={dialogDescId} className="text-sm text-foreground/60">
                Review and digitally sign this {noteTypeLabel?.toLowerCase()}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-foreground/40 hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 py-4 space-y-6">
          {/* Note Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground/70 uppercase tracking-wider">
                Note Preview
              </h3>
              <span className="text-xs text-foreground/50">
                {noteTypeLabel} - {formatDate(note.encounterDate)}
              </span>
            </div>

            <div className="p-4 bg-surface-hover border border-white/5 rounded-lg space-y-4">
              <h4 className="font-medium text-foreground">{note.title}</h4>

              {note.soap ? (
                <div className="space-y-3">
                  {note.soap.subjective && (
                    <div>
                      <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                        Subjective
                      </span>
                      <p className="mt-1 text-sm text-foreground/80 whitespace-pre-wrap">
                        {note.soap.subjective}
                      </p>
                    </div>
                  )}
                  {note.soap.objective && (
                    <div>
                      <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                        Objective
                      </span>
                      <p className="mt-1 text-sm text-foreground/80 whitespace-pre-wrap">
                        {note.soap.objective}
                      </p>
                    </div>
                  )}
                  {note.soap.assessment && (
                    <div>
                      <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                        Assessment
                      </span>
                      <p className="mt-1 text-sm text-foreground/80 whitespace-pre-wrap">
                        {note.soap.assessment}
                      </p>
                    </div>
                  )}
                  {note.soap.plan && (
                    <div>
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                        Plan
                      </span>
                      <p className="mt-1 text-sm text-foreground/80 whitespace-pre-wrap">
                        {note.soap.plan}
                      </p>
                    </div>
                  )}
                </div>
              ) : note.content ? (
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{note.content}</p>
              ) : (
                <p className="text-sm text-foreground/50 italic">No content</p>
              )}
            </div>
          </div>

          {/* Signature Information */}
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg space-y-3">
            <h3 className="text-sm font-medium text-emerald-400">Signature Details</h3>
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
                <span className="text-foreground/50">Timestamp</span>
                <p className="font-medium text-foreground">
                  {formatDate(new Date().toISOString())}
                  <br />
                  <span className="text-foreground/60">{currentTime}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
            <WarningIcon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-400">This action cannot be undone</p>
              <p className="text-foreground/60 mt-1">
                Once signed, this clinical note will become immutable. Any future changes will
                require creating an amendment, which will be tracked in the note history.
              </p>
            </div>
          </div>

          {/* Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor={passwordInputId}
                className="block text-sm font-medium text-foreground/70 mb-2"
              >
                Enter your password to sign
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
                  autoFocus
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
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-surface-hover/50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-foreground/70 hover:text-foreground hover:bg-white/5 rounded-lg font-medium transition-colors"
            disabled={signNote.isPending}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={signNote.isPending || !password.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {signNote.isPending ? (
              <>
                <Icon name="loading" className="w-4 h-4 animate-spin" />
                Signing...
              </>
            ) : (
              <>
                <LockIcon className="w-4 h-4" />
                Sign Note
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignNoteModal;
