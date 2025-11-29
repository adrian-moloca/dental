/**
 * TimelineEntry Component
 *
 * Single timeline entry with expandable details and quick actions
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Badge, Button } from '../../ui-new';
import type { TimelineActivity } from '../../../api/timelineClient';

interface TimelineEntryProps {
  activity: TimelineActivity;
  onViewDetails?: (activity: TimelineActivity) => void;
}

const ACTIVITY_TYPE_CONFIG = {
  appointment: {
    label: 'Programare',
    color: 'primary',
    defaultIcon: 'ti-calendar',
  },
  clinical_note: {
    label: 'Nota Clinica',
    color: 'info',
    defaultIcon: 'ti-file-text',
  },
  treatment: {
    label: 'Tratament',
    color: 'success',
    defaultIcon: 'ti-dental',
  },
  document: {
    label: 'Document',
    color: 'warning',
    defaultIcon: 'ti-file',
  },
  payment: {
    label: 'Plata',
    color: 'success',
    defaultIcon: 'ti-cash',
  },
  communication: {
    label: 'Comunicare',
    color: 'secondary',
    defaultIcon: 'ti-mail',
  },
};

export function TimelineEntry({ activity, onViewDetails }: TimelineEntryProps) {
  const [expanded, setExpanded] = useState(false);

  const config = ACTIVITY_TYPE_CONFIG[activity.type];
  const icon = activity.icon || config.defaultIcon;
  const color = activity.color || config.color;

  return (
    <div className="timeline-entry">
      {/* Timeline Marker */}
      <div className="timeline-marker">
        <div className={`avatar avatar-sm rounded-circle bg-${color}-transparent`}>
          <i className={`ti ${icon}`}></i>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="timeline-content">
        {/* Header */}
        <div className="timeline-header">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div className="flex-1">
              <h6 className="timeline-title mb-1">{activity.title}</h6>
              <div className="timeline-date text-muted small">
                <i className="ti ti-clock me-1"></i>
                {format(new Date(activity.date), 'dd MMMM yyyy, HH:mm', { locale: ro })}
                {activity.providerName && (
                  <>
                    {' • '}
                    <i className="ti ti-user-md me-1"></i>
                    {activity.providerName}
                  </>
                )}
              </div>
            </div>
            <Badge variant={`soft-${color}`} size="sm">
              {config.label}
            </Badge>
          </div>
        </div>

        {/* Description (if exists) */}
        {activity.description && !expanded && (
          <p className="timeline-description text-muted small mb-2">
            {activity.description.length > 150
              ? `${activity.description.slice(0, 150)}...`
              : activity.description}
          </p>
        )}

        {/* Expanded Body */}
        {expanded && (
          <div className="timeline-body mt-3">
            {activity.description && (
              <p className="text-muted small mb-3">{activity.description}</p>
            )}

            {/* Metadata */}
            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
              <div className="p-3 bg-light rounded">
                <div className="small fw-semibold mb-2">Detalii</div>
                <div className="row g-2">
                  {Object.entries(activity.metadata).map(([key, value]) => (
                    <div key={key} className="col-md-6">
                      <div className="timeline-detail">
                        <span className="text-muted">{formatMetadataLabel(key)}:</span>
                        <span className="ms-1 fw-medium">{formatMetadataValue(value)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="timeline-actions mt-3">
          <div className="d-flex gap-2 flex-wrap">
            {/* Expand/Collapse */}
            {(activity.description || (activity.metadata && Object.keys(activity.metadata).length > 0)) && (
              <Button
                variant="soft-secondary"
                size="sm"
                onClick={() => setExpanded(!expanded)}
              >
                <i className={`ti ${expanded ? 'ti-chevron-up' : 'ti-chevron-down'} me-1`}></i>
                {expanded ? 'Ascunde' : 'Vezi detalii'}
              </Button>
            )}

            {/* View Details (external) */}
            {activity.relatedId && onViewDetails && (
              <Button
                variant="soft-primary"
                size="sm"
                onClick={() => onViewDetails(activity)}
              >
                <i className="ti ti-external-link me-1"></i>
                Deschide
              </Button>
            )}

            {/* Type-specific actions */}
            {activity.type === 'document' && activity.relatedId && (
              <Button
                variant="soft-info"
                size="sm"
                onClick={() => {
                  // Download document
                  window.open(`/api/documents/${activity.relatedId}/download`, '_blank');
                }}
              >
                <i className="ti ti-download me-1"></i>
                Descarca
              </Button>
            )}

            {activity.type === 'payment' && activity.relatedId && (
              <Button
                variant="soft-success"
                size="sm"
                onClick={() => {
                  window.location.href = `/billing/payments/${activity.relatedId}`;
                }}
              >
                <i className="ti ti-receipt me-1"></i>
                Vezi Chitanta
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function formatMetadataLabel(key: string): string {
  const labels: Record<string, string> = {
    status: 'Status',
    amount: 'Suma',
    procedureCode: 'Cod procedura',
    procedureName: 'Procedura',
    duration: 'Durata',
    location: 'Locatie',
    tooth: 'Dinte',
    surfaces: 'Suprafete',
    diagnosis: 'Diagnostic',
    category: 'Categorie',
    appointmentType: 'Tip programare',
    paymentMethod: 'Metoda plata',
  };
  return labels[key] || key;
}

function formatMetadataValue(value: any): string {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'boolean') return value ? 'Da' : 'Nu';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export default TimelineEntry;
