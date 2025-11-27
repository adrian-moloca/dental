/**
 * Availability Indicator Component
 *
 * Shows provider availability status with visual indicator
 */

interface AvailabilityIndicatorProps {
  providerId?: string;
  isAvailable?: boolean;
  isLoading?: boolean;
  nextAvailableSlot?: string;
}

export function AvailabilityIndicator({
  providerId,
  isAvailable,
  isLoading,
  nextAvailableSlot,
}: AvailabilityIndicatorProps) {
  if (!providerId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="d-flex align-items-center gap-2 text-muted small">
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">Se verifica disponibilitatea...</span>
        </div>
        <span>Se verifica disponibilitatea...</span>
      </div>
    );
  }

  if (isAvailable === undefined) {
    return null;
  }

  return (
    <div className="d-flex align-items-center gap-2 small">
      <span
        className="d-inline-block rounded-circle"
        style={{
          width: '8px',
          height: '8px',
          backgroundColor: isAvailable ? 'var(--bs-success)' : 'var(--bs-warning)',
        }}
      />
      <span className={isAvailable ? 'text-success' : 'text-warning'}>
        {isAvailable ? (
          'Disponibil'
        ) : (
          <>
            Indisponibil
            {nextAvailableSlot && (
              <span className="text-muted ms-1">
                (Urmator slot liber: {nextAvailableSlot})
              </span>
            )}
          </>
        )}
      </span>
    </div>
  );
}
