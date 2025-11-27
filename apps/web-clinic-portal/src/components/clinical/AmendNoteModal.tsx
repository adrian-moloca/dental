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
  return date.toLocaleDateString('ro-RO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
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
        setError('Motivul amendamentului este obligatoriu');
        return;
      }

      if (!password.trim()) {
        setError('Parola este necesara pentru a semna amendamentul');
        return;
      }

      // Check if there are actual changes
      const hasChanges =
        formData.subjective !== (note.soap?.subjective || '') ||
        formData.objective !== (note.soap?.objective || '') ||
        formData.assessment !== (note.soap?.assessment || '') ||
        formData.plan !== (note.soap?.plan || '');

      if (!hasChanges) {
        setError('Nu au fost detectate modificari. Va rugam modificati continutul notei inainte de a trimite.');
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
          setError('Parola invalida. Va rugam verificati credentialele si incercati din nou.');
        } else {
          setError(err?.response?.data?.message || 'Nu s-a putut crea amendamentul. Va rugam incercati din nou.');
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
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden bg-surface border-2 border-border rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PenIcon className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h2 id={dialogTitleId} className="text-lg font-semibold text-foreground">
                Creeaza Amendament
              </h2>
              <p id={dialogDescId} className="text-sm text-text-tertiary">
                Versiunea {nextVersion} - Modificare nota semnata
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {amendments.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  showHistory
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-text-tertiary hover:text-foreground hover:bg-surface-hover'
                }`}
                aria-pressed={showHistory}
              >
                <HistoryIcon className="w-4 h-4" />
                {amendments.length} {amendments.length === 1 ? 'Amendament' : 'Amendamente'}
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 text-text-muted hover:text-foreground hover:bg-surface-hover rounded-lg transition-colors"
              aria-label="Inchide fereastra"
            >
              <Icon name="x" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 py-4 space-y-6">
          {/* Amendment History Panel */}
          {showHistory && amendments.length > 0 && (
            <div className="p-4 bg-surface-hover border-2 border-border-subtle rounded-lg space-y-3">
              <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                Istoricul Amendamentelor
              </h3>
              <div className="space-y-3">
                {amendments.map((amendment: NoteAmendment) => (
                  <div
                    key={amendment.id}
                    className="p-3 bg-surface border-2 border-border-subtle rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">
                        Versiunea {amendment.version}
                      </span>
                      <span className="text-xs text-text-muted">
                        {formatDateTime(amendment.amendedAt)}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mb-1">
                      <span className="text-text-muted">Motiv:</span> {amendment.reason}
                    </p>
                    <p className="text-xs text-text-muted">
                      De catre {amendment.amendedByName}
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
              className="block text-sm font-semibold text-text-secondary mb-2"
            >
              Motivul Amendamentului <span className="text-red-600">*</span>
            </label>
            <textarea
              id={reasonInputId}
              value={formData.reason}
              onChange={handleInputChange('reason')}
              placeholder="Explicati de ce se face acest amendament (ex: 'Constatari suplimentare din rezultatele laboratorului', 'Corectare eroare de transcriere')"
              rows={2}
              className="w-full px-4 py-3 bg-surface border-2 border-border rounded-lg text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              required
            />
          </div>

          {/* SOAP Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Continut Nota Actualizat
            </h3>

            <div>
              <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
                Subiectiv
              </label>
              <textarea
                value={formData.subjective}
                onChange={handleInputChange('subjective')}
                placeholder="Acuzele subiective ale pacientului si istoricul medical..."
                rows={3}
                className="w-full px-4 py-3 bg-surface border-2 border-border rounded-lg text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
                Obiectiv
              </label>
              <textarea
                value={formData.objective}
                onChange={handleInputChange('objective')}
                placeholder="Constatari clinice, rezultatele examinarii, semne vitale..."
                rows={3}
                className="w-full px-4 py-3 bg-surface border-2 border-border rounded-lg text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">
                Evaluare
              </label>
              <textarea
                value={formData.assessment}
                onChange={handleInputChange('assessment')}
                placeholder="Diagnostic, impresii clinice..."
                rows={3}
                className="w-full px-4 py-3 bg-surface border-2 border-border rounded-lg text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                Plan
              </label>
              <textarea
                value={formData.plan}
                onChange={handleInputChange('plan')}
                placeholder="Plan de tratament, prescriptii, urmarire..."
                rows={3}
                className="w-full px-4 py-3 bg-surface border-2 border-border rounded-lg text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              />
            </div>
          </div>

          {/* Signature Information */}
          <div className="p-4 bg-blue-100 border-2 border-blue-200 rounded-lg space-y-3">
            <h3 className="text-sm font-semibold text-blue-800">Semnatura Amendament</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-muted font-medium">Furnizor</span>
                <p className="font-semibold text-foreground">
                  {providerName}
                  {providerCredentials && (
                    <span className="text-text-tertiary">, {providerCredentials}</span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-text-muted font-medium">Data</span>
                <p className="font-semibold text-foreground">{formatDate(new Date().toISOString())}</p>
              </div>
            </div>
          </div>

          {/* Password Form */}
          <div>
            <label
              htmlFor={passwordInputId}
              className="block text-sm font-semibold text-text-secondary mb-2"
            >
              Introduceti parola pentru a semna amendamentul
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
                placeholder="Introduceti parola contului"
                className={`w-full px-4 py-3 pr-12 bg-surface border-2 rounded-lg text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 transition-colors ${
                  error
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-border focus:ring-brand focus:border-brand'
                }`}
                autoComplete="current-password"
                aria-invalid={!!error}
                aria-describedby={error ? 'password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Ascunde parola' : 'Afiseaza parola'}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {error && (
              <p id="password-error" className="mt-2 text-sm font-semibold text-red-700" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t-2 border-border bg-surface-hover">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-text-secondary border-2 border-border hover:text-foreground hover:bg-white rounded-lg font-semibold transition-colors"
            disabled={amendNote.isPending}
          >
            Anuleaza
          </button>
          <button
            onClick={handleSubmit}
            disabled={amendNote.isPending || !formData.reason.trim() || !password.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {amendNote.isPending ? (
              <>
                <Icon name="loading" className="w-4 h-4 animate-spin" />
                Se salveaza...
              </>
            ) : (
              <>
                <PenIcon className="w-4 h-4" />
                Semneaza Amendamentul
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AmendNoteModal;
