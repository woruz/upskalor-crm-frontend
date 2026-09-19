import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { listRoles } from '@/shared/lib/api/usersApi';
import type { Role, PermissionAction } from '@/shared/lib/types';

const ROLES_CACHE_KEY = 'crm_roles_cache';

export function usePermissions() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>(() => {
    try {
      const raw = localStorage.getItem(ROLES_CACHE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  // Fetch updated roles definition from server whenever user is logged in
  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    listRoles()
      .then((res) => {
        if (isMounted && res.data && res.data.length > 0) {
          setRoles(res.data);
          try {
            localStorage.setItem(ROLES_CACHE_KEY, JSON.stringify(res.data));
          } catch {}
        }
      })
      .catch(() => {
        // Fall back gracefully to cache
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Current user's role definition
  const userRoleDefinition = useMemo(() => {
    if (!user?.role) return null;
    return roles.find((r) => r.name === user.role) || null;
  }, [user?.role, roles]);

  /**
   * Check if current user has a specific action on a resource.
   * Super administrators automatically bypass all checks.
   */
  const hasPermission = useCallback(
    (resource: string, action: PermissionAction = 'read'): boolean => {
      if (!user?.role) return false;
      if (user.role === 'super_admin') return true;

      // If user has permissions directly attached
      if (user.permissions && Array.isArray(user.permissions)) {
        const found = user.permissions.find(
          (p) => p.resource.toLowerCase() === resource.toLowerCase()
        );
        if (found) {
          return found.actions.map((a) => a.toLowerCase()).includes(action.toLowerCase());
        }
      }

      // Check against current role permissions
      if (!userRoleDefinition) {
        return false;
      }

      const perm = userRoleDefinition.permissions.find(
        (p) => p.resource.toLowerCase() === resource.toLowerCase()
      );

      if (!perm) return false;
      return perm.actions.map((a) => a.toLowerCase()).includes(action.toLowerCase());
    },
    [user, userRoleDefinition]
  );

  return {
    hasPermission,
    userRoleDefinition,
    roles,
  };
}
