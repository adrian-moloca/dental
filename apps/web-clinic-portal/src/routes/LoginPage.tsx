/**
 * Login Page
 */

import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const result = await login(email, password);

      // If needs org selection, navigate to selector
      if (result?.needsOrgSelection) {
        navigate('/login/select-org', {
          state: {
            email,
            password,
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Dental OS</p>
            </div>
            <h1 className="text-3xl font-bold text-[var(--foreground)]">Clinic Portal</h1>
            <p className="text-sm text-[var(--muted)]">Modern practice management at your fingertips</p>
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
            <Input
              type="password"
              id="password"
              name="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              fullWidth
              autoComplete="current-password"
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
            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-brand-400 hover:text-brand-300 transition-colors focus:outline-none focus:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              disabled={isLoading || !email || !password}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-brand-400 hover:text-brand-300 font-semibold transition-colors focus:outline-none focus:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
