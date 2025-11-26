/**
 * NoteSignatureBadge - Displays signature status for clinical notes
 *
 * Shows visual indicator for draft, signed, or amended states with
 * signature details when applicable.
 */

import { type NoteStatus, type NoteSignature } from '../../api/clinicalClient';

interface NoteSignatureBadgeProps {
  status: NoteStatus;
  signature?: NoteSignature;
  amendmentCount?: number;
  compact?: boolean;
  className?: string;
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

const DraftIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z"
      clipRule="evenodd"
    />
  </svg>
);

const CheckBadgeIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
      clipRule="evenodd"
    />
  </svg>
);

export function NoteSignatureBadge({
  status,
  signature,
  amendmentCount = 0,
  compact = false,
  className = '',
}: NoteSignatureBadgeProps) {
  if (status === 'draft') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 ${className}`}
        role="status"
        aria-label="Draft status"
      >
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <DraftIcon className="w-3.5 h-3.5" />
          {!compact && 'Draft'}
        </span>
      </div>
    );
  }

  if (status === 'signed' || status === 'amended') {
    const isAmended = status === 'amended' || amendmentCount > 0;

    return (
      <div className={`inline-flex flex-col gap-1 ${className}`}>
        <div
          className="inline-flex items-center gap-1.5"
          role="status"
          aria-label={isAmended ? 'Signed and amended' : 'Digitally signed'}
        >
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <LockIcon className="w-3.5 h-3.5" />
            <CheckBadgeIcon className="w-3.5 h-3.5" />
            {!compact && 'Signed'}
          </span>

          {isAmended && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <PenIcon className="w-3.5 h-3.5" />
              {!compact && (amendmentCount > 1 ? `${amendmentCount} Amendments` : 'Amended')}
            </span>
          )}
        </div>

        {signature && !compact && (
          <div className="text-xs text-foreground/50 pl-1">
            <span className="font-medium text-foreground/70">
              {signature.signedByName}
              {signature.signedByCredentials && `, ${signature.signedByCredentials}`}
            </span>
            <span className="mx-1">-</span>
            <time dateTime={signature.signedAt}>{formatDateTime(signature.signedAt)}</time>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default NoteSignatureBadge;
