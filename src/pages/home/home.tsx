import { Navigate } from 'react-router';
import { ROUTES } from '@/shared/lib/config/routes';

/**
 * Root home route — redirects to Dashboard (protected).
 */
export function HomePage() {
  return <Navigate to={ROUTES.DASHBOARD} replace />;
}
