/**
 * OdontogramHistorySlider Component
 *
 * Full odontogram with time slider to see state at any point in history.
 * Features play/pause animation and snapshot export.
 */

import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale/ro';
import { useOdontogramHistory } from '../../../hooks/useToothHistory';
import { Card, CardHeader, CardBody, Button, Badge } from '../../ui-new';
import ToothSVG from '../Odontogram/ToothSVG';

interface OdontogramHistorySliderProps {
  patientId: string;
}

// FDI tooth numbering - upper and lower arches
const UPPER_TEETH = ['18', '17', '16', '15', '14', '13', '12', '11', '21', '22', '23', '24', '25', '26', '27', '28'];
const LOWER_TEETH = ['48', '47', '46', '45', '44', '43', '42', '41', '31', '32', '33', '34', '35', '36', '37', '38'];

export function OdontogramHistorySlider({ patientId }: OdontogramHistorySliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<number | null>(null);

  const { data: historyData, isLoading, error } = useOdontogramHistory(patientId);

  const snapshots = historyData?.snapshots || [];
  const currentSnapshot = snapshots[currentIndex];

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && snapshots.length > 0) {
      playIntervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= snapshots.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500); // Change snapshot every 1.5 seconds
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, snapshots.length]);

  const handlePlay = () => {
    if (currentIndex >= snapshots.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleSliderChange = (value: number) => {
    setCurrentIndex(value);
    setIsPlaying(false);
  };

  const handleExportSnapshot = async () => {
    // Export current snapshot as image
    const odontogramElement = document.getElementById('odontogram-history-canvas');
    if (!odontogramElement) return;

    try {
      // Use html2canvas or similar library for production
      // For now, show a message
      alert('Functionalitate de export - se va implementa cu html2canvas');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader
        title="Evolutie Odontograma"
        icon="ti ti-timeline"
        actions={
          <Button
            variant="outline-primary"
            size="sm"
            onClick={handleExportSnapshot}
            disabled={!currentSnapshot}
          >
            <i className="ti ti-download me-1"></i>
            Exporta Snapshot
          </Button>
        }
      />

      <CardBody>
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Se incarca...</span>
            </div>
            <p className="text-muted mt-3">Se incarca istoricul odontogramei...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="alert alert-danger">
            <i className="ti ti-alert-circle me-2"></i>
            Eroare la incarcarea istoricului
          </div>
        )}

        {/* Main Content */}
        {!isLoading && !error && snapshots.length > 0 && (
          <>
            {/* Date Display */}
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center gap-3 p-3 bg-light rounded">
                <Badge variant="soft-primary" size="lg">
                  {currentSnapshot
                    ? format(new Date(currentSnapshot.date), 'dd MMMM yyyy, HH:mm', {
                        locale: ro,
                      })
                    : 'Selecteaza o data'}
                </Badge>
                {currentSnapshot?.providerName && (
                  <span className="text-muted">
                    <i className="ti ti-user-md me-1"></i>
                    {currentSnapshot.providerName}
                  </span>
                )}
              </div>
            </div>

            {/* Odontogram Display */}
            <div id="odontogram-history-canvas" className="mb-4 p-4 border rounded bg-white">
              {/* Upper Arch */}
              <div className="mb-4">
                <div className="text-center text-muted small mb-2">Arcada Superioara</div>
                <div className="d-flex justify-content-center gap-1 flex-wrap">
                  {UPPER_TEETH.map((toothNumber) => {
                    const toothData = currentSnapshot?.teeth[toothNumber];
                    return (
                      <div key={toothNumber} className="text-center">
                        <ToothSVG
                          toothNumber={parseInt(toothNumber, 10)}
                          toothData={{
                            toothNumber,
                            isPresent: toothData?.condition !== 'missing',
                            conditions: toothData
                              ? [
                                  {
                                    id: `${toothNumber}-${currentSnapshot?.date || 'current'}`,
                                    condition: toothData.condition,
                                    surfaces: toothData.surfaces || [],
                                    recordedAt: currentSnapshot?.date || new Date().toISOString(),
                                    recordedBy: 'system',
                                  },
                                ]
                              : [],
                          } as any}
                          selected={false}
                          hovered={false}
                          size="sm"
                          readOnly
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Midline */}
              <div className="border-top border-bottom border-2 border-primary my-3"></div>

              {/* Lower Arch */}
              <div>
                <div className="text-center text-muted small mb-2">Arcada Inferioara</div>
                <div className="d-flex justify-content-center gap-1 flex-wrap">
                  {LOWER_TEETH.map((toothNumber) => {
                    const toothData = currentSnapshot?.teeth[toothNumber];
                    return (
                      <div key={toothNumber} className="text-center">
                        <ToothSVG
                          toothNumber={parseInt(toothNumber, 10)}
                          toothData={{
                            toothNumber,
                            isPresent: toothData?.condition !== 'missing',
                            conditions: toothData
                              ? [
                                  {
                                    id: `${toothNumber}-${currentSnapshot?.date || 'current'}`,
                                    condition: toothData.condition,
                                    surfaces: toothData.surfaces || [],
                                    recordedAt: currentSnapshot?.date || new Date().toISOString(),
                                    recordedBy: 'system',
                                  },
                                ]
                              : [],
                          } as any}
                          selected={false}
                          hovered={false}
                          size="sm"
                          readOnly
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Timeline Slider */}
            <div className="p-4 bg-light rounded">
              <div className="d-flex align-items-center gap-3">
                {/* Play/Pause Button */}
                <Button
                  variant={isPlaying ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={isPlaying ? handlePause : handlePlay}
                  disabled={snapshots.length <= 1}
                >
                  <i className={`ti ${isPlaying ? 'ti-player-pause' : 'ti-player-play'}`}></i>
                </Button>

                {/* Slider */}
                <div className="flex-1">
                  <input
                    type="range"
                    className="form-range"
                    min="0"
                    max={snapshots.length - 1}
                    value={currentIndex}
                    onChange={(e) => handleSliderChange(Number(e.target.value))}
                    disabled={snapshots.length <= 1}
                  />
                  <div className="d-flex justify-content-between text-muted small mt-1">
                    <span>
                      {historyData?.dateRange.earliest &&
                        format(new Date(historyData.dateRange.earliest), 'dd MMM yyyy', {
                          locale: ro,
                        })}
                    </span>
                    <span>
                      {currentIndex + 1} / {snapshots.length}
                    </span>
                    <span>
                      {historyData?.dateRange.latest &&
                        format(new Date(historyData.dateRange.latest), 'dd MMM yyyy', {
                          locale: ro,
                        })}
                    </span>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="d-flex gap-1">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleSliderChange(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                    title="Snapshot anterior"
                  >
                    <i className="ti ti-chevron-left"></i>
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() =>
                      handleSliderChange(Math.min(snapshots.length - 1, currentIndex + 1))
                    }
                    disabled={currentIndex === snapshots.length - 1}
                    title="Snapshot urmator"
                  >
                    <i className="ti ti-chevron-right"></i>
                  </Button>
                </div>
              </div>
            </div>

            {/* Snapshot Info */}
            {currentSnapshot?.clinicalNoteId && (
              <div className="mt-3 text-center">
                <Button
                  variant="soft-primary"
                  size="sm"
                  onClick={() => {
                    window.location.href = `/clinical/${patientId}/notes/${currentSnapshot.clinicalNoteId}`;
                  }}
                >
                  <i className="ti ti-file-text me-1"></i>
                  Vezi Nota Clinica
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && snapshots.length === 0 && (
          <div className="text-center py-5">
            <i className="ti ti-dental-broken fs-48 text-muted"></i>
            <p className="text-muted mt-3 mb-0">Nu exista snapshots disponibile</p>
            <p className="text-muted small">
              Istoricul odontogramei va fi disponibil dupa inregistrarea primei note clinice
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default OdontogramHistorySlider;
