/**
 * Patient Edit Page - Modern Preclinic Design
 *
 * Edit existing patient information with pre-populated form
 */

import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePatient, useUpdatePatient } from '../hooks/usePatients';
import { AppShell } from '../components/layout/AppShell';
import {
  Card,
  CardBody,
  Button,
  Breadcrumb,
  LoadingState,
  ErrorState,
  type BreadcrumbItem,
} from '../components/ui-new';
import { PatientForm } from '../components/patients/PatientForm';
import type { UpdatePatientDto } from '../types/patient.types';
import toast from 'react-hot-toast';

export default function PatientEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: patientData, isLoading, error } = usePatient(id);
  const updatePatient = useUpdatePatient();

  const patient = patientData?.data;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(`/patients/${id}`);
    }
  };

  const handleSubmit = async (data: UpdatePatientDto) => {
    if (!id) return;

    try {
      await updatePatient.mutateAsync({ id, data });
      toast.success('Pacient actualizat cu succes!');
      navigate(`/patients/${id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eroare la actualizarea pacientului';
      toast.error(message);
    }
  };

  const handleCancel = () => {
    handleBack();
  };

  // Breadcrumb navigation
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: 'ti ti-home' },
    { label: 'Pacienti', href: '/patients', icon: 'ti ti-users' },
    {
      label: patient ? `${patient.firstName} ${patient.lastName}` : 'Detalii',
      href: `/patients/${id}`,
      icon: 'ti ti-user',
    },
    { label: 'Editeaza', icon: 'ti ti-edit' },
  ];

  // Loading state
  if (isLoading) {
    return (
      <AppShell title="Editeaza Pacient">
        <Breadcrumb items={breadcrumbItems} className="mb-3" />
        <Card className="shadow-sm">
          <CardBody>
            <LoadingState message="Se incarca datele pacientului..." />
          </CardBody>
        </Card>
      </AppShell>
    );
  }

  // Error state
  if (error || !patient) {
    return (
      <AppShell title="Editeaza Pacient">
        <Breadcrumb items={breadcrumbItems} className="mb-3" />
        <Card className="shadow-sm">
          <CardBody>
            <ErrorState
              title="Eroare la incarcarea pacientului"
              message={error ? (error as Error).message : 'Pacientul nu a fost gasit'}
              actions={
                <div className="d-flex gap-2 justify-content-center">
                  <Button variant="outline-secondary" onClick={handleBack}>
                    <i className="ti ti-arrow-left me-1"></i>
                    Inapoi
                  </Button>
                  <Button variant="primary" onClick={() => window.location.reload()}>
                    <i className="ti ti-refresh me-1"></i>
                    Reincearca
                  </Button>
                </div>
              }
            />
          </CardBody>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Editeaza Pacient"
      subtitle={`Modifica informatiile pentru ${patient.firstName} ${patient.lastName}`}
      actions={
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={handleBack}>
            <i className="ti ti-arrow-left me-1"></i>
            Inapoi
          </Button>
          <Link
            to={`/patients/${id}`}
            className="btn btn-soft-info"
          >
            <i className="ti ti-eye me-1"></i>
            Vezi Profil
          </Link>
        </div>
      }
    >
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={breadcrumbItems} className="mb-3" />

      {/* Patient Info Alert */}
      <div className="alert alert-soft-info mb-4">
        <div className="d-flex align-items-start gap-2">
          <i className="ti ti-info-circle fs-20 mt-1"></i>
          <div>
            <h6 className="mb-1 fw-bold">Editeaza Datele Pacientului</h6>
            <p className="mb-0 small">
              Modificarile vor fi salvate in istoricul pacientului. Asigura-te ca datele sunt corecte
              inainte de a salva.
            </p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <Card className="shadow-sm">
        <CardBody>
          <PatientForm
            initialData={{
              // Personal Information
              firstName: patient.firstName || patient.person?.firstName,
              lastName: patient.lastName || patient.person?.lastName,
              middleName: patient.person?.middleName,
              preferredName: patient.person?.preferredName,
              dateOfBirth: patient.dateOfBirth || patient.person?.dateOfBirth,
              gender: (patient.gender || patient.person?.gender) as any,
              cnp: patient.person?.cnp,
              nationality: 'Romana',
              occupation: (patient as any).occupation,
              employer: (patient as any).employer,

              // Contact Information
              phones: patient.phones || [],
              emails: patient.emails || [],
              whatsappSameAsPrimary: false,
              preferredContactMethod: (patient as any).preferredContactMethod || 'phone',

              // Address
              address: patient.address || {},

              // Emergency Contact
              emergencyContact: patient.emergencyContact,

              // Medical Alerts
              alerts: {
                allergies: patient.alerts?.allergies || [],
                medicalConditions: patient.alerts?.medicalConditions || [],
                medications: patient.alerts?.medications || [],
                flags: patient.alerts?.flags || [],
              },

              // Insurance
              insurance: patient.insurance?.[0],

              // GDPR Consent
              gdprConsent: true,
              marketingConsent: (patient as any).marketingConsent || false,
              smsRemindersConsent: (patient as any).smsRemindersConsent || false,
              emailRemindersConsent: (patient as any).emailRemindersConsent || false,

              // Additional
              notes: patient.notes,
            }}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={updatePatient.isPending}
            mode="edit"
          />
        </CardBody>
      </Card>

      {/* Unsaved Changes Warning */}
      {/* This would require state management to track form changes */}
    </AppShell>
  );
}
