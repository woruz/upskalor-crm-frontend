import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ROUTES } from '@/shared/lib/config/routes';
import { ProtectedRoute } from '@/shared/components/providers/ProtectedRoute';
import { PageLoader } from '@/shared/components/ui/pageLoader/pageLoader';

// Route-level code splitting: each page ships as its own lazily-loaded chunk.
const LeadsPage = lazy(() =>
  import('@/pages/leads/leads').then((m) => ({ default: m.LeadsPage })),
);
const LeadDetailPage = lazy(() =>
  import('@/pages/leads/leadDetail').then((m) => ({ default: m.LeadDetailPage })),
);
const QuotationsPage = lazy(() =>
  import('@/pages/quotations/quotations').then((m) => ({ default: m.QuotationsPage })),
);
const CreateQuotationPage = lazy(() =>
  import('@/pages/quotations/createQuotation').then((m) => ({
    default: m.CreateQuotationPage,
  })),
);
const QuotationDetailPage = lazy(() =>
  import('@/pages/quotations/quotationDetail').then((m) => ({
    default: m.QuotationDetailPage,
  })),
);
const UserManagementPage = lazy(() =>
  import('@/pages/users/userManagement').then((m) => ({
    default: m.UserManagementPage,
  })),
);
const LoginPage = lazy(() =>
  import('@/pages/auth/login/login').then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import('@/pages/auth/register/register').then((m) => ({
    default: m.RegisterPage,
  })),
);
const DashboardPage = lazy(() =>
  import('@/pages/dashboard/dashboard').then((m) => ({
    default: m.DashboardPage,
  })),
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Root route: redirects to /dashboard if logged in, or /login if not */}
          <Route
            path={ROUTES.HOME}
            element={
              <ProtectedRoute>
                <Navigate to={ROUTES.DASHBOARD} replace />
              </ProtectedRoute>
            }
          />

          {/* Protected CRM routes – require authentication */}
          <Route
            path={ROUTES.LEADS}
            element={
              <ProtectedRoute>
                <LeadsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.LEAD_DETAILS}
            element={
              <ProtectedRoute>
                <LeadDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.QUOTATIONS}
            element={
              <ProtectedRoute resource="quotations">
                <QuotationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.CREATE_QUOTATION}
            element={
              <ProtectedRoute resource="quotations">
                <CreateQuotationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.QUOTATION_DETAILS}
            element={
              <ProtectedRoute resource="quotations">
                <QuotationDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.USERS}
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.LOGIN}
            element={
              <ProtectedRoute requireAuth={false} redirectTo={ROUTES.DASHBOARD}>
                <LoginPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.REGISTER}
            element={
              <ProtectedRoute requireAuth={false} redirectTo={ROUTES.DASHBOARD}>
                <RegisterPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.DASHBOARD}
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Unimplemented placeholder routes – redirect directly to Dashboard */}
          <Route
            path="/kanban"
            element={
              <ProtectedRoute>
                <Navigate to={ROUTES.DASHBOARD} replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kanban/*"
            element={
              <ProtectedRoute>
                <Navigate to={ROUTES.DASHBOARD} replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Navigate to={ROUTES.DASHBOARD} replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/*"
            element={
              <ProtectedRoute>
                <Navigate to={ROUTES.DASHBOARD} replace />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.SETTINGS}
            element={
              <ProtectedRoute>
                <Navigate to={ROUTES.DASHBOARD} replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/*"
            element={
              <ProtectedRoute>
                <Navigate to={ROUTES.DASHBOARD} replace />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PROFILE}
            element={
              <ProtectedRoute>
                <Navigate to={ROUTES.DASHBOARD} replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/*"
            element={
              <ProtectedRoute>
                <Navigate to={ROUTES.DASHBOARD} replace />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
