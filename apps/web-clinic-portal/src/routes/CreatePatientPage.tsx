/**
 * Create Patient Page
 *
 * Uses the new wizard-based PatientFormWizard for better UX:
 * - Step-by-step guided flow
 * - Clear progress indicator
 * - Required vs optional sections clearly marked
 * - Better spacing and visual hierarchy
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCreatePatient } from '../hooks/usePatients';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PatientFormWizard } from '../components/patients/PatientFormWizard';
import type { CreatePatientDto } from '../types/patient.types';
import toast from 'react-hot-toast';

export default function CreatePatientPage() {
  const navigate = useNavigate();
  const createPatient = useCreatePatient();
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/patients');
    }
  };

  const handleSubmit = async (data: CreatePatientDto) => {
    try {
      setErrorMessage('');
      const patient = await createPatient.mutateAsync(data);

      if (patient?.id) {
        toast.success('Pacient creat cu succes!');
        navigate(`/patients/${patient.id}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare la crearea pacientului';
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleCancel = () => {
    handleBack();
  };

  return (
    <AppShell
      title="Pacient Nou"
      subtitle="Înregistrează un pacient nou în evidența clinicii"
      actions={
        <Button
          as={Link}
          to="/patients"
          variant="ghost"
        >
          <i className="ti ti-arrow-left me-2"></i>
          Înapoi la Pacienți
        </Button>
      }
    >
      <div className="max-w-4xl mx-auto">
        {errorMessage && (
          <Card tone="glass" padding="lg" className="mb-6 text-red-300 border border-red-500/30">
            <div className="d-flex align-items-center gap-3">
              <i className="ti ti-alert-circle fs-20"></i>
              <div>
                <strong>Eroare</strong>
                <p className="mb-0 small">{errorMessage}</p>
              </div>
            </div>
          </Card>
        )}

        <Card tone="glass" padding="lg">
          <PatientFormWizard
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={createPatient.isPending}
          />
        </Card>
      </div>
    </AppShell>
  );
}
