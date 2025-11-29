/**
 * Login Page - Preclinic-style Cover Login
 *
 * Split-screen login with branding on the left and form on the right.
 */

import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button, Input, PasswordInput } from '../components/ui-new';
import dentalClinicImage from '../assets/dental-clinic-future.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Get success message from location state
  const successMessage = (location.state as { message?: string })?.message;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const result = await login(email, password, rememberMe);

      // If needs org selection, navigate to selector
      if (result?.needsOrgSelection) {
        navigate('/login/select-org', {
          state: {
            email,
            password,
            rememberMe,
            organizations: result.organizations,
          },
        });
        return;
      }

      // Otherwise, login succeeded
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="row g-0 min-vh-100">
          {/* Left Side - Branding - Hidden on screens < 992px */}
          <div className="col-lg-6 auth-cover-wrapper">
            <div className="auth-cover bg-primary">
              <div className="auth-cover-content">
                <div className="text-center">
                  <h1 className="text-white fw-bold mb-3">
                    Gestionare eficienta <br /> pentru clinica ta dentara
                  </h1>
                  <p className="text-light opacity-75">
                    Experienta moderna de management pentru cabinetele stomatologice.
                    Programari, pacienti, facturare si rapoarte - totul intr-un singur loc.
                  </p>
                </div>
                <div className="auth-cover-illustration mt-5">
                  <img
                    src={dentalClinicImage}
                    alt="Modern Dental Clinic"
                    className="img-fluid rounded-3"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
              </div>
              {/* Decorative elements */}
              <div className="auth-cover-bg"></div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="col-lg-6 col-12">
            <div className="auth-form-wrapper">
              <div className="auth-form-content">
                {/* Logo */}
                <div className="text-center mb-4">
                  <div className="auth-logo mb-3">
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <div className="logo-icon bg-primary rounded-2 p-2">
                        <i className="ti ti-dental fs-28 text-white"></i>
                      </div>
                      <span className="logo-text fw-bold fs-24 text-heading">
                        Dental<span className="text-primary">OS</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Card */}
                <div className="card border shadow-sm">
                  <div className="card-body p-4 p-lg-5">
                    <div className="text-center mb-4">
                      <h4 className="fw-bold mb-1">Autentificare</h4>
                      <p className="text-muted mb-0">
                        Introduceti datele pentru a accesa platforma
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate>
                      {/* Email Field */}
                      <div className="mb-3">
                        <Input
                          type="email"
                          id="email"
                          name="email"
                          label="Adresa de Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="exemplu@clinica.ro"
                          icon="ti ti-mail"
                          autoComplete="email"
                          autoFocus
                        />
                      </div>

                      {/* Password Field */}
                      <div className="mb-3">
                        <PasswordInput
                          id="password"
                          name="password"
                          label="Parola"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="Introduceti parola"
                          autoComplete="current-password"
                        />
                      </div>

                      {/* Remember Me & Forgot Password */}
                      <div className="d-flex align-items-center justify-content-between mb-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                          />
                          <label
                            className="form-check-label text-muted"
                            htmlFor="rememberMe"
                          >
                            Tine-ma minte
                          </label>
                        </div>
                        <Link
                          to="/forgot-password"
                          className="text-primary fw-medium"
                        >
                          Ai uitat parola?
                        </Link>
                      </div>

                      {/* Success Message */}
                      {successMessage && (
                        <div
                          className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3"
                          role="alert"
                        >
                          <i className="ti ti-check-circle"></i>
                          <span>{successMessage}</span>
                        </div>
                      )}

                      {/* Error Message */}
                      {error && (
                        <div
                          className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3"
                          role="alert"
                        >
                          <i className="ti ti-alert-circle"></i>
                          <span>{error}</span>
                        </div>
                      )}

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-100"
                        loading={isLoading}
                        disabled={isLoading || !email || !password}
                      >
                        {isLoading ? 'Se autentifica...' : 'Autentificare'}
                      </Button>
                    </form>

                    {/* Divider */}
                    <div className="auth-divider my-4">
                      <span>SAU</span>
                    </div>

                    {/* Social Login */}
                    <div className="d-flex gap-2 mb-4">
                      <button
                        type="button"
                        className="btn btn-outline-secondary border flex-fill position-relative"
                        disabled
                        title="In curand"
                        style={{
                          opacity: 0.7,
                          cursor: 'not-allowed',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <i className="ti ti-brand-google me-2 text-danger"></i>
                        <span className="text-muted">Google</span>
                        <small className="position-absolute top-0 end-0 badge bg-primary rounded-pill"
                               style={{ fontSize: '0.6rem', transform: 'translate(25%, -25%)' }}>
                          Curand
                        </small>
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary border flex-fill position-relative"
                        disabled
                        title="In curand"
                        style={{
                          opacity: 0.7,
                          cursor: 'not-allowed',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <i className="ti ti-brand-apple me-2 text-dark"></i>
                        <span className="text-muted">Apple</span>
                        <small className="position-absolute top-0 end-0 badge bg-primary rounded-pill"
                               style={{ fontSize: '0.6rem', transform: 'translate(25%, -25%)' }}>
                          Curand
                        </small>
                      </button>
                    </div>

                    {/* Register Link */}
                    <div className="text-center">
                      <p className="text-muted mb-0">
                        Nu ai cont?{' '}
                        <Link to="/register" className="text-primary fw-semibold">
                          Inregistreaza-te
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <p className="text-muted text-center mt-4 mb-0">
                  &copy; {new Date().getFullYear()} DentalOS. Toate drepturile rezervate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
