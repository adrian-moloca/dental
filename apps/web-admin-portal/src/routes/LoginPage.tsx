import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Alert, Card } from 'react-bootstrap';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      const response = await login(email, password, rememberMe);

      if (response.needsOrgSelection && response.organizations) {
        sessionStorage.setItem('login_orgs', JSON.stringify(response.organizations));
        sessionStorage.setItem('login_email', email);
        sessionStorage.setItem('login_password', password);
        navigate('/login/select-org');
      } else {
        navigate('/dashboard');
      }
    } catch {
      // Error is handled by the store
    }
  };

  return (
    <div className="login-page vh-100">
      <Container fluid className="h-100">
        <Row className="h-100 g-0">
          {/* Left Panel - Branding */}
          <Col lg={6} className="d-none d-lg-flex login-left-panel">
            <div className="position-relative w-100 h-100 d-flex align-items-center">
              {/* Decorative background */}
              <div className="login-bg-decoration"></div>

              <div className="position-relative z-1 px-5">
                <div className="d-flex align-items-center gap-3 mb-5">
                  <div className="logo-icon logo-icon-lg">
                    <i className="ti ti-tooth text-white fs-2" />
                  </div>
                  <div>
                    <small className="d-block text-uppercase letter-spacing-2 text-primary-light">DentalOS</small>
                    <span className="h4 text-white mb-0 fw-bold">Admin Portal</span>
                  </div>
                </div>

                <h1 className="display-5 text-white fw-bold mb-3">
                  Platform Management
                </h1>
                <p className="fs-5 text-white-50 mb-5" style={{ maxWidth: '450px' }}>
                  Manage organizations, subscriptions, and modules for the DentalOS platform.
                </p>

                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="feature-icon">
                      <i className="ti ti-building" />
                    </div>
                    <span className="text-white-50">Multi-organization management</span>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <div className="feature-icon">
                      <i className="ti ti-credit-card" />
                    </div>
                    <span className="text-white-50">Subscription & billing control</span>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <div className="feature-icon">
                      <i className="ti ti-puzzle" />
                    </div>
                    <span className="text-white-50">Module & feature configuration</span>
                  </div>
                </div>
              </div>
            </div>
          </Col>

          {/* Right Panel - Login Form */}
          <Col lg={6} className="d-flex align-items-center justify-content-center bg-light">
            <div className="w-100 px-4" style={{ maxWidth: '420px' }}>
              {/* Mobile Logo */}
              <div className="d-lg-none text-center mb-5">
                <div className="d-inline-flex align-items-center gap-3">
                  <div className="logo-icon">
                    <i className="ti ti-tooth text-white" />
                  </div>
                  <div className="text-start">
                    <small className="d-block text-uppercase text-muted letter-spacing-1">DentalOS</small>
                    <span className="fw-bold text-primary">Admin Portal</span>
                  </div>
                </div>
              </div>

              <div className="text-center mb-4">
                <h2 className="fw-bold">Welcome Back</h2>
                <p className="text-muted">Sign in to access the admin dashboard</p>
              </div>

              {error && (
                <Alert variant="danger" className="d-flex align-items-center gap-2">
                  <i className="ti ti-alert-circle" />
                  {error}
                </Alert>
              )}

              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <i className="ti ti-mail text-muted" />
                        </span>
                        <Form.Control
                          type="email"
                          placeholder="admin@dentalos.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <i className="ti ti-lock text-muted" />
                        </span>
                        <Form.Control
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Check
                        type="checkbox"
                        id="remember-me"
                        label="Remember me"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                    </Form.Group>

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-100"
                      size="lg"
                      isLoading={isLoading}
                    >
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>

              <p className="text-center text-muted mt-4 small">
                Admin access only. Need help?{' '}
                <a href="mailto:support@dentalos.ro" className="text-primary">
                  Contact Support
                </a>
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
