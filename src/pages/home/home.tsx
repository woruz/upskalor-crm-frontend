import { Navigate } from 'react-router';
import { ROUTES } from '@/shared/lib/config/routes';

/**
 * Root home route — redirects immediately to the Leads page.
 * All lead-management content lives in /leads (LeadsPage).
 */
export function HomePage() {
  return <Navigate to={ROUTES.LEADS} replace />;
}
