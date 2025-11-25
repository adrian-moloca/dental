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

export default function CreatePatientPage() {
  const navigate = useNavigate();
  const createPatient = useCreatePatient();
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (data: CreatePatientDto) => {
    try {
      setErrorMessage('');
      const result = await createPatient.mutateAsync(data);

      if (result.success && result.data?.id) {
        navigate(`/patients/${result.data.id}`);
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || error.message || 'Failed to create patient');
    }
  };

  const handleCancel = () => {
    navigate('/patients');
  };

  return (
    <AppShell
      title="New Patient"
      subtitle="Add a new patient to your clinic roster"
      actions={
        <Button
          as={Link}
          to="/patients"
          variant="ghost"
        >
          Back to patients
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
