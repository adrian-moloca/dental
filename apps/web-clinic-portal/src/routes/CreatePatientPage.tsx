/**
 * Create Patient Page
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCreatePatient } from '../hooks/usePatients';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PatientForm } from '../components/patients/PatientForm';
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
      const result = await createPatient.mutateAsync(data);

      if (result.success && result.data?.id) {
        toast.success('Pacient creat cu succes!');
        navigate(`/patients/${result.data.id}`);
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
      subtitle="Adauga un pacient nou in evidenta clinicii"
      actions={
        <Button
          as={Link}
          to="/patients"
          variant="ghost"
        >
          Inapoi la Pacienti
        </Button>
      }
    >
      <div className="max-w-4xl">
        {errorMessage && (
          <Card tone="glass" padding="lg" className="mb-6 text-red-300 border border-red-500/30">
            {errorMessage}
          </Card>
        )}

        <Card tone="glass" padding="lg">
          <PatientForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={createPatient.isPending}
          />
        </Card>
      </div>
    </AppShell>
  );
}
