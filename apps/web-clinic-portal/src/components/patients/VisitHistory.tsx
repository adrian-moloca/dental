/**
 * VisitHistory Component
 *
 * Displays recent patient visits with dates, status, and summaries.
 * Shows the last 3 visits with quick access to clinical notes.
 */

import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import clsx from 'clsx';

export interface Visit {
  id: string;
  appointmentDate: string;
  appointmentType?: string;
  status: 'completed' | 'no_show' | 'cancelled';
  providerName?: string;
  proceduresSummary?: string;
  notes?: string;
}

interface VisitHistoryProps {
  visits: Visit[];
  patientId: string;
  isLoading?: boolean;
}

export function VisitHistory({ visits, patientId, isLoading }: VisitHistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Astazi';
    if (diffDays === 1) return 'Ieri';
    if (diffDays < 7) return `acum ${diffDays} zile`;
    if (diffDays < 30) return `acum ${Math.floor(diffDays / 7)} saptamani`;
    if (diffDays < 365) return `acum ${Math.floor(diffDays / 30)} luni`;

    return date.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: Visit['status']) => {
    switch (status) {
      case 'completed':
        return <Badge tone="success">Finalizat</Badge>;
      case 'no_show':
        return <Badge tone="warning">Absent</Badge>;
      case 'cancelled':
        return <Badge tone="neutral">Anulat</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card padding="lg" tone="glass">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-l-2 border-white/10 pl-4 space-y-2">
              <div className="h-4 bg-white/10 rounded w-1/3" />
              <div className="h-3 bg-white/10 rounded w-2/3" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!visits || visits.length === 0) {
    return (
      <Card padding="lg" tone="glass">
        <div className="text-center py-8">
          <div className="mx-auto h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
            <svg
              className="h-6 w-6 text-slate-400"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm text-slate-400">Inca nu exista istoric de vizite</p>
          <p className="text-xs text-slate-500 mt-1">Programarile finalizate vor aparea aici</p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg" tone="glass" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Vizite Recente</h3>
        <Button
          as={Link}
          to={`/appointments?patientId=${patientId}&status=completed`}
          variant="ghost"
          size="sm"
        >
          Vezi Toate
        </Button>
      </div>

      <div className="space-y-4">
        {visits.slice(0, 3).map((visit, index) => (
          <div
            key={visit.id}
            className={clsx(
              'border-l-2 pl-4 pb-4',
              visit.status === 'completed'
                ? 'border-brand-400'
                : visit.status === 'no_show'
                ? 'border-yellow-500'
                : 'border-slate-600',
              index !== visits.length - 1 && index !== 2 && 'border-b border-white/5'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-white">
                    {formatFullDate(visit.appointmentDate)}
                  </p>
                  <span className="text-xs text-slate-400">•</span>
                  <p className="text-xs text-slate-400">{formatDate(visit.appointmentDate)}</p>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  {getStatusBadge(visit.status)}
                  {visit.appointmentType && (
                    <span className="text-xs text-slate-300">{visit.appointmentType}</span>
                  )}
                </div>

                {visit.providerName && (
                  <p className="text-xs text-slate-400 mb-1">
                    Medic: <span className="text-slate-300">{visit.providerName}</span>
                  </p>
                )}

                {visit.proceduresSummary && (
                  <p className="text-sm text-slate-200 mt-2">{visit.proceduresSummary}</p>
                )}

                {visit.notes && (
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{visit.notes}</p>
                )}
              </div>

              {visit.status === 'completed' && (
                <Button
                  as={Link}
                  to={`/clinical/notes?appointmentId=${visit.id}`}
                  variant="ghost"
                  size="sm"
                >
                  Vezi Notite
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {visits.length > 3 && (
        <div className="pt-2 border-t border-white/10">
          <Button
            as={Link}
            to={`/appointments?patientId=${patientId}`}
            variant="soft"
            fullWidth
          >
            Vezi {visits.length - 3} Vizite Suplimentare
          </Button>
        </div>
      )}
    </Card>
  );
}
