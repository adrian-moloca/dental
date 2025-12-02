/**
 * ToothComparisonView Component
 *
 * Side-by-side comparison of tooth state at two different dates.
 * Shows before/after visual comparison with highlighted differences.
 */

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useOdontogramComparison } from '../../../hooks/useToothHistory';
import { Card, CardHeader, CardBody, Badge, EmptyState } from '../../ui-new';
import ToothSVG from '../Odontogram/ToothSVG';

interface ToothComparisonViewProps {
  patientId: string;
  initialToothNumber?: string;
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
};

export function ToothComparisonView({
  patientId,
  initialToothNumber,
}: ToothComparisonViewProps) {
  const [selectedTooth, setSelectedTooth] = useState(initialToothNumber || '');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data, isLoading, error } = useOdontogramComparison(
    patientId,
    dateFrom,
    dateTo
  );

  // Get tooth-specific change
  const toothChange = useMemo(() => {
    if (!data || !selectedTooth) return null;
    return data.changes.find((change) => change.toothNumber === selectedTooth);
  }, [data, selectedTooth]);

  const fromToothData = data?.from.teeth[selectedTooth];
  const toToothData = data?.to.teeth[selectedTooth];

  const canCompare = dateFrom && dateTo && selectedTooth;

  return (
    <Card className="shadow-sm">
      <CardHeader title="Comparatie Stare Dinte" icon="ti ti-arrows-left-right" />

      <CardBody>
        {/* Selection Controls */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <label className="form-label">Numar Dinte</label>
            <input
              type="text"
              className="form-control"
              placeholder="ex: 11, 18, 46"
              value={selectedTooth}
              onChange={(e) => setSelectedTooth(e.target.value)}
              maxLength={2}
            />
            <div className="form-text">Introduceti numarul dintelui (FDI)</div>
          </div>
          <div className="col-md-4">
            <label className="form-label">Data Initiala</label>
            <input
              type="date"
              className="form-control"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Data Finala</label>
            <input
              type="date"
              className="form-control"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              min={dateFrom}
            />
          </div>
        </div>

        {!canCompare && (
          <EmptyState
            icon="ti-select"
            title="Selecteaza parametrii"
            description="Alege un dinte si doua date pentru a vizualiza comparatia"
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Se incarca...</span>
            </div>
            <p className="text-muted mt-3">Se incarca comparatia...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="alert alert-danger">
            <i className="ti ti-alert-circle me-2"></i>
            Eroare la incarcarea comparatiei
          </div>
        )}

        {/* Comparison View */}
        {!isLoading && !error && canCompare && data && (
          <>
            {/* Change Badge */}
            {toothChange && (
              <div className="alert alert-soft-info mb-4">
                <div className="d-flex align-items-center gap-2">
                  <i className="ti ti-info-circle"></i>
                  <div>
                    <strong>
                      {toothChange.changeType === 'added' && 'Conditie adaugata'}
                      {toothChange.changeType === 'modified' && 'Conditie modificata'}
                      {toothChange.changeType === 'removed' && 'Conditie eliminata'}
                    </strong>
                    {toothChange.fromCondition && toothChange.toCondition && (
                      <span className="ms-2">
                        {CONDITION_LABELS[toothChange.fromCondition]} →{' '}
                        {CONDITION_LABELS[toothChange.toCondition]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Side-by-Side Comparison */}
            <div className="row g-4">
              {/* Before State */}
              <div className="col-md-6">
                <div className="border rounded p-4 bg-light h-100">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h6 className="mb-0 fw-bold">Inainte</h6>
                    <Badge variant="soft-secondary" size="sm">
                      {format(new Date(dateFrom), 'dd MMM yyyy', { locale: ro })}
                    </Badge>
                  </div>

                  <div className="d-flex justify-content-center mb-3">
                    <ToothSVG
                      toothNumber={parseInt(selectedTooth, 10)}
                      toothData={{
                        toothNumber: selectedTooth,
                        isPresent: fromToothData?.condition !== 'missing',
                        isPrimary: false,
                        isSupernumerary: false,
                        isImplant: false,
                        updatedAt: dateFrom,
                        conditions: fromToothData
                          ? [
                              {
                                id: `${selectedTooth}-from-${dateFrom}`,
                                condition: fromToothData.condition as any,
                                surfaces: (fromToothData.surfaces || []) as any,
                                recordedAt: dateFrom,
                                recordedBy: 'system',
                              },
                            ]
                          : [],
                      } as any}
                      selected={false}
                      hovered={false}
                      size="lg"
                      readOnly
                    />
                  </div>

                  {fromToothData ? (
                    <>
                      <div className="mb-2">
                        <span className="text-muted small">Conditie:</span>
                        <div className="fw-medium">
                          {CONDITION_LABELS[fromToothData.condition] ||
                            fromToothData.condition}
                        </div>
                      </div>

                      {fromToothData.surfaces && fromToothData.surfaces.length > 0 && (
                        <div className="mb-2">
                          <span className="text-muted small">Suprafete afectate:</span>
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {fromToothData.surfaces.map((surface) => (
                              <Badge key={surface} variant="soft-secondary" size="sm">
                                {surface}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {fromToothData.notes && (
                        <div className="mt-3 p-2 bg-white rounded">
                          <div className="text-muted small mb-1">Note:</div>
                          <div className="small">{fromToothData.notes}</div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-muted py-3">
                      <i className="ti ti-dental-broken fs-48"></i>
                      <p className="mt-2 mb-0 small">Nu exista date pentru aceasta perioada</p>
                    </div>
                  )}
                </div>
              </div>

              {/* After State */}
              <div className="col-md-6">
                <div className="border rounded p-4 bg-light h-100">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h6 className="mb-0 fw-bold">Dupa</h6>
                    <Badge variant="soft-primary" size="sm">
                      {format(new Date(dateTo), 'dd MMM yyyy', { locale: ro })}
                    </Badge>
                  </div>

                  <div className="d-flex justify-content-center mb-3">
                    <ToothSVG
                      toothNumber={parseInt(selectedTooth, 10)}
                      toothData={{
                        toothNumber: selectedTooth,
                        isPresent: toToothData?.condition !== 'missing',
                        isPrimary: false,
                        isSupernumerary: false,
                        isImplant: false,
                        updatedAt: dateTo,
                        conditions: toToothData
                          ? [
                              {
                                id: `${selectedTooth}-to-${dateTo}`,
                                condition: toToothData.condition as any,
                                surfaces: (toToothData.surfaces || []) as any,
                                recordedAt: dateTo,
                                recordedBy: 'system',
                              },
                            ]
                          : [],
                      } as any}
                      selected={false}
                      hovered={false}
                      size="lg"
                      readOnly
                    />
                  </div>

                  {toToothData ? (
                    <>
                      <div className="mb-2">
                        <span className="text-muted small">Conditie:</span>
                        <div className="fw-medium">
                          {CONDITION_LABELS[toToothData.condition] || toToothData.condition}
                        </div>
                      </div>

                      {toToothData.surfaces && toToothData.surfaces.length > 0 && (
                        <div className="mb-2">
                          <span className="text-muted small">Suprafete afectate:</span>
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {toToothData.surfaces.map((surface) => (
                              <Badge key={surface} variant="soft-primary" size="sm">
                                {surface}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {toToothData.notes && (
                        <div className="mt-3 p-2 bg-white rounded">
                          <div className="text-muted small mb-1">Note:</div>
                          <div className="small">{toToothData.notes}</div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-muted py-3">
                      <i className="ti ti-dental-broken fs-48"></i>
                      <p className="mt-2 mb-0 small">Nu exista date pentru aceasta perioada</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Change Summary */}
            {toothChange && (
              <div className="mt-4 p-3 border rounded bg-white">
                <h6 className="mb-3">
                  <i className="ti ti-list-check me-2"></i>
                  Rezumat Schimbari
                </h6>
                <div className="d-flex align-items-center gap-3">
                  {toothChange.changeType === 'modified' && (
                    <>
                      <div className="flex-1">
                        <div className="small text-muted mb-1">Stare Anterioara</div>
                        <Badge variant="soft-secondary">
                          {CONDITION_LABELS[toothChange.fromCondition!] ||
                            toothChange.fromCondition}
                        </Badge>
                      </div>
                      <i className="ti ti-arrow-right text-primary"></i>
                      <div className="flex-1">
                        <div className="small text-muted mb-1">Stare Noua</div>
                        <Badge variant="soft-primary">
                          {CONDITION_LABELS[toothChange.toCondition!] ||
                            toothChange.toCondition}
                        </Badge>
                      </div>
                    </>
                  )}
                  {toothChange.changeType === 'added' && (
                    <Badge variant="soft-success" size="lg">
                      <i className="ti ti-plus me-1"></i>
                      Conditie noua adaugata
                    </Badge>
                  )}
                  {toothChange.changeType === 'removed' && (
                    <Badge variant="soft-danger" size="lg">
                      <i className="ti ti-minus me-1"></i>
                      Conditie eliminata
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}

export default ToothComparisonView;
