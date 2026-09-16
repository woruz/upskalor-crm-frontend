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
const LoginPage = lazy(() =>
  import('@/pages/auth/login/login').then((m) => ({ default: m.LoginPage })),
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
          {/* Redirect root to /leads */}
          <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LEADS} replace />} />

          {/* Leads page – public for demo purposes */}
          <Route path={ROUTES.LEADS} element={<LeadsPage />} />
          <Route path={ROUTES.LEAD_DETAILS} element={<LeadDetailPage />} />

          <Route
            path={ROUTES.LOGIN}
            element={
              <ProtectedRoute requireAuth={false} redirectTo={ROUTES.DASHBOARD}>
                <LoginPage />
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

          <Route path="*" element={<Navigate to={ROUTES.LEADS} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
