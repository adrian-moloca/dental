/**
 * ToothHistoryTimeline Component
 *
 * Display complete history of a specific tooth over time.
 * Shows all changes with condition types, dates, providers, and notes.
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useToothHistory } from '../../../hooks/useToothHistory';
import { Card, CardHeader, CardBody, Badge, Button, EmptyState } from '../../ui-new';
import { getConditionColor } from '../Odontogram/types';

interface ToothHistoryTimelineProps {
  patientId: string;
  toothNumber: string;
  onClose?: () => void;
}

const CONDITION_LABELS: Record<string, string> = {
  healthy: 'Sanatos',
  caries: 'Carie',
  filling: 'Obturatie',
  crown: 'Coroana',
  root_canal: 'Tratament de canal',
  extraction: 'Extractie',
  implant: 'Implant',
  bridge: 'Pod',
  veneer: 'Fateta',
  missing: 'Lipsa',
  fracture: 'Fractura',
  abscess: 'Abces',
};

const CONDITION_ICONS: Record<string, string> = {
  healthy: 'ti-check-circle',
  caries: 'ti-alert-circle',
  filling: 'ti-circle-filled',
  crown: 'ti-crown',
  root_canal: 'ti-dental',
  extraction: 'ti-trash',
  implant: 'ti-plus-circle',
  bridge: 'ti-link',
  veneer: 'ti-sparkles',
  missing: 'ti-x-circle',
  fracture: 'ti-crack',
  abscess: 'ti-urgent',
};

export function ToothHistoryTimeline({
  patientId,
  toothNumber,
  onClose,
}: ToothHistoryTimelineProps) {
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});

  const { data, isLoading, error } = useToothHistory(patientId, toothNumber);

  // Filter history entries
  const filteredHistory = data?.history.filter((entry) => {
    // Filter by condition type
    if (selectedConditions.length > 0 && !selectedConditions.includes(entry.condition)) {
      return false;
    }

    // Filter by date range
    if (dateRange.start && new Date(entry.date) < new Date(dateRange.start)) {
      return false;
    }
    if (dateRange.end && new Date(entry.date) > new Date(dateRange.end)) {
      return false;
    }

    return true;
  });

  // Get unique conditions for filter
  const availableConditions = Array.from(
    new Set(data?.history.map((entry) => entry.condition) || [])
  );

  const toggleConditionFilter = (condition: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    );
  };

  return (
    <Card className="shadow-sm">
      <CardHeader
        title={`Istoric Dinte ${toothNumber}`}
        icon="ti ti-history"
        actions={
          onClose && (
            <Button variant="outline-secondary" size="sm" onClick={onClose}>
              <i className="ti ti-x me-1"></i>
              Inchide
            </Button>
          )
        }
      />

      <CardBody>
        {/* Current State */}
        {data?.currentState && (
          <div className="alert alert-soft-info mb-4">
            <div className="d-flex align-items-center gap-3">
              <div className="avatar avatar-md rounded-circle bg-info-transparent">
                <i className={`ti ${CONDITION_ICONS[data.currentState.condition] || 'ti-dental'} fs-20`}></i>
              </div>
              <div className="flex-1">
                <div className="fw-bold">Stare Curenta</div>
                <div className="small text-muted">
                  {CONDITION_LABELS[data.currentState.condition] || data.currentState.condition}
                  {data.currentState.surfaces && data.currentState.surfaces.length > 0 && (
                    <span className="ms-2">
                      Suprafete: {data.currentState.surfaces.join(', ')}
                    </span>
                  )}
                </div>
                {data.currentState.lastUpdated && (
                  <div className="small text-muted">
                    Ultima modificare:{' '}
                    {format(new Date(data.currentState.lastUpdated), 'dd MMM yyyy', {
                      locale: ro,
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-4">
          <div className="d-flex flex-wrap gap-2 mb-3">
            <label className="form-label mb-0 me-2 align-self-center">Filtreaza dupa tip:</label>
            {availableConditions.map((condition) => (
              <Badge
                key={condition}
                variant={selectedConditions.includes(condition) ? 'primary' : 'soft-secondary'}
                className="cursor-pointer"
                onClick={() => toggleConditionFilter(condition)}
                style={{ cursor: 'pointer' }}
              >
                {CONDITION_LABELS[condition] || condition}
                {selectedConditions.includes(condition) && (
                  <i className="ti ti-x ms-1"></i>
                )}
              </Badge>
            ))}
          </div>

          <div className="row g-2">
            <div className="col-md-6">
              <input
                type="date"
                className="form-control"
                placeholder="Data inceput"
                value={dateRange.start || ''}
                onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div className="col-md-6">
              <input
                type="date"
                className="form-control"
                placeholder="Data sfarsit"
                value={dateRange.end || ''}
                onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Se incarca...</span>
            </div>
            <p className="text-muted mt-3">Se incarca istoricul...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="alert alert-danger">
            <i className="ti ti-alert-circle me-2"></i>
            Eroare la incarcarea istoricului
          </div>
        )}

        {/* Timeline */}
        {!isLoading && !error && filteredHistory && filteredHistory.length > 0 && (
          <div className="timeline">
            {filteredHistory.map((entry) => {
              const conditionColor = getConditionColor(entry.condition);
              const bgClass = `bg-${conditionColor}-transparent`;

              return (
                <div key={entry.id} className="timeline-item">
                  <div className="timeline-marker">
                    <div className={`avatar avatar-sm rounded-circle ${bgClass}`}>
                      <i className={`ti ${CONDITION_ICONS[entry.condition] || 'ti-dental'}`}></i>
                    </div>
                  </div>
                  <div className="timeline-content">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="mb-1 fw-bold">
                          {CONDITION_LABELS[entry.condition] || entry.condition}
                        </h6>
                        <div className="text-muted small">
                          <i className="ti ti-calendar me-1"></i>
                          {format(new Date(entry.date), 'dd MMMM yyyy, HH:mm', {
                            locale: ro,
                          })}
                          {entry.providerName && (
                            <>
                              {' • '}
                              <i className="ti ti-user-md me-1"></i>
                              {entry.providerName}
                            </>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={`soft-${conditionColor}`}
                        size="sm"
                      >
                        {entry.condition}
                      </Badge>
                    </div>

                    {entry.surfaces && entry.surfaces.length > 0 && (
                      <div className="mb-2">
                        <span className="text-muted small">Suprafete: </span>
                        {entry.surfaces.map((surface) => (
                          <Badge
                            key={surface}
                            variant="soft-secondary"
                            size="sm"
                            className="me-1"
                          >
                            {surface}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {entry.procedureName && (
                      <div className="mb-2 small">
                        <span className="text-muted">Procedura: </span>
                        <span className="fw-medium">{entry.procedureName}</span>
                        {entry.procedureCode && (
                          <span className="text-muted ms-1">({entry.procedureCode})</span>
                        )}
                      </div>
                    )}

                    {entry.notes && (
                      <p className="mb-2 small text-muted">{entry.notes}</p>
                    )}

                    {entry.clinicalNoteId && (
                      <Button
                        variant="soft-primary"
                        size="sm"
                        onClick={() => {
                          // Navigate to clinical note
                          window.location.href = `/clinical/${patientId}/notes/${entry.clinicalNoteId}`;
                        }}
                      >
                        <i className="ti ti-file-text me-1"></i>
                        Vezi Nota Clinica
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && (!filteredHistory || filteredHistory.length === 0) && (
          <EmptyState
            icon="ti-history-off"
            title="Niciun istoric disponibil"
            description={
              selectedConditions.length > 0 || dateRange.start || dateRange.end
                ? 'Nicio intrare gasita cu filtrele selectate'
                : 'Acest dinte nu are istoric inregistrat'
            }
          />
        )}
      </CardBody>
    </Card>
  );
}

export default ToothHistoryTimeline;
