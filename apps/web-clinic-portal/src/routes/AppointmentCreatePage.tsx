/**
 * Create Appointment Page - Enhanced with Multi-Step Wizard
 *
 * Multi-step appointment creation with:
 * - Step 1: Patient selection with inline create option
 * - Step 2: Service & Provider selection with availability indicators
 * - Step 3: Date & Time selection with slot grid
 * - Step 4: Confirmation with summary and reminder options
 */

import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useCreateAppointment } from '../hooks/useAppointments';
import type { CreateAppointmentDto } from '../types/appointment.types';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui-new';
import { AppointmentBookingWizard } from '../components/appointments/AppointmentBookingWizard';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

export default function AppointmentCreatePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createAppointment = useCreateAppointment();
  const { user } = useAuth();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/appointments');
    }
  };

  // Get patientId from URL params or state
  const initialPatientId = searchParams.get('patientId') || location.state?.patientId || '';

  // Get clinicId from user context
  const clinicId = user?.clinicId || '';

  const handleSubmit = async (data: CreateAppointmentDto) => {
    try {
      await createAppointment.mutateAsync(data);
      toast.success('Programare creata cu succes!');
      navigate('/appointments');
    } catch (error) {
      console.error('Failed to create appointment:', error);
      toast.error('Eroare la crearea programarii. Incearca din nou.');
      throw error; // Re-throw to keep wizard in loading state
    }
  };

  const handleCancel = () => {
    // Show confirmation dialog if user wants to cancel
    if (window.confirm('Esti sigur ca vrei sa anulezi? Toate modificarile vor fi pierdute.')) {
      handleBack();
    }
  };

  return (
    <AppShell
      title="Programare Noua"
      subtitle="Completeaza toate pasii pentru a crea o programare noua"
      actions={
        <Button variant="outline-secondary" onClick={handleBack}>
          <i className="ti ti-arrow-left me-1"></i>
          Inapoi la Programari
        </Button>
      }
    >
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          {/* Info Banner */}
          <div className="alert alert-soft-info mb-4">
            <div className="d-flex align-items-start gap-3">
              <div className="flex-shrink-0">
                <i className="ti ti-info-circle fs-4 text-info"></i>
              </div>
              <div className="flex-grow-1">
                <h6 className="alert-heading fw-semibold mb-2">Ghid Rapid pentru Programari</h6>
                <ul className="mb-0 small">
                  <li>Selecteaza pacientul sau creeaza unul nou daca este prima vizita</li>
                  <li>Alege tipul serviciului si medicul care va efectua procedura</li>
                  <li>Selecteaza data si intervalul orar disponibil</li>
                  <li>Verifica detaliile si confirma programarea</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Wizard Component */}
          <AppointmentBookingWizard
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={createAppointment.isPending}
            initialPatientId={initialPatientId}
            clinicId={clinicId}
          />

          {/* Tips Section */}
          <div className="card border-0 shadow-sm mt-4">
            <div className="card-body">
              <h6 className="fw-semibold mb-3">
                <i className="ti ti-bulb text-warning me-2"></i>
                Sfaturi Utile
              </h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="d-flex gap-2">
                    <i className="ti ti-point text-primary mt-1"></i>
                    <div className="small">
                      <strong>Urgente:</strong> Pentru urgente, marcheaza programarea corespunzator pentru prioritizare
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex gap-2">
                    <i className="ti ti-point text-primary mt-1"></i>
                    <div className="small">
                      <strong>Confirmari:</strong> Pacientii primesc automat SMS si Email de confirmare
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex gap-2">
                    <i className="ti ti-point text-primary mt-1"></i>
                    <div className="small">
                      <strong>Modificari:</strong> Programarile pot fi modificate cu 24h inainte
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card border-0 shadow-sm mt-4">
            <div className="card-body">
              <h6 className="fw-semibold mb-3">Actiuni Rapide</h6>
              <div className="d-flex flex-wrap gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => navigate('/patients/create')}
                >
                  <i className="ti ti-user-plus me-1"></i>
                  Adauga Pacient Nou
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => navigate('/appointments')}
                >
                  <i className="ti ti-calendar me-1"></i>
                  Vezi Toate Programarile
                </Button>
                <Button
                  variant="outline-info"
                  size="sm"
                  onClick={() => navigate('/appointments/calendar')}
                >
                  <i className="ti ti-calendar-week me-1"></i>
                  Calendar Saptamanal
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
