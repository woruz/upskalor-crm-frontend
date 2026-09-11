import { Navigate, useLocation } from 'react-router';
import { useAppSelector } from '@/shared/lib/hooks/useRedux';
import { ROUTES } from '@/shared/lib/config/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute = ({
  children,
  requireAuth = true,
  redirectTo,
}: ProtectedRouteProps) => {
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const location = useLocation();

  if (requireAuth && !isLoggedIn) {
    return (
      <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />
    );
  }

  if (!requireAuth && isLoggedIn) {
    return <Navigate to={redirectTo || ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
};
