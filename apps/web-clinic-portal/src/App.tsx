/**
 * Main App Component
 *
 * Sets up routing, React Query, and authentication context
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './config/queryClient';
import { useAuthStore } from './store/authStore';
import { useTokenRefresh } from './hooks/useTokenRefresh';
import { ThemeProvider } from './contexts/ThemeContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './routes/LoginPage';
import RegisterPage from './routes/RegisterPage';
import ForgotPasswordPage from './routes/ForgotPasswordPage';
import ResetPasswordPage from './routes/ResetPasswordPage';
import SelectOrganizationPage from './routes/SelectOrganizationPage';
import PatientsListPage from './routes/PatientsListPage';
import PatientDetailsPage from './routes/PatientDetailsPage';
import CreatePatientPage from './routes/CreatePatientPage';
import CreateAppointmentPage from './routes/CreateAppointmentPage';
import AppointmentsListPage from './routes/AppointmentsListPage';
import ReceptionQueuePage from './routes/ReceptionQueuePage';
import { DashboardPage } from './routes/DashboardPage';
import { BillingPage } from './routes/BillingPage';
import { CreateInvoicePage } from './routes/CreateInvoicePage';
import { InvoiceDetailsPage } from './routes/InvoiceDetailsPage';
import { ClinicalPage } from './routes/ClinicalPage';
import { InventoryPage } from './routes/InventoryPage';
import { ImagingPage } from './routes/ImagingPage';
import SettingsSessionsPage from './routes/SettingsSessionsPage';
import SettingsSecurityPage from './routes/SettingsSecurityPage';
import SettingsProfilePage from './routes/SettingsProfilePage';
import SettingsClinicPage from './routes/SettingsClinicPage';
import SettingsPage from './routes/SettingsPage';
import { ReportsPage } from './routes/ReportsPage';
import ProviderSchedulePage from './routes/ProviderSchedulePage';
import TreatmentPlanCreatePage from './routes/TreatmentPlanCreatePage';
import { InterventionsPage } from './routes/InterventionsPage';
import { ModulesPage } from './routes/ModulesPage';
import SupportPage from './routes/SupportPage';
import { StaffPage } from './routes/StaffPage';
import { ClinicalOverviewPage } from './routes/ClinicalOverviewPage';
import { DevTools } from './components/DevTools';

function AppContent() {
  const loadUserFromStorage = useAuthStore((state) => state.loadUserFromStorage);

  // Initialize token refresh scheduling
  useTokenRefresh();

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  return (
    <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--surface)',
                  color: 'var(--foreground)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                },
                success: {
                  iconTheme: {
                    primary: 'var(--brand)',
                    secondary: 'white',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: 'white',
                  },
                },
              }}
            />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/login/select-org" element={<SelectOrganizationPage />} />

              {/* Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Patients */}
              <Route
                path="/patients"
                element={
                  <ProtectedRoute>
                    <PatientsListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patients/create"
                element={
                  <ProtectedRoute>
                    <CreatePatientPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patients/new"
                element={
                  <ProtectedRoute>
                    <CreatePatientPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patients/:id"
                element={
                  <ProtectedRoute>
                    <PatientDetailsPage />
                  </ProtectedRoute>
                }
              />

              {/* Appointments */}
              <Route
                path="/appointments"
                element={
                  <ProtectedRoute>
                    <AppointmentsListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments/create"
                element={
                  <ProtectedRoute>
                    <CreateAppointmentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reception"
                element={
                  <ProtectedRoute>
                    <ReceptionQueuePage />
                  </ProtectedRoute>
                }
              />

              {/* Billing */}
              <Route
                path="/billing"
                element={
                  <ProtectedRoute>
                    <BillingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/billing/invoices/create"
                element={
                  <ProtectedRoute>
                    <CreateInvoicePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/billing/invoices/new"
                element={
                  <ProtectedRoute>
                    <CreateInvoicePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/billing/invoices/:id"
                element={
                  <ProtectedRoute>
                    <InvoiceDetailsPage />
                  </ProtectedRoute>
                }
              />

              {/* Clinical */}
              <Route
                path="/clinical"
                element={
                  <ProtectedRoute>
                    <ClinicalOverviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clinical/:patientId"
                element={
                  <ProtectedRoute>
                    <ClinicalPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clinical/treatment-plans/create"
                element={
                  <ProtectedRoute>
                    <TreatmentPlanCreatePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clinical/interventions"
                element={
                  <ProtectedRoute>
                    <InterventionsPage />
                  </ProtectedRoute>
                }
              />

              {/* Inventory */}
              <Route
                path="/inventory"
                element={
                  <ProtectedRoute>
                    <InventoryPage />
                  </ProtectedRoute>
                }
              />

              {/* Imaging */}
              <Route
                path="/imaging"
                element={
                  <ProtectedRoute>
                    <ImagingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/imaging/:patientId"
                element={
                  <ProtectedRoute>
                    <ImagingPage />
                  </ProtectedRoute>
                }
              />

              {/* Reports */}
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />

              {/* Staff / Echipa */}
              <Route
                path="/staff"
                element={
                  <ProtectedRoute>
                    <StaffPage />
                  </ProtectedRoute>
                }
              />

              {/* Providers / Schedule */}
              <Route
                path="/providers/schedule"
                element={
                  <ProtectedRoute>
                    <ProviderSchedulePage />
                  </ProtectedRoute>
                }
              />

              {/* Settings */}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/profile"
                element={
                  <ProtectedRoute>
                    <SettingsProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/security"
                element={
                  <ProtectedRoute>
                    <SettingsSecurityPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/clinic"
                element={
                  <ProtectedRoute>
                    <SettingsClinicPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/sessions"
                element={
                  <ProtectedRoute>
                    <SettingsSessionsPage />
                  </ProtectedRoute>
                }
              />

              {/* Modules & Subscriptions */}
              <Route
                path="/modules"
                element={
                  <ProtectedRoute>
                    <ModulesPage />
                  </ProtectedRoute>
                }
              />

              {/* Support */}
              <Route
                path="/support"
                element={
                  <ProtectedRoute>
                    <SupportPage />
                  </ProtectedRoute>
                }
              />

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            <DevTools />
    </BrowserRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SidebarProvider>
          <AppContent />
        </SidebarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
