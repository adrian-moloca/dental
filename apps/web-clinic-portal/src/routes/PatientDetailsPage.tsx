/**
 * Patient Details Page
 */

import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { usePatient, useUpdatePatient, useDeletePatient, usePatientBalance } from '../hooks/usePatients';
import { useAppointments } from '../hooks/useAppointments';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { Timeline } from '../components/data/Timeline';
import { DocumentList } from '../components/data/DocumentList';
import { PatientForm } from '../components/patients/PatientForm';
import { AlertBanner } from '../components/patients/AlertBanner';
import { BalanceCard } from '../components/patients/BalanceCard';
import { VisitHistory } from '../components/patients/VisitHistory';
import type { CreatePatientDto } from '../types/patient.types';

export default function PatientDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = usePatient(id);
  const { data: balanceData, isLoading: balanceLoading } = usePatientBalance(id);
  const { data: appointmentsData, isLoading: appointmentsLoading } = useAppointments({
    patientId: id,
    status: 'completed',
    limit: 3,
  });
  const updatePatient = useUpdatePatient();
  const deletePatient = useDeletePatient();
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'documents'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleUpdate = async (formData: CreatePatientDto) => {
    if (!id) return;

    try {
      setErrorMessage('');
      await updatePatient.mutateAsync({ id, data: formData });
      setIsEditing(false);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || error.message || 'Failed to update patient');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      return;
    }

    try {
      await deletePatient.mutateAsync(id);
      navigate('/patients');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || error.message || 'Failed to delete patient');
    }
  };

  const handleCollectPayment = () => {
    navigate(`/billing/payments/new?patientId=${id}`);
  };

  if (isLoading) {
    return (
      <AppShell title="Patient details">
        <Card tone="glass" padding="lg">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin h-8 w-8 border-4 border-brand-300 border-t-transparent rounded-full" />
              <p className="text-slate-300">Loading patient details...</p>
            </div>
          </div>
        </Card>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Patient details">
        <Card tone="glass" padding="lg" className="text-red-300 border border-red-500/30">
          <h3 className="font-semibold mb-2">Error loading patient</h3>
          <p className="text-sm">{(error as Error).message}</p>
        </Card>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell title="Patient details">
        <Card tone="glass" padding="lg">
          <p className="text-slate-300">Patient not found</p>
        </Card>
      </AppShell>
    );
  }

  const patient = data.data;

  // Extract medical alerts from patient data
  const allergies = patient.medicalHistory?.allergies;
  const medicalConditions = patient.medicalHistory?.conditions;
  const medications = patient.medicalHistory?.medications;

  // Transform appointments to visits
  const visits = appointmentsData?.data?.map((apt: any) => ({
    id: apt.id,
    appointmentDate: apt.startTime,
    appointmentType: apt.appointmentType?.name || 'General Visit',
    status: apt.status === 'completed' ? 'completed' : apt.status === 'no_show' ? 'no_show' : 'cancelled',
    providerName: apt.providerName || apt.provider?.name,
    proceduresSummary: apt.notes || apt.reasonForVisit,
    notes: apt.internalNotes,
  })) || [];

  const timelineItems = [
    { id: 't1', title: 'Appointment completed', detail: 'Prophylaxis + fluoride', time: 'Today 10:30', tone: 'success' as const },
    { id: 't2', title: 'Treatment plan accepted', detail: 'Ortho aligners phase 1', time: 'Yesterday', tone: 'info' as const },
    { id: 't3', title: 'Invoice issued', detail: 'INV-204 • RON 320', time: '3 days ago', tone: 'info' as const },
  ];
  const documents = [
    { id: 'd1', name: 'Panoramic X-Ray.pdf', type: 'X-Ray', uploadedAt: new Date().toISOString(), size: '1.2 MB' },
    { id: 'd2', name: 'Consent Form.pdf', type: 'Consent', uploadedAt: new Date().toISOString(), size: '220 KB' },
  ];

  return (
    <AppShell
      title={`${patient.firstName} ${patient.lastName}`}
      subtitle="Patient profile, contacts, and next actions."
      actions={
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <Button
                variant="ghost"
                onClick={() => setIsEditing(true)}
              >
                Edit Patient
              </Button>
              <Button
                as={Link}
                to="/patients"
                variant="ghost"
              >
                Back to patients
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {errorMessage && (
          <Card tone="glass" padding="lg" className="text-red-300 border border-red-500/30">
            {errorMessage}
          </Card>
        )}

        {isEditing ? (
          <Card tone="glass" padding="lg">
            <PatientForm
              initialData={{
                ...patient,
                gender: patient.gender as 'male' | 'female' | 'other' | undefined,
              }}
              onSubmit={handleUpdate}
              onCancel={() => {
                setIsEditing(false);
                setErrorMessage('');
              }}
              isSubmitting={updatePatient.isPending}
              mode="edit"
            />
          </Card>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <Tabs
                tabs={[
                  { id: 'overview', label: 'Overview' },
                  { id: 'timeline', label: 'Timeline', badge: timelineItems.length },
                  { id: 'documents', label: 'Documents', badge: documents.length },
                ]}
                defaultTab="overview"
                onChange={(id) => setActiveTab(id as 'overview' | 'timeline' | 'documents')}
              />
              <Button
                as={Link}
                to="/appointments/create"
                state={{ patientId: patient.id }}
              >
                Create appointment
              </Button>
            </div>

            {activeTab === 'overview' && (
              <>
                {/* Medical Alerts Banner - Full Width */}
                <AlertBanner
                  allergies={allergies}
                  medicalConditions={medicalConditions}
                  medications={medications}
                />

                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Left Column - Patient Info + Visit History */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card padding="lg" tone="glass" className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand-500/30 border border-brand-300/40 flex items-center justify-center text-white font-semibold">
                      {patient.firstName?.[0]}
                      {patient.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm text-slate-300">Patient information</p>
                      <p className="text-lg font-semibold text-white">
                        {patient.firstName} {patient.lastName}
                      </p>
                    </div>
                    <Badge tone="neutral">Active</Badge>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Date of birth" value={new Date(patient.dateOfBirth).toLocaleDateString()} />
                    <Field label="Gender" value={patient.gender || 'Not specified'} />
                    <Field label="Email" value={patient.emails?.[0]?.address || 'N/A'} />
                    <Field label="Phone" value={patient.phones?.[0]?.number || 'N/A'} />
                  </div>
                  {patient.address && (
                    <div>
                      <Field
                        label="Address"
                        value={`${patient.address.street || ''}, ${patient.address.city || ''}, ${patient.address.state || ''} ${patient.address.postalCode || ''}`.trim() || 'N/A'}
                      />
                    </div>
                  )}
                  {patient.notes && (
                    <div>
                      <Field label="Notes" value={patient.notes} />
                    </div>
                  )}
                      <div className="pt-4 border-t border-white/10">
                        <Button
                          variant="ghost"
                          onClick={handleDelete}
                          className="text-red-400 hover:text-red-300 hover:border-red-500/50"
                        >
                          Delete Patient
                        </Button>
                      </div>
                    </Card>

                    {/* Visit History */}
                    <VisitHistory
                      visits={visits}
                      patientId={patient.id}
                      isLoading={appointmentsLoading}
                    />
                  </div>

                  {/* Right Column - Quick Actions + Balance */}
                  <div className="space-y-6">
                    {/* Balance Card */}
                    {balanceData && (
                      <BalanceCard
                        balance={balanceData}
                        onCollectPayment={handleCollectPayment}
                        isLoading={balanceLoading}
                      />
                    )}

                    {/* Quick Actions Card */}
                    <Card padding="lg" tone="glass" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-400">Quick Actions</p>
                          <p className="text-lg font-semibold text-white">Patient Management</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Button
                          as={Link}
                          to="/appointments/create"
                          state={{ patientId: patient.id }}
                          fullWidth
                        >
                          Schedule Appointment
                        </Button>
                        <Button
                          as={Link}
                          to={`/clinical/charting?patientId=${patient.id}`}
                          variant="soft"
                          fullWidth
                        >
                          View Clinical Chart
                        </Button>
                        <Button
                          as={Link}
                          to={`/clinical/treatment-plans?patientId=${patient.id}`}
                          variant="soft"
                          fullWidth
                        >
                          Treatment Plans
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'timeline' && <Timeline items={timelineItems} />}
            {activeTab === 'documents' && <DocumentList items={documents} />}
          </>
        )}
      </div>
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/5 px-3 py-3">
      <p className="text-xs uppercase tracking-[0.1em] text-slate-400">{label}</p>
      <div className="mt-1 text-sm text-white">{value}</div>
    </div>
  );
}
