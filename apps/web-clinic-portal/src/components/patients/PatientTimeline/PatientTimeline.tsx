/**
 * PatientTimeline Component
 *
 * Comprehensive timeline of ALL patient activities with infinite scroll,
 * filtering, and expandable details.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { usePatientTimeline } from '../../../hooks/usePatientTimeline';
import type { TimelineFilters, TimelineActivity } from '../../../api/timelineClient';
import { Card, CardHeader, CardBody, Badge, Button, EmptyState } from '../../ui-new';
import { TimelineEntry } from './TimelineEntry';

interface PatientTimelineProps {
  patientId: string;
}

const ACTIVITY_TYPES = [
  { value: 'appointment', label: 'Programari', icon: 'ti-calendar', color: 'primary' },
  { value: 'clinical_note', label: 'Note Clinice', icon: 'ti-file-text', color: 'info' },
  { value: 'treatment', label: 'Tratamente', icon: 'ti-dental', color: 'success' },
  { value: 'document', label: 'Documente', icon: 'ti-file', color: 'warning' },
  { value: 'payment', label: 'Plati', icon: 'ti-cash', color: 'success' },
  { value: 'communication', label: 'Comunicari', icon: 'ti-mail', color: 'secondary' },
];

export function PatientTimeline({ patientId }: PatientTimelineProps) {
  const [filters, setFilters] = useState<TimelineFilters>({});
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch timeline with filters
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = usePatientTimeline(patientId, {
    ...filters,
    activityTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
  });

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Toggle activity type filter
  const toggleTypeFilter = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedTypes([]);
    setFilters({});
  };

  // Handle view details
  const handleViewDetails = useCallback((activity: TimelineActivity) => {
    const routes: Record<string, string> = {
      appointment: '/appointments',
      clinical_note: '/clinical',
      treatment: '/clinical',
      document: '/documents',
      payment: '/billing/payments',
      communication: '/communications',
    };

    const baseRoute = routes[activity.type];
    if (baseRoute && activity.relatedId) {
      window.location.href = `${baseRoute}/${activity.relatedId}`;
    }
  }, []);

  // Flatten all pages of activities
  const allActivities = data?.pages.flatMap((page) => page.data) || [];
  const totalCount = data?.pages[0]?.total || 0;

  return (
    <Card className="shadow-sm">
      <CardHeader
        title="Cronologie Activitati"
        icon="ti ti-timeline"
        actions={
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small">
              {allActivities.length} / {totalCount} activitati
            </span>
            {(selectedTypes.length > 0 || filters.startDate || filters.endDate) && (
              <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
                <i className="ti ti-filter-off me-1"></i>
                Sterge Filtre
              </Button>
            )}
          </div>
        }
      />

      <CardBody>
        {/* Filters */}
        <div className="mb-4">
          {/* Activity Type Filters */}
          <div className="mb-3">
            <label className="form-label small fw-semibold mb-2">
              Filtreaza dupa tip activitate:
            </label>
            <div className="d-flex flex-wrap gap-2">
              {ACTIVITY_TYPES.map((type) => {
                const isActive = selectedTypes.includes(type.value);
                return (
                  <Badge
                    key={type.value}
                    variant={isActive ? type.color : 'soft-secondary'}
                    className="cursor-pointer d-flex align-items-center gap-1"
                    onClick={() => toggleTypeFilter(type.value)}
                    style={{ cursor: 'pointer', padding: '6px 12px' }}
                  >
                    <i className={`ti ${type.icon}`}></i>
                    {type.label}
                    {isActive && <i className="ti ti-x ms-1"></i>}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Date Range Filters */}
          <div className="row g-2">
            <div className="col-md-6">
              <label className="form-label small">Data inceput</label>
              <input
                type="date"
                className="form-control"
                value={filters.startDate || ''}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, startDate: e.target.value }))
                }
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Data sfarsit</label>
              <input
                type="date"
                className="form-control"
                value={filters.endDate || ''}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, endDate: e.target.value }))
                }
                min={filters.startDate}
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
            <p className="text-muted mt-3">Se incarca cronologia...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="alert alert-danger">
            <i className="ti ti-alert-circle me-2"></i>
            Eroare la incarcarea cronologiei
          </div>
        )}

        {/* Timeline List */}
        {!isLoading && !error && allActivities.length > 0 && (
          <>
            <div className="timeline">
              {allActivities.map((activity) => (
                <TimelineEntry
                  key={activity.id}
                  activity={activity}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>

            {/* Intersection Observer Target */}
            <div ref={observerTarget} className="py-2">
              {isFetchingNextPage && (
                <div className="text-center">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Se incarca mai multe...</span>
                  </div>
                  <p className="text-muted small mt-2">Se incarca mai multe activitati...</p>
                </div>
              )}
              {!hasNextPage && allActivities.length > 0 && (
                <div className="text-center text-muted small">
                  <i className="ti ti-check-circle me-1"></i>
                  Toate activitatile au fost incarcate
                </div>
              )}
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && allActivities.length === 0 && (
          <EmptyState
            icon="ti-timeline-event-exclamation"
            title="Nicio activitate gasita"
            description={
              selectedTypes.length > 0 || filters.startDate || filters.endDate
                ? 'Incearca sa modifici filtrele pentru a vedea mai multe rezultate'
                : 'Nicio activitate inregistrata pentru acest pacient'
            }
            action={
              (selectedTypes.length > 0 || filters.startDate || filters.endDate) && (
                <Button variant="primary" onClick={clearFilters}>
                  <i className="ti ti-filter-off me-1"></i>
                  Sterge toate filtrele
                </Button>
              )
            }
          />
        )}
      </CardBody>
    </Card>
  );
}

export default PatientTimeline;
