/**
 * Create Appointment Page
 */

import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCreateAppointment } from '../hooks/useAppointments';
import type { CreateAppointmentDto } from '../types/appointment.types';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function CreateAppointmentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const createAppointment = useCreateAppointment();

  const [formData, setFormData] = useState<Partial<CreateAppointmentDto>>({
    patientId: location.state?.patientId || '',
    providerId: '',
    locationId: '',
    serviceCode: '',
    start: new Date(),
    end: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createAppointment.mutateAsync(formData as CreateAppointmentDto);
      navigate('/appointments');
    } catch (error) {
      console.error('Failed to create appointment:', error);
    }
  };

  return (
    <AppShell
      title="Create appointment"
      subtitle="Lock the chair, set the provider, and capture the visit intent."
      actions={
        <Button as="a" href="/appointments" variant="ghost">
          Back to list
        </Button>
      }
    >
      <Card padding="lg" tone="glass">
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Patient ID"
            value={formData.patientId}
            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
            required
            placeholder="PAT-00123"
            fullWidth
          />
          <Input
            label="Provider ID"
            value={formData.providerId}
            onChange={(e) => setFormData({ ...formData, providerId: e.target.value })}
            required
            placeholder="PRV-019"
            fullWidth
          />
          <Input
            label="Location ID"
            value={formData.locationId}
            onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
            required
            placeholder="LOC-01"
            fullWidth
          />
          <Input
            label="Service code"
            value={formData.serviceCode}
            onChange={(e) => setFormData({ ...formData, serviceCode: e.target.value })}
            required
            placeholder="XRAY-101"
            fullWidth
          />
          <div className="sm:col-span-2">
            <Button type="submit" fullWidth loading={createAppointment.isPending}>
              {createAppointment.isPending ? 'Creating...' : 'Create appointment'}
            </Button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
