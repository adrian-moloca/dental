/**
 * Create Appointment Page - Preclinic-style
 *
 * Multi-step appointment creation with patient selection, provider, and scheduling.
 */

import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useCreateAppointment } from '../hooks/useAppointments';
import type { CreateAppointmentDto } from '../types/appointment.types';
import type { PatientDto } from '../types/patient.types';
import { AppShell } from '../components/layout/AppShell';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Textarea,
  Badge,
} from '../components/ui-new';
import { PatientSearchSelect } from '../components/appointments/PatientSearchSelect';
import { ProviderSelect } from '../components/appointments/ProviderSelect';
import { LocationSelect } from '../components/appointments/LocationSelect';
import { PatientSummaryCard } from '../components/appointments/PatientSummaryCard';
import { AppointmentTypeSelect } from '../components/appointments/AppointmentTypeSelect';
import toast from 'react-hot-toast';
import { format, addHours } from 'date-fns';

export default function CreateAppointmentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createAppointment = useCreateAppointment();

  // Get patientId from URL params or state
  const initialPatientId = searchParams.get('patientId') || location.state?.patientId || '';
  const isEditing = !!searchParams.get('edit');

  // TODO: Get clinicId from user context
  const clinicId = 'temp-clinic-id';

  const [selectedPatient, setSelectedPatient] = useState<PatientDto | undefined>();
  const [formData, setFormData] = useState<Partial<CreateAppointmentDto>>({
    patientId: initialPatientId,
    providerId: '',
    locationId: '',
    serviceCode: '',
    start: new Date(),
    end: addHours(new Date(), 1),
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientId) {
      newErrors.patientId = 'Selectarea pacientului este obligatorie';
    }
    if (!formData.providerId) {
      newErrors.providerId = 'Selectarea doctorului este obligatorie';
    }
    if (!formData.locationId) {
      newErrors.locationId = 'Selectarea cabinetului este obligatorie';
    }
    if (!formData.serviceCode || formData.serviceCode.trim() === '') {
      newErrors.serviceCode = 'Tipul programarii este obligatoriu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePatientChange = (
    patientId: string | undefined,
    patient: PatientDto | undefined
  ) => {
    setFormData({ ...formData, patientId: patientId || '' });
    setSelectedPatient(patient);
    if (patientId) {
      setErrors({ ...errors, patientId: '' });
    }
  };

  const handleProviderChange = (providerId: string) => {
    setFormData({ ...formData, providerId });
    if (providerId) {
      setErrors({ ...errors, providerId: '' });
    }
  };

  const handleLocationChange = (locationId: string) => {
    setFormData({ ...formData, locationId });
    if (locationId) {
      setErrors({ ...errors, locationId: '' });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Completeaza toate campurile obligatorii');
      return;
    }

    try {
      await createAppointment.mutateAsync(formData as CreateAppointmentDto);
      toast.success('Programare creata cu succes!');
      navigate('/appointments');
    } catch (error) {
      console.error('Failed to create appointment:', error);
      toast.error('Eroare la crearea programarii. Incearca din nou.');
      setErrors({
        submit: 'Eroare la crearea programarii. Incearca din nou.',
      });
    }
  };

  return (
    <AppShell
      title={isEditing ? 'Editeaza Programare' : 'Programare Noua'}
      subtitle="Completeaza detaliile pentru a crea o programare"
      actions={
        <Button variant="outline-secondary" onClick={() => navigate('/appointments')}>
          <i className="ti ti-arrow-left me-1"></i>
          Inapoi la lista
        </Button>
      }
    >
      <div className="row g-4">
        {/* Main Form */}
        <div className="col-lg-8">
          <form onSubmit={handleSubmit}>
            {/* Patient Selection Card */}
            <Card className="shadow-sm mb-4">
              <CardHeader>
                <div className="d-flex align-items-center gap-2">
                  <div className="avatar avatar-sm bg-primary-transparent rounded">
                    <i className="ti ti-user text-primary"></i>
                  </div>
                  <div>
                    <h5 className="card-title mb-0">Informatii Pacient</h5>
                    <small className="text-muted">Cauta si selecteaza pacientul</small>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <PatientSearchSelect
                  value={formData.patientId}
                  onChange={handlePatientChange}
                  label="Pacient"
                  error={errors.patientId}
                  required
                />
              </CardBody>
            </Card>

            {/* Appointment Details Card */}
            <Card className="shadow-sm mb-4">
              <CardHeader>
                <div className="d-flex align-items-center gap-2">
                  <div className="avatar avatar-sm bg-info-transparent rounded">
                    <i className="ti ti-calendar-event text-info"></i>
                  </div>
                  <div>
                    <h5 className="card-title mb-0">Detalii Programare</h5>
                    <small className="text-muted">Doctor, cabinet si tip serviciu</small>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="row g-3">
                  <div className="col-md-6">
                    <ProviderSelect
                      value={formData.providerId}
                      onChange={handleProviderChange}
                      clinicId={clinicId}
                      label="Doctor"
                      error={errors.providerId}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <LocationSelect
                      value={formData.locationId}
                      onChange={handleLocationChange}
                      clinicId={clinicId}
                      label="Cabinet"
                      error={errors.locationId}
                      required
                      filterType="TREATMENT_ROOM"
                    />
                  </div>
                  <div className="col-12">
                    <AppointmentTypeSelect
                      value={formData.serviceCode}
                      onChange={(serviceCode) => {
                        setFormData({ ...formData, serviceCode });
                        if (serviceCode) {
                          setErrors({ ...errors, serviceCode: '' });
                        }
                      }}
                      label="Tip Programare"
                      error={errors.serviceCode}
                      required
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Date & Time Card */}
            <Card className="shadow-sm mb-4">
              <CardHeader>
                <div className="d-flex align-items-center gap-2">
                  <div className="avatar avatar-sm bg-success-transparent rounded">
                    <i className="ti ti-clock text-success"></i>
                  </div>
                  <div>
                    <h5 className="card-title mb-0">Data si Ora</h5>
                    <small className="text-muted">Selecteaza intervalul orar</small>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">
                      Data si Ora Inceput <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="ti ti-calendar"></i>
                      </span>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={
                          formData.start
                            ? format(new Date(formData.start), "yyyy-MM-dd'T'HH:mm")
                            : ''
                        }
                        onChange={(e) =>
                          setFormData({ ...formData, start: new Date(e.target.value) })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">
                      Data si Ora Sfarsit <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="ti ti-calendar"></i>
                      </span>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={
                          formData.end
                            ? format(new Date(formData.end), "yyyy-MM-dd'T'HH:mm")
                            : ''
                        }
                        onChange={(e) =>
                          setFormData({ ...formData, end: new Date(e.target.value) })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Duration Buttons */}
                <div className="mt-3">
                  <label className="form-label text-muted small">Durata rapida:</label>
                  <div className="d-flex flex-wrap gap-2">
                    {[15, 30, 45, 60, 90, 120].map((mins) => (
                      <Button
                        key={mins}
                        type="button"
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => {
                          if (formData.start) {
                            const startDate = new Date(formData.start);
                            const endDate = new Date(startDate.getTime() + mins * 60000);
                            setFormData({ ...formData, end: endDate });
                          }
                        }}
                      >
                        {mins < 60 ? `${mins} min` : `${mins / 60}h`}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Notes Card */}
            <Card className="shadow-sm mb-4">
              <CardHeader>
                <div className="d-flex align-items-center gap-2">
                  <div className="avatar avatar-sm bg-warning-transparent rounded">
                    <i className="ti ti-notes text-warning"></i>
                  </div>
                  <div>
                    <h5 className="card-title mb-0">Note Aditionale</h5>
                    <small className="text-muted">Optional - informatii suplimentare</small>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <Textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Adauga note sau cerinte speciale pentru aceasta programare..."
                  rows={3}
                />
              </CardBody>
            </Card>

            {/* Error Message */}
            {errors.submit && (
              <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
                <i className="ti ti-alert-circle"></i>
                <span>{errors.submit}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="d-flex gap-3">
              <Button
                type="button"
                variant="outline-secondary"
                size="lg"
                className="flex-fill"
                onClick={() => navigate('/appointments')}
              >
                <i className="ti ti-x me-1"></i>
                Anuleaza
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="flex-fill"
                loading={createAppointment.isPending}
              >
                {createAppointment.isPending ? (
                  'Se creeaza...'
                ) : (
                  <>
                    <i className="ti ti-check me-1"></i>
                    {isEditing ? 'Salveaza Modificarile' : 'Creeaza Programare'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Sidebar - Patient Summary */}
        <div className="col-lg-4">
          {selectedPatient ? (
            <div className="sticky-top" style={{ top: 90 }}>
              <Card className="shadow-sm mb-4">
                <CardHeader>
                  <div className="d-flex align-items-center justify-content-between">
                    <h6 className="card-title mb-0">Pacient Selectat</h6>
                    <Badge variant="soft-success">
                      <i className="ti ti-check me-1"></i>
                      Selectat
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody className="p-0">
                  <PatientSummaryCard patient={selectedPatient} />
                </CardBody>
              </Card>

              {/* Quick Info */}
              <Card className="shadow-sm">
                <CardBody>
                  <h6 className="fw-semibold mb-3">
                    <i className="ti ti-info-circle me-2 text-primary"></i>
                    Informatii Utile
                  </h6>
                  <ul className="list-unstyled mb-0 text-muted small">
                    <li className="mb-2">
                      <i className="ti ti-point me-1"></i>
                      Programarile pot fi modificate cu 24h inainte
                    </li>
                    <li className="mb-2">
                      <i className="ti ti-point me-1"></i>
                      Pacientul va primi confirmare automata
                    </li>
                    <li className="mb-2">
                      <i className="ti ti-point me-1"></i>
                      Verifica disponibilitatea doctorului
                    </li>
                    <li>
                      <i className="ti ti-point me-1"></i>
                      Pentru urgente, foloseste optiunea rapida
                    </li>
                  </ul>
                </CardBody>
              </Card>
            </div>
          ) : (
            <Card className="shadow-sm">
              <CardBody className="text-center py-5">
                <div className="avatar avatar-xl bg-light rounded-circle mx-auto mb-3">
                  <i className="ti ti-user-search fs-32 text-muted"></i>
                </div>
                <h6 className="fw-semibold mb-2">Niciun Pacient Selectat</h6>
                <p className="text-muted small mb-0">
                  Cauta si selecteaza un pacient pentru a vedea informatiile sale
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
