/**
 * Patient Arrival Modal Component
 *
 * Handles patient check-in flow with contact verification and consent signing.
 */

import { useState } from 'react';
import { Modal, Button, Input, Badge } from '../ui-new';
import { useCheckInAppointment } from '../../hooks/useAppointments';
import toast from 'react-hot-toast';

interface PatientArrivalModalProps {
  open: boolean;
  onClose: () => void;
}

type CheckInStep = 'search' | 'verify' | 'contacts' | 'consent' | 'complete';

export function PatientArrivalModal({ open, onClose }: PatientArrivalModalProps) {
  const [step, setStep] = useState<CheckInStep>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [_selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
  });
  const [consentsAccepted, setConsentsAccepted] = useState({
    gdpr: false,
    treatment: false,
  });

  const checkIn = useCheckInAppointment();

  // Mock appointment data
  const mockAppointment = {
    id: 'apt-001',
    patientName: 'Ion Popescu',
    patientId: 'PAT-001',
    time: '10:00',
    provider: 'Dr. Ionescu',
    service: 'Consultatie',
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSelectedAppointment(mockAppointment.id);
      setStep('verify');
    }
  };

  const handleVerifyAppointment = () => {
    setStep('contacts');
  };

  const handleUpdateContacts = () => {
    if (!contactInfo.phone || !contactInfo.email) {
      toast.error('Va rugam completati toate campurile');
      return;
    }
    setStep('consent');
  };

  const handleAcceptConsents = async () => {
    if (!consentsAccepted.gdpr || !consentsAccepted.treatment) {
      toast.error('Va rugam acceptati toate consimtamintele');
      return;
    }

    try {
      await checkIn.mutateAsync(mockAppointment.id);
      setStep('complete');
      setTimeout(() => {
        handleClose();
        toast.success('Check-in realizat cu succes!');
      }, 2000);
    } catch {
      toast.error('Eroare la check-in');
    }
  };

  const handleClose = () => {
    setStep('search');
    setSearchQuery('');
    setSelectedAppointment(null);
    setContactInfo({ phone: '', email: '' });
    setConsentsAccepted({ gdpr: false, treatment: false });
    onClose();
  };

  const renderStepIndicator = () => (
    <div className="d-flex justify-content-center mb-4">
      <div className="d-flex align-items-center gap-2">
        {(['search', 'verify', 'contacts', 'consent', 'complete'] as CheckInStep[]).map(
          (s, idx) => {
            const isActive = s === step;
            const isCompleted =
              (['search', 'verify', 'contacts', 'consent', 'complete'] as CheckInStep[]).indexOf(
                step
              ) >
              (['search', 'verify', 'contacts', 'consent', 'complete'] as CheckInStep[]).indexOf(
                s
              );

            return (
              <div key={s} className="d-flex align-items-center">
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center ${
                    isCompleted
                      ? 'bg-success text-white'
                      : isActive
                        ? 'bg-primary text-white'
                        : 'bg-light text-muted'
                  }`}
                  style={{ width: 32, height: 32 }}
                >
                  {isCompleted ? <i className="ti ti-check"></i> : idx + 1}
                </div>
                {idx < 4 && (
                  <div
                    className={`mx-2 ${isCompleted ? 'bg-success' : 'bg-light'}`}
                    style={{ width: 40, height: 2 }}
                  ></div>
                )}
              </div>
            );
          }
        )}
      </div>
    </div>
  );

  const renderSearchStep = () => (
    <div>
      <h5 className="fw-bold mb-3">Cauta Pacient sau Programare</h5>
      <div className="mb-4">
        <Input
          label="Nume Pacient, CNP, sau Numar Telefon"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Ex: Ion Popescu, 1234567890123"
          icon="ti ti-search"
          autoFocus
        />
      </div>
      <div className="d-flex justify-content-end gap-2">
        <Button variant="outline-secondary" onClick={handleClose}>
          Anuleaza
        </Button>
        <Button variant="primary" onClick={handleSearch}>
          <i className="ti ti-search me-1"></i>
          Cauta
        </Button>
      </div>
    </div>
  );

  const renderVerifyStep = () => (
    <div>
      <h5 className="fw-bold mb-3">Verifica Programarea</h5>

      <div className="card border mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="avatar avatar-lg bg-primary-transparent rounded-circle">
              <span className="avatar-text text-primary fw-bold">IP</span>
            </div>
            <div>
              <h6 className="mb-0 fw-semibold">{mockAppointment.patientName}</h6>
              <small className="text-muted">ID: {mockAppointment.patientId}</small>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-6">
              <small className="text-muted d-block mb-1">Ora Programare</small>
              <div className="d-flex align-items-center gap-2">
                <i className="ti ti-clock text-primary"></i>
                <span className="fw-medium">{mockAppointment.time}</span>
              </div>
            </div>
            <div className="col-6">
              <small className="text-muted d-block mb-1">Doctor</small>
              <div className="d-flex align-items-center gap-2">
                <i className="ti ti-user-circle text-primary"></i>
                <span className="fw-medium">{mockAppointment.provider}</span>
              </div>
            </div>
            <div className="col-12">
              <small className="text-muted d-block mb-1">Serviciu</small>
              <Badge variant="soft-info">{mockAppointment.service}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between">
        <Button variant="outline-secondary" onClick={() => setStep('search')}>
          <i className="ti ti-arrow-left me-1"></i>
          Inapoi
        </Button>
        <Button variant="primary" onClick={handleVerifyAppointment}>
          Confirma
          <i className="ti ti-arrow-right ms-1"></i>
        </Button>
      </div>
    </div>
  );

  const renderContactsStep = () => (
    <div>
      <h5 className="fw-bold mb-3">Actualizeaza Date de Contact</h5>
      <p className="text-muted small mb-4">
        Va rugam verificati si actualizati datele de contact ale pacientului
      </p>

      <div className="mb-3">
        <Input
          label="Numar de Telefon"
          type="tel"
          value={contactInfo.phone}
          onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
          placeholder="+40 700 000 000"
          icon="ti ti-phone"
          required
        />
      </div>

      <div className="mb-4">
        <Input
          label="Email"
          type="email"
          value={contactInfo.email}
          onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
          placeholder="email@exemplu.ro"
          icon="ti ti-mail"
          required
        />
      </div>

      <div className="d-flex justify-content-between">
        <Button variant="outline-secondary" onClick={() => setStep('verify')}>
          <i className="ti ti-arrow-left me-1"></i>
          Inapoi
        </Button>
        <Button variant="primary" onClick={handleUpdateContacts}>
          Continua
          <i className="ti ti-arrow-right ms-1"></i>
        </Button>
      </div>
    </div>
  );

  const renderConsentStep = () => (
    <div>
      <h5 className="fw-bold mb-3">Consimtaminte</h5>
      <p className="text-muted small mb-4">
        Pacientul trebuie sa accepte urmatoarele consimtaminte
      </p>

      <div className="mb-3">
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="gdprConsent"
            checked={consentsAccepted.gdpr}
            onChange={(e) =>
              setConsentsAccepted({ ...consentsAccepted, gdpr: e.target.checked })
            }
          />
          <label className="form-check-label" htmlFor="gdprConsent">
            <strong>Prelucrarea Datelor Personale (GDPR)</strong>
            <p className="text-muted small mb-0">
              Accept ca datele mele personale sa fie prelucrate conform reglementarilor GDPR
            </p>
          </label>
        </div>
      </div>

      <div className="mb-4">
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="treatmentConsent"
            checked={consentsAccepted.treatment}
            onChange={(e) =>
              setConsentsAccepted({ ...consentsAccepted, treatment: e.target.checked })
            }
          />
          <label className="form-check-label" htmlFor="treatmentConsent">
            <strong>Consimtamant Informat pentru Tratament</strong>
            <p className="text-muted small mb-0">
              Am fost informat despre procedura medicala si accept conditiile de tratament
            </p>
          </label>
        </div>
      </div>

      <div className="d-flex justify-content-between">
        <Button variant="outline-secondary" onClick={() => setStep('contacts')}>
          <i className="ti ti-arrow-left me-1"></i>
          Inapoi
        </Button>
        <Button
          variant="success"
          onClick={handleAcceptConsents}
          loading={checkIn.isPending}
          disabled={!consentsAccepted.gdpr || !consentsAccepted.treatment}
        >
          <i className="ti ti-check me-1"></i>
          Confirma Check-in
        </Button>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center py-4">
      <div className="avatar avatar-xl bg-success-transparent rounded-circle mx-auto mb-3">
        <i className="ti ti-check fs-32 text-success"></i>
      </div>
      <h5 className="fw-bold mb-2 text-success">Check-in Realizat cu Succes!</h5>
      <p className="text-muted mb-0">Pacientul a fost adaugat in coada de asteptare</p>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Check-in Pacient"
      icon="ti ti-user-check"
      size="md"
      closeOnOverlay={false}
    >
      {renderStepIndicator()}

      {step === 'search' && renderSearchStep()}
      {step === 'verify' && renderVerifyStep()}
      {step === 'contacts' && renderContactsStep()}
      {step === 'consent' && renderConsentStep()}
      {step === 'complete' && renderCompleteStep()}
    </Modal>
  );
}
