/**
 * Register Page - Preclinic-style
 *
 * Registration form for new clinic staff accounts.
 * Note: This is for clinic staff registration, not patient self-registration.
 */

import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, PasswordInput } from '../components/ui-new';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return 'Prenumele este obligatoriu';
    if (!formData.lastName.trim()) return 'Numele de familie este obligatoriu';
    if (!formData.email.trim()) return 'Email-ul este obligatoriu';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Adresa de email nu este valida';
    }
    if (!formData.password) return 'Parola este obligatorie';
    if (formData.password.length < 8) {
      return 'Parola trebuie sa aiba minim 8 caractere';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Parolele nu corespund';
    }
    if (!formData.acceptTerms) {
      return 'Trebuie sa accepti termenii si conditiile';
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implement registration API call
      // await authClient.register(formData);
      console.log('Registration data:', formData);

      // For now, just redirect to login
      navigate('/login', {
        state: { message: 'Cont creat cu succes! Te poti autentifica acum.' },
      });
    } catch {
      setError('Inregistrarea a esuat. Te rugam sa incerci din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ['Foarte slaba', 'Slaba', 'Medie', 'Buna', 'Puternica'];
  const strengthColors = ['danger', 'danger', 'warning', 'info', 'success'];

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
                    Bine ai venit la <br /> DentalOS
                  </h1>
                  <p className="text-light opacity-75">
                    Platforma moderna de management pentru clinici dentare.
                    Creeaza-ti un cont si incepe sa gestionezi clinica mai eficient.
                  </p>
                </div>

                {/* Features List */}
                <div className="mt-5">
                  <div className="d-flex align-items-center gap-3 text-white mb-3">
                    <div className="avatar avatar-sm bg-white bg-opacity-10 rounded-circle">
                      <i className="ti ti-check text-white"></i>
                    </div>
                    <span>Programari si calendar inteligent</span>
                  </div>
                  <div className="d-flex align-items-center gap-3 text-white mb-3">
                    <div className="avatar avatar-sm bg-white bg-opacity-10 rounded-circle">
                      <i className="ti ti-check text-white"></i>
                    </div>
                    <span>Fise pacienti complete</span>
                  </div>
                  <div className="d-flex align-items-center gap-3 text-white mb-3">
                    <div className="avatar avatar-sm bg-white bg-opacity-10 rounded-circle">
                      <i className="ti ti-check text-white"></i>
                    </div>
                    <span>Facturare si rapoarte financiare</span>
                  </div>
                  <div className="d-flex align-items-center gap-3 text-white">
                    <div className="avatar avatar-sm bg-white bg-opacity-10 rounded-circle">
                      <i className="ti ti-check text-white"></i>
                    </div>
                    <span>Stoc si aprovizionare</span>
                  </div>
                </div>
              </div>
              <div className="auth-cover-bg"></div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
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
                      <h4 className="fw-bold mb-1">Creeaza Cont</h4>
                      <p className="text-muted mb-0">
                        Completeaza formularul pentru a-ti crea un cont
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate>
                      {/* Name Row */}
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <Input
                            type="text"
                            id="firstName"
                            name="firstName"
                            label="Prenume"
                            value={formData.firstName}
                            onChange={(e) => updateField('firstName', e.target.value)}
                            required
                            placeholder="Ion"
                            icon="ti ti-user"
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <Input
                            type="text"
                            id="lastName"
                            name="lastName"
                            label="Nume"
                            value={formData.lastName}
                            onChange={(e) => updateField('lastName', e.target.value)}
                            required
                            placeholder="Popescu"
                          />
                        </div>
                      </div>

                      {/* Email Field */}
                      <div className="mb-3">
                        <Input
                          type="email"
                          id="email"
                          name="email"
                          label="Adresa de Email"
                          value={formData.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          required
                          placeholder="exemplu@clinica.ro"
                          icon="ti ti-mail"
                          autoComplete="email"
                        />
                      </div>

                      {/* Phone Field */}
                      <div className="mb-3">
                        <Input
                          type="tel"
                          id="phone"
                          name="phone"
                          label="Telefon (optional)"
                          value={formData.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          placeholder="0722 123 456"
                          icon="ti ti-phone"
                        />
                      </div>

                      {/* Password Field */}
                      <div className="mb-3">
                        <PasswordInput
                          id="password"
                          name="password"
                          label="Parola"
                          value={formData.password}
                          onChange={(e) => updateField('password', e.target.value)}
                          required
                          placeholder="Minim 8 caractere"
                          autoComplete="new-password"
                        />
                        {formData.password && (
                          <div className="password-strength mt-2">
                            <div className="strength-bars">
                              {[0, 1, 2, 3, 4].map((i) => (
                                <div
                                  key={i}
                                  className={`bar ${
                                    i < passwordStrength
                                      ? `active ${strengthColors[passwordStrength - 1]}`
                                      : ''
                                  }`}
                                />
                              ))}
                            </div>
                            <small
                              className={`strength-text text-${
                                strengthColors[passwordStrength - 1] || 'muted'
                              }`}
                            >
                              Parola: {strengthLabels[passwordStrength - 1] || 'Prea scurta'}
                            </small>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password Field */}
                      <div className="mb-3">
                        <PasswordInput
                          id="confirmPassword"
                          name="confirmPassword"
                          label="Confirma Parola"
                          value={formData.confirmPassword}
                          onChange={(e) => updateField('confirmPassword', e.target.value)}
                          required
                          placeholder="Repeta parola"
                          autoComplete="new-password"
                          error={
                            formData.confirmPassword &&
                            formData.password !== formData.confirmPassword
                              ? 'Parolele nu corespund'
                              : undefined
                          }
                        />
                      </div>

                      {/* Terms Checkbox */}
                      <div className="mb-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="acceptTerms"
                            checked={formData.acceptTerms}
                            onChange={(e) => updateField('acceptTerms', e.target.checked)}
                          />
                          <label className="form-check-label text-muted" htmlFor="acceptTerms">
                            Accept{' '}
                            <Link to="/terms" className="text-primary">
                              Termenii si Conditiile
                            </Link>{' '}
                            si{' '}
                            <Link to="/privacy" className="text-primary">
                              Politica de Confidentialitate
                            </Link>
                          </label>
                        </div>
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
                        disabled={isLoading}
                      >
                        {isLoading ? 'Se creeaza contul...' : 'Creeaza Cont'}
                      </Button>
                    </form>

                    {/* Login Link */}
                    <div className="text-center mt-4">
                      <p className="text-muted mb-0">
                        Ai deja un cont?{' '}
                        <Link to="/login" className="text-primary fw-semibold">
                          Autentifica-te
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
