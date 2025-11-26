/**
 * Reset Password Page - Preclinic-style
 *
 * Allows users to set a new password using the reset token from email.
 */

import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authClient } from '../api/authClient';
import { Button, PasswordInput } from '../components/ui-new';
import dentalClinicImage from '../assets/dental-clinic-future.png';

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    // Validate token format
    if (!token || token.length !== 64 || !/^[a-f0-9]{64}$/.test(token)) {
      setError('Token invalid sau malformat');
    }
  }, [token]);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];

    if (password.length < 12) {
      errors.push('Parola trebuie sa aiba minim 12 caractere');
    }
    if (password.length > 128) {
      errors.push('Parola nu poate depasi 128 de caractere');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Parola trebuie sa contina cel putin o litera mare');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Parola trebuie sa contina cel putin o litera mica');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Parola trebuie sa contina cel putin o cifra');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Parola trebuie sa contina cel putin un caracter special');
    }

    return errors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors([]);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Parolele nu corespund');
      return;
    }

    // Validate password strength
    const errors = validatePassword(newPassword);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (!token) {
      setError('Token de resetare invalid');
      return;
    }

    setIsLoading(true);

    try {
      await authClient.resetPassword({ token, newPassword });
      // Success - redirect to login with success message
      navigate('/login', {
        state: { message: 'Parola a fost resetata cu succes. Te poti autentifica acum.' },
      });
    } catch {
      setError('Resetarea parolei a esuat. Te rugam sa incerci din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show password requirements
  const showRequirements = newPassword.length > 0;
  const requirements = [
    { label: 'Minim 12 caractere', met: newPassword.length >= 12 },
    { label: 'O litera mare', met: /[A-Z]/.test(newPassword) },
    { label: 'O litera mica', met: /[a-z]/.test(newPassword) },
    { label: 'O cifra', met: /[0-9]/.test(newPassword) },
    { label: 'Un caracter special', met: /[^A-Za-z0-9]/.test(newPassword) },
  ];

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="row g-0 min-vh-100">
          {/* Left Side - Branding */}
          <div className="col-lg-6 d-none d-lg-flex">
            <div className="auth-cover bg-primary">
              <div className="auth-cover-content">
                <div className="text-center">
                  <h1 className="text-white fw-bold mb-3">
                    Seteaza parola noua <br /> in siguranta
                  </h1>
                  <p className="text-light opacity-75">
                    Alege o parola puternica pentru a-ti proteja contul.
                    Parola ta trebuie sa respecte cerintele de securitate.
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
              <div className="auth-cover-bg"></div>
            </div>
          </div>

          {/* Right Side - Form */}
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
                      {/* Key Icon */}
                      <div className="mb-3">
                        <div className="avatar avatar-lg bg-primary-transparent rounded-circle mx-auto">
                          <i className="ti ti-key fs-24 text-primary"></i>
                        </div>
                      </div>
                      <h4 className="fw-bold mb-1">Seteaza Parola Noua</h4>
                      <p className="text-muted mb-0">
                        Introdu parola noua mai jos
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate>
                      {/* New Password Field */}
                      <div className="mb-3">
                        <PasswordInput
                          id="newPassword"
                          name="newPassword"
                          label="Parola Noua"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          placeholder="Minim 12 caractere"
                          autoComplete="new-password"
                          autoFocus
                        />
                      </div>

                      {/* Password Requirements */}
                      {showRequirements && (
                        <div className="mb-3 p-3 rounded-2 bg-light border">
                          <p className="text-xs fw-semibold text-muted mb-2">
                            Cerintele parolei:
                          </p>
                          <ul className="list-unstyled mb-0">
                            {requirements.map((req, index) => (
                              <li key={index} className="d-flex align-items-center gap-2 mb-1">
                                {req.met ? (
                                  <i className="ti ti-check text-success fs-16"></i>
                                ) : (
                                  <i className="ti ti-x text-danger fs-16"></i>
                                )}
                                <span
                                  className={`small ${
                                    req.met ? 'text-success' : 'text-muted'
                                  }`}
                                >
                                  {req.label}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Confirm Password Field */}
                      <div className="mb-4">
                        <PasswordInput
                          id="confirmPassword"
                          name="confirmPassword"
                          label="Confirma Parola"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          placeholder="Repeta parola noua"
                          autoComplete="new-password"
                          error={
                            confirmPassword &&
                            newPassword !== confirmPassword
                              ? 'Parolele nu corespund'
                              : undefined
                          }
                        />
                      </div>

                      {/* Validation Errors */}
                      {validationErrors.length > 0 && (
                        <div
                          className="alert alert-danger d-flex align-items-start gap-2 py-2 mb-3"
                          role="alert"
                        >
                          <i className="ti ti-alert-circle flex-shrink-0 mt-1"></i>
                          <div>
                            <p className="mb-1 fw-medium">Cerintele parolei nu sunt indeplinite:</p>
                            <ul className="mb-0 ps-3 small">
                              {validationErrors.map((err, index) => (
                                <li key={index}>{err}</li>
                              ))}
                            </ul>
                          </div>
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
                        disabled={isLoading || !newPassword || !confirmPassword || !token}
                      >
                        {isLoading ? 'Se reseteaza...' : 'Reseteaza Parola'}
                      </Button>
                    </form>

                    {/* Back to Login */}
                    <div className="text-center mt-4">
                      <p className="text-muted mb-0">
                        Ti-ai amintit parola?{' '}
                        <Link to="/login" className="text-primary fw-semibold">
                          Inapoi la Autentificare
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
