import { useState, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Container, Card, Alert } from 'react-bootstrap';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui';
import type { OrganizationOption } from '../types/auth.types';

function getStoredOrganizations(): OrganizationOption[] | null {
  const orgsJson = sessionStorage.getItem('login_orgs');
  if (!orgsJson) return null;
  try {
    return JSON.parse(orgsJson);
  } catch {
    return null;
  }
}

export default function SelectOrganizationPage() {
  const navigate = useNavigate();
  const { loginSelectOrg, isLoading, error, clearError } = useAuthStore();

  const organizations = useMemo(() => getStoredOrganizations(), []);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);

  if (!organizations) {
    return <Navigate to="/login" replace />;
  }

  const handleSelect = async () => {
    if (!selectedOrg) return;

    const email = sessionStorage.getItem('login_email');
    const password = sessionStorage.getItem('login_password');

    if (!email || !password) {
      navigate('/login');
      return;
    }

    clearError();

    try {
      await loginSelectOrg(email, password, selectedOrg, true);
      sessionStorage.removeItem('login_orgs');
      sessionStorage.removeItem('login_email');
      sessionStorage.removeItem('login_password');
      navigate('/dashboard');
    } catch {
      // Error handled by store
    }
  };

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center bg-light p-4">
      <Container style={{ maxWidth: '480px' }}>
        <div className="text-center mb-4">
          <div className="logo-icon logo-icon-lg mx-auto mb-3">
            <i className="ti ti-building text-white fs-3" />
          </div>
          <h2 className="fw-bold">Select Organization</h2>
          <p className="text-muted">Choose an organization to manage</p>
        </div>

        {error && (
          <Alert variant="danger" className="d-flex align-items-center gap-2">
            <i className="ti ti-alert-circle" />
            {error}
          </Alert>
        )}

        <div className="d-flex flex-column gap-3 mb-4">
          {organizations.map((org) => (
            <Card
              key={org.id}
              className={`cursor-pointer border ${
                selectedOrg === org.id
                  ? 'border-primary shadow'
                  : 'border-light shadow-sm'
              }`}
              onClick={() => setSelectedOrg(org.id)}
              style={{ transition: 'all 0.2s ease' }}
            >
              <Card.Body className="p-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div className="stats-icon primary">
                      <i className="ti ti-building" />
                    </div>
                    <div>
                      <h6 className="mb-0 fw-semibold">{org.name}</h6>
                      <small className="text-muted">
                        {org.clinicCount} clinic{org.clinicCount !== 1 ? 's' : ''}
                      </small>
                    </div>
                  </div>
                  <div
                    className={`d-flex align-items-center justify-content-center rounded-circle border ${
                      selectedOrg === org.id
                        ? 'bg-primary border-primary'
                        : 'border-secondary'
                    }`}
                    style={{ width: 20, height: 20 }}
                  >
                    {selectedOrg === org.id && (
                      <i className="ti ti-check text-white" style={{ fontSize: '0.75rem' }} />
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>

        <div className="d-flex gap-3">
          <Button
            variant="outline-secondary"
            onClick={() => navigate('/login')}
            className="flex-fill"
          >
            Back
          </Button>
          <Button
            variant="primary"
            onClick={handleSelect}
            disabled={!selectedOrg}
            isLoading={isLoading}
            className="flex-fill"
          >
            Continue
          </Button>
        </div>
      </Container>
    </div>
  );
}
