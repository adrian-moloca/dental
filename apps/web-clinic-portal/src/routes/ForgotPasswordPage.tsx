/**
 * Forgot Password Page
 *
 * Allows users to request a password reset link via email.
 */

import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authClient } from '../api/authClient';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

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
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to send reset link. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg)] text-[var(--text)]">
        <div className="relative w-full max-w-lg animate-fade-in">
          <div className="absolute inset-0 blur-3xl bg-gradient-to-br from-brand-400/15 to-accent-400/12 animate-pulse-glow" aria-hidden={true} />
          <Card padding="lg" tone="glass" className="relative">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden={true}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">Check Your Email</h1>
              <p className="text-[var(--muted)]">
                If an account with that email exists, a password reset link has been sent.
              </p>
              <p className="text-sm text-[var(--muted)]">
                Please check your email and follow the instructions to reset your password.
                The link will expire in 1 hour.
              </p>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="text-brand-400 hover:text-brand-300 font-semibold transition-colors focus:outline-none focus:underline"
                >
                  Back to login
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg)] text-[var(--text)]">
      <div className="relative w-full max-w-lg animate-fade-in">
        <div className="absolute inset-0 blur-3xl bg-gradient-to-br from-brand-400/15 to-accent-400/12 animate-pulse-glow" aria-hidden={true} />
        <Card padding="lg" tone="glass" className="relative">
          <div className="mb-6 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg
                className="w-8 h-8 text-brand-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden={true}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Dental OS</p>
            </div>
            <h1 className="text-3xl font-bold text-[var(--foreground)]">Reset Password</h1>
            <p className="text-sm text-[var(--muted)]">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              type="email"
              id="email"
              name="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@clinic.com"
              fullWidth
              autoComplete="email"
              autoFocus
            />
            {error && (
              <div
                className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                role="alert"
              >
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden={true}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                {error}
              </div>
            )}
            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              disabled={isLoading || !email}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Remember your password?{' '}
              <Link
                to="/login"
                className="text-brand-400 hover:text-brand-300 font-semibold transition-colors focus:outline-none focus:underline"
              >
                Back to login
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
