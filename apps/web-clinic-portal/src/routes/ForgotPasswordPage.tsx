/**
 * Forgot Password Page - Preclinic-style
 *
 * Allows users to request a password reset link via email.
 */

import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authClient } from '../api/authClient';
import { Button, Input } from '../components/ui-new';
import dentalClinicImage from '../assets/dental-clinic-future.png';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authClient.forgotPassword({ email });
      setIsSuccess(true);
    } catch {
      setError('Nu am putut trimite link-ul de resetare. Incearca din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  // Success state - email sent
  if (isSuccess) {
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
                      Resetare parola <br /> in siguranta
                    </h1>
                    <p className="text-light opacity-75">
                      Securitatea contului tau este importanta pentru noi.
                      Urmeaza instructiunile din email pentru a-ti reseta parola.
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

            {/* Right Side - Success Message */}
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

                  {/* Success Card */}
                  <div className="card border shadow-sm">
                    <div className="card-body p-4 p-lg-5 text-center">
                      {/* Success Icon */}
                      <div className="mb-4">
                        <div className="avatar avatar-xl bg-success-transparent rounded-circle mx-auto">
                          <i className="ti ti-mail-check fs-32 text-success"></i>
                        </div>
                      </div>

                      <h4 className="fw-bold mb-2">Verifica Email-ul</h4>
                      <p className="text-muted mb-4">
                        Daca exista un cont cu adresa <strong>{email}</strong>,
                        vei primi un email cu instructiuni pentru resetarea parolei.
                      </p>

                      <div className="alert alert-info d-flex align-items-start gap-2 text-start mb-4">
                        <i className="ti ti-info-circle flex-shrink-0 mt-1"></i>
                        <div>
                          <p className="mb-1 fw-medium">Informatii importante:</p>
                          <ul className="mb-0 ps-3 small">
                            <li>Link-ul expira in 1 ora</li>
                            <li>Verifica si folderul Spam</li>
                            <li>Foloseste link-ul o singura data</li>
                          </ul>
                        </div>
                      </div>

                      <Link to="/login" className="btn btn-primary w-100">
                        <i className="ti ti-arrow-left me-2"></i>
                        Inapoi la Autentificare
                      </Link>

                      <div className="mt-4">
                        <p className="text-muted small mb-0">
                          Nu ai primit email-ul?{' '}
                          <button
                            type="button"
                            className="btn btn-link p-0 text-primary"
                            onClick={() => setIsSuccess(false)}
                          >
                            Retrimite
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <p className="text-muted text-center mt-4 mb-0">
                    &copy; {new Date().getFullYear()} DentalOS. Toate drepturile
                    rezervate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default state - form
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
                    Ai uitat parola? <br /> Fara griji!
                  </h1>
                  <p className="text-light opacity-75">
                    Iti vom trimite un link securizat pentru a-ti reseta parola.
                    Procesul dureaza doar cateva minute.
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
                      <h4 className="fw-bold mb-1">Resetare Parola</h4>
                      <p className="text-muted mb-0">
                        Introdu adresa de email asociata contului tau
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate>
                      {/* Email Field */}
                      <div className="mb-4">
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
                        disabled={isLoading || !email}
                      >
                        {isLoading ? 'Se trimite...' : 'Trimite Link de Resetare'}
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
                  &copy; {new Date().getFullYear()} DentalOS. Toate drepturile
                  rezervate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
