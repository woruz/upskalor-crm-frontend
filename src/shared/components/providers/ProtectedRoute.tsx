import { Navigate, useLocation } from 'react-router';
import { useAppSelector } from '@/shared/lib/hooks/useRedux';
import { usePermissions } from '@/shared/lib/hooks/usePermissions';
import { ROUTES } from '@/shared/lib/config/routes';
import type { PermissionAction } from '@/shared/lib/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  allowedRoles?: string[];
  resource?: string;
  action?: PermissionAction;
}

export const ProtectedRoute = ({
  children,
  requireAuth = true,
  redirectTo,
  allowedRoles,
  resource,
  action = 'read',
}: ProtectedRouteProps) => {
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const user = useAppSelector((state) => state.user.user);
  const { hasPermission } = usePermissions();
  const location = useLocation();

  if (requireAuth && !isLoggedIn) {
    return (
      <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />
    );
  }

  if (!requireAuth && isLoggedIn) {
    return <Navigate to={redirectTo || ROUTES.DASHBOARD} replace />;
  }

  // Role gate (e.g. super_admin for /users)
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user?.role || !allowedRoles.includes(user.role)) {
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    }
  }

  // Dynamic resource permission gate (e.g. 'quotations')
  if (resource) {
    if (!hasPermission(resource, action)) {
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    }
  }

  return <>{children}</>;
};
