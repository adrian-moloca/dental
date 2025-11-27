/**
 * ClinicalNoteCard - Displays a clinical note with signing and amendment actions
 *
 * Shows note preview, signature status, and provides actions for signing
 * draft notes or amending signed notes.
 */

import { useState, useCallback } from 'react';
import { type ClinicalNoteDto, type NoteAmendment } from '../../api/clinicalClient';
import { NoteSignatureBadge } from './NoteSignatureBadge';
import { SignNoteModal } from './SignNoteModal';
import { AmendNoteModal } from './AmendNoteModal';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';

interface ClinicalNoteCardProps {
  note: ClinicalNoteDto;
  providerName?: string;
  providerCredentials?: string;
  onNoteUpdated?: () => void;
  onViewDetails?: (noteId: string) => void;
  compact?: boolean;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
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

const noteTypeConfig = {
  soap: { label: 'Nota SOAP', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  progress: { label: 'Nota Progres', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  consult: { label: 'Consultatie', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  emergency: { label: 'Urgenta', color: 'text-red-700', bgColor: 'bg-red-100' },
  operative: { label: 'Operatie', color: 'text-amber-700', bgColor: 'bg-amber-100' },
};

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

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
      clipRule="evenodd"
    />
  </svg>
);

export function ClinicalNoteCard({
  note,
  providerName = note.providerName || 'Unknown Provider',
  providerCredentials = note.providerCredentials || '',
  onNoteUpdated,
  onViewDetails,
  compact = false,
}: ClinicalNoteCardProps) {
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isAmendModalOpen, setIsAmendModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAmendments, setShowAmendments] = useState(false);

  const typeConfig = noteTypeConfig[note.type] || noteTypeConfig.progress;
  const isSigned = note.status === 'signed' || note.status === 'amended';
  const amendments = note.amendments || [];
  const hasAmendments = amendments.length > 0;

  const handleSignClick = useCallback(() => {
    setIsSignModalOpen(true);
  }, []);

  const handleAmendClick = useCallback(() => {
    setIsAmendModalOpen(true);
  }, []);

  const handleSignSuccess = useCallback(() => {
    onNoteUpdated?.();
  }, [onNoteUpdated]);

  const handleAmendSuccess = useCallback(() => {
    onNoteUpdated?.();
  }, [onNoteUpdated]);

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <>
      <Card className="overflow-hidden" padding="none">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-border-subtle">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {/* Type Badge */}
            <div className={`px-2 py-1 rounded-md text-xs font-semibold ${typeConfig.bgColor} ${typeConfig.color}`}>
              {typeConfig.label}
            </div>

            {/* Title and Meta */}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground truncate">{note.title}</h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-text-tertiary">
                <span>{formatDate(note.encounterDate)}</span>
                <span className="text-text-muted">|</span>
                <span>{providerName}</span>
                {note.version > 1 && (
                  <>
                    <span className="text-text-muted">|</span>
                    <span className="text-blue-600 font-medium">v{note.version}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Signature Badge */}
          <div className="flex-shrink-0 ml-4">
            <NoteSignatureBadge
              status={note.status}
              signature={note.signature}
              amendmentCount={amendments.length}
              compact={compact}
            />
          </div>
        </div>

        {/* Content Preview */}
        <div className="p-4">
          {note.soap ? (
            <div className={`space-y-2 ${!isExpanded && 'max-h-32 overflow-hidden'}`}>
              {note.soap.subjective && (
                <div>
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Subiectiv: </span>
                  <span className="text-sm text-text-secondary">
                    {isExpanded ? note.soap.subjective : truncateText(note.soap.subjective, 100)}
                  </span>
                </div>
              )}
              {note.soap.objective && (
                <div>
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Obiectiv: </span>
                  <span className="text-sm text-text-secondary">
                    {isExpanded ? note.soap.objective : truncateText(note.soap.objective, 100)}
                  </span>
                </div>
              )}
              {note.soap.assessment && (
                <div>
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Evaluare: </span>
                  <span className="text-sm text-text-secondary">
                    {isExpanded ? note.soap.assessment : truncateText(note.soap.assessment, 100)}
                  </span>
                </div>
              )}
              {note.soap.plan && (
                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Plan: </span>
                  <span className="text-sm text-text-secondary">
                    {isExpanded ? note.soap.plan : truncateText(note.soap.plan, 100)}
                  </span>
                </div>
              )}
            </div>
          ) : note.content ? (
            <p className="text-sm text-text-secondary">
              {isExpanded ? note.content : truncateText(note.content, 300)}
            </p>
          ) : (
            <p className="text-sm text-text-muted italic">Fara continut</p>
          )}

          {/* Expand/Collapse Button */}
          {(note.soap || note.content) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 mt-2 text-sm text-text-tertiary hover:text-foreground transition-colors font-medium"
              aria-expanded={isExpanded}
            >
              <ChevronDownIcon
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
              {isExpanded ? 'Afiseaza mai putin' : 'Afiseaza mai mult'}
            </button>
          )}
        </div>

        {/* Amendments Section */}
        {hasAmendments && (
          <div className="border-t border-border-subtle">
            <button
              onClick={() => setShowAmendments(!showAmendments)}
              className="flex items-center justify-between w-full px-4 py-3 text-sm text-text-tertiary hover:text-foreground hover:bg-surface-hover transition-colors font-medium"
              aria-expanded={showAmendments}
            >
              <span className="flex items-center gap-2">
                <PenIcon className="w-4 h-4 text-blue-600" />
                {amendments.length} {amendments.length === 1 ? 'Amendament' : 'Amendamente'}
              </span>
              <ChevronDownIcon
                className={`w-4 h-4 transition-transform ${showAmendments ? 'rotate-180' : ''}`}
              />
            </button>

            {showAmendments && (
              <div className="px-4 pb-4 space-y-3">
                {amendments.map((amendment: NoteAmendment) => (
                  <div
                    key={amendment.id}
                    className="p-3 bg-surface-hover border border-border-subtle rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-blue-600">
                        Versiunea {amendment.version}
                      </span>
                      <span className="text-xs text-text-muted">
                        {formatDateTime(amendment.amendedAt)}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mb-1">
                      <span className="text-text-muted font-medium">Motiv:</span> {amendment.reason}
                    </p>
                    <p className="text-xs text-text-muted">De catre {amendment.amendedByName}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle bg-surface-hover">
          <div className="flex items-center gap-2">
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(note.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-text-tertiary hover:text-foreground hover:bg-white rounded-lg transition-colors border border-border-subtle"
              >
                <Icon name="document" className="w-4 h-4" />
                Vezi Detalii
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sign Button - Only for draft notes */}
            {!isSigned && (
              <button
                onClick={handleSignClick}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 border border-emerald-700 rounded-lg transition-colors shadow-sm"
              >
                <LockIcon className="w-4 h-4" />
                Semneaza Nota
              </button>
            )}

            {/* Amend Button - Only for signed notes */}
            {isSigned && (
              <button
                onClick={handleAmendClick}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 border border-blue-700 rounded-lg transition-colors shadow-sm"
              >
                <PenIcon className="w-4 h-4" />
                Adauga Amendament
              </button>
            )}
          </div>
        </div>

        {/* Locked Indicator for Signed Notes */}
        {isSigned && (
          <div className="px-4 py-2.5 bg-emerald-50 border-t border-emerald-200">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
              <LockIcon className="w-3.5 h-3.5" />
              <span>Aceasta nota este semnata digital si blocata. Modificarile necesita un amendament.</span>
            </div>
          </div>
        )}
      </Card>

      {/* Sign Note Modal */}
      <SignNoteModal
        note={note}
        providerName={providerName}
        providerCredentials={providerCredentials}
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSuccess={handleSignSuccess}
      />

      {/* Amend Note Modal */}
      <AmendNoteModal
        note={note}
        providerName={providerName}
        providerCredentials={providerCredentials}
        isOpen={isAmendModalOpen}
        onClose={() => setIsAmendModalOpen(false)}
        onSuccess={handleAmendSuccess}
      />
    </>
  );
}

export default ClinicalNoteCard;
