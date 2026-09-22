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
}: ProtectedRouteProps) => {
  // Dev mode bypass: Render children directly without backend authentication requirement
  return <>{children}</>;
};

