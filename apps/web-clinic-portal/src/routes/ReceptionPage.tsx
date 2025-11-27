/**
 * Reception Page - Waiting Room Management
 *
 * Comprehensive reception/waiting room management interface with:
 * - Today's overview with live stats
 * - Waiting queue with live timers
 * - Upcoming appointments (next 2 hours)
 * - Current treatments panel
 * - Quick actions bar
 * - Patient arrival/check-in flow
 */

import { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui-new';
import { TodayOverviewHeader } from '../components/reception/TodayOverviewHeader';
import { WaitingQueuePanel } from '../components/reception/WaitingQueuePanel';
import { UpcomingAppointmentsPanel } from '../components/reception/UpcomingAppointmentsPanel';
import { CurrentTreatmentsPanel } from '../components/reception/CurrentTreatmentsPanel';
import { QuickActionsBar } from '../components/reception/QuickActionsBar';
import { PatientArrivalModal } from '../components/reception/PatientArrivalModal';
import { useReceptionQueue } from '../hooks/useReceptionQueue';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ReceptionPage() {
  const navigate = useNavigate();
  const [showArrivalModal, setShowArrivalModal] = useState(false);
  const [modalType, setModalType] = useState<'normal' | 'walkin' | 'emergency'>('normal');

  const { waiting, upcoming, inProgress, stats, isLoading, error, refetch } = useReceptionQueue();

  const handleWalkIn = () => {
    setModalType('walkin');
    setShowArrivalModal(true);
  };

  const handleEmergency = () => {
    setModalType('emergency');
    toast('Programare de urgenta va fi prioritizata!', {
      icon: '🚨',
      duration: 3000,
    });
    navigate('/appointments/create?type=emergency');
  };

  // Loading State
  if (isLoading) {
    return (
      <AppShell
        title="Receptie"
        subtitle="Sala de Asteptare"
        actions={
          <Button variant="primary" onClick={() => setShowArrivalModal(true)}>
            <i className="ti ti-user-check me-1"></i>
            Check-in Pacient
          </Button>
        }
      >
        <div className="row g-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="col-6 col-lg-3">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="placeholder-glow">
                    <span className="placeholder col-6 mb-2"></span>
                    <span className="placeholder col-4"></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4 mt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="col-lg-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="placeholder-glow">
                    <span className="placeholder col-12" style={{ height: 400 }}></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AppShell>
    );
  }

  // Error State
  if (error) {
    return (
      <AppShell
        title="Receptie"
        subtitle="Sala de Asteptare"
        actions={
          <Button variant="primary" onClick={() => setShowArrivalModal(true)}>
            <i className="ti ti-user-check me-1"></i>
            Check-in Pacient
          </Button>
        }
      >
        <div className="card border-danger shadow-sm">
          <div className="card-body text-center py-5">
            <div className="avatar avatar-xl bg-danger-transparent rounded-circle mx-auto mb-3">
              <i className="ti ti-alert-circle fs-32 text-danger"></i>
            </div>
            <h5 className="fw-bold mb-2">Eroare la Incarcarea Datelor</h5>
            <p className="text-muted mb-4">{(error as Error).message}</p>
            <Button variant="primary" onClick={() => refetch()}>
              <i className="ti ti-refresh me-1"></i>
              Reincearca
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  // Main Reception View
  return (
    <AppShell
      title="Receptie"
      subtitle="Gestioneaza sala de asteptare si tratamentele active"
      actions={
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={() => refetch()}>
            <i className="ti ti-refresh"></i>
          </Button>
          <Button variant="primary" onClick={() => setShowArrivalModal(true)}>
            <i className="ti ti-user-check me-1"></i>
            Check-in Pacient
          </Button>
        </div>
      }
    >
      {/* Today's Overview Header */}
      <TodayOverviewHeader stats={stats} />

      {/* Quick Actions Bar */}
      <QuickActionsBar onWalkInClick={handleWalkIn} onEmergencyClick={handleEmergency} />

      {/* 3-Column Layout: Waiting Queue | Upcoming | Current Treatments */}
      <div className="row g-4">
        {/* Left Column - Waiting Queue */}
        <div className="col-lg-4">
          <WaitingQueuePanel waiting={waiting} />
        </div>

        {/* Center Column - Upcoming Appointments */}
        <div className="col-lg-4">
          <UpcomingAppointmentsPanel upcoming={upcoming} />
        </div>

        {/* Right Column - Current Treatments */}
        <div className="col-lg-4">
          <CurrentTreatmentsPanel inProgress={inProgress} />
        </div>
      </div>

      {/* Empty State - All Columns Empty */}
      {waiting.length === 0 && upcoming.length === 0 && inProgress.length === 0 && (
        <div className="card shadow-sm mt-4">
          <div className="card-body text-center py-5">
            <div className="avatar avatar-xl bg-light rounded-circle mx-auto mb-3">
              <i className="ti ti-armchair fs-48 text-muted"></i>
            </div>
            <h5 className="fw-bold mb-2">Sala de Asteptare Goala</h5>
            <p className="text-muted mb-4">
              Nu exista pacienti in asteptare sau tratamente active in acest moment.
              <br />
              Foloseste butoanele de mai jos pentru a gestiona programarile.
            </p>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <Button variant="primary" onClick={() => setShowArrivalModal(true)}>
                <i className="ti ti-user-check me-1"></i>
                Check-in Pacient
              </Button>
              <Button variant="info" onClick={() => navigate('/appointments')}>
                <i className="ti ti-calendar me-1"></i>
                Vezi Programari
              </Button>
              <Button variant="outline-secondary" onClick={handleWalkIn}>
                <i className="ti ti-user-plus me-1"></i>
                Pacient Walk-in
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Arrival/Check-in Modal */}
      <PatientArrivalModal open={showArrivalModal} onClose={() => setShowArrivalModal(false)} />

      {/* Print Styles for Daily Schedule */}
      <style>
        {`
          @media print {
            .sidebar,
            .topbar,
            .page-header,
            .quick-actions-bar,
            button,
            .btn {
              display: none !important;
            }

            .card {
              page-break-inside: avoid;
              border: 1px solid #ddd !important;
            }

            body {
              font-size: 12pt;
            }

            h1, h2, h3, h4, h5, h6 {
              page-break-after: avoid;
            }
          }
        `}
      </style>
    </AppShell>
  );
}
