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
import SelectOrganizationPage from './routes/SelectOrganizationPage';
import PatientsListPage from './routes/PatientsListPage';
import PatientDetailsPage from './routes/PatientDetailsPage';
import CreatePatientPage from './routes/CreatePatientPage';
import CreateAppointmentPage from './routes/CreateAppointmentPage';
import AppointmentsListPage from './routes/AppointmentsListPage';
import { DashboardPage } from './routes/DashboardPage';
import { BillingPage } from './routes/BillingPage';
import { InvoiceDetailsPage } from './routes/InvoiceDetailsPage';
import { ClinicalPage } from './routes/ClinicalPage';
import { InventoryPage } from './routes/InventoryPage';
import { ImagingPage } from './routes/ImagingPage';
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
                path="/billing/invoices/:id"
                element={
                  <ProtectedRoute>
                    <InvoiceDetailsPage />
                  </ProtectedRoute>
                }
              />

              {/* Clinical */}
              <Route
                path="/clinical/:patientId"
                element={
                  <ProtectedRoute>
                    <ClinicalPage />
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
