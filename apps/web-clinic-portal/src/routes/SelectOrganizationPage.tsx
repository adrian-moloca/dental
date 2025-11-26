/**
 * Select Organization Page
 *
 * Shown when user belongs to multiple organizations during login
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import type { OrganizationSummaryDto } from '../types/auth.types';

interface LocationState {
  email: string;
  password: string;
  rememberMe?: boolean;
  organizations: OrganizationSummaryDto[];
}

export default function SelectOrganizationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginSelectOrg, isLoading, error } = useAuthStore();

  const [selectedOrgId, setSelectedOrgId] = useState<string>('');

  // Get state from location (passed from LoginPage)
  const state = location.state as LocationState | null;

  useEffect(() => {
    // Redirect to login if no state present
    if (!state || !state.organizations || state.organizations.length === 0) {
      navigate('/login', { replace: true });
    }
  }, [state, navigate]);

  const handleSubmit = async () => {
    if (!state || !selectedOrgId) return;

    try {
      await loginSelectOrg(state.email, state.password, selectedOrgId, state.rememberMe);
      navigate('/dashboard');
    } catch (err) {
      console.error('Organization selection failed:', err);
    }
  };

  if (!state) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg)] text-[var(--text)]">
      <div className="relative w-full max-w-2xl animate-fade-in">
        <div className="absolute inset-0 blur-3xl bg-gradient-to-br from-brand-400/15 to-accent-400/12 animate-pulse-glow" />
        <Card padding="lg" tone="glass" className="relative">
          <div className="mb-6 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg
                className="w-8 h-8 text-brand-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Dental OS
              </p>
            </div>
            <h1 className="text-3xl font-bold text-[var(--foreground)]">
              Select Organization
            </h1>
            <p className="text-sm text-[var(--muted)]">
              You have access to multiple organizations. Please select one to
              continue.
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {state.organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => setSelectedOrgId(org.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedOrgId === org.id
                    ? 'border-brand-400 bg-brand-400/10'
                    : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  {org.logoUrl ? (
                    <img
                      src={org.logoUrl}
                      alt={org.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {org.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-100">
                      {org.name}
                    </h3>
                    <p className="text-sm text-slate-400">
                      Organization ID: {org.id.substring(0, 8)}...
                    </p>
                  </div>
                  {selectedOrgId === org.id && (
                    <svg
                      className="w-6 h-6 text-brand-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>

          {error && <div className="text-red-400 text-sm mb-4">{error}</div>}

          <div className="flex gap-3">
            <Button
              variant="outline-secondary"
              fullWidth
              onClick={() => navigate('/login')}
              disabled={isLoading}
            >
              Back to Login
            </Button>
            <Button
              fullWidth
              onClick={handleSubmit}
              disabled={!selectedOrgId || isLoading}
              loading={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Continue'}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Signed in as <span className="text-slate-300">{state.email}</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
