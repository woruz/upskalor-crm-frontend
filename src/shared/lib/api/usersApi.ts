import { apiClient } from './client';
import type {
  User,
  UsersResponse,
  Role,
  RolesResponse,
  CreateUserPayload,
  UpdateUserPayload,
  CreateRolePayload,
  UpdateRolePayload,
} from '@/shared/lib/types';

// ─── Default Initial Roles ───────────────────────────────────────────────────

export const DEFAULT_INITIAL_ROLES: Role[] = [
  {
    id: 'role-1',
    name: 'super_admin',
    displayName: 'Super Administrator',
    description: 'Full administrative access across all tenant resources, user management, and system settings.',
    isSystem: true,
    userCount: 1,
    permissions: [
      { resource: 'leads', actions: ['create', 'read', 'update', 'delete', 'export'] },
      { resource: 'quotations', actions: ['create', 'read', 'update', 'delete', 'export'] },
      { resource: 'reports', actions: ['create', 'read', 'update', 'delete', 'export'] },
      { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'export'] },
      { resource: 'settings', actions: ['create', 'read', 'update', 'delete', 'export'] },
    ],
    createdAt: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'role-2',
    name: 'admin',
    displayName: 'Administrator',
    description: 'Operational manager with complete access to leads, quotations, and reports.',
    isSystem: true,
    userCount: 2,
    permissions: [
      { resource: 'leads', actions: ['create', 'read', 'update', 'delete', 'export'] },
      { resource: 'quotations', actions: ['create', 'read', 'update', 'delete', 'export'] },
      { resource: 'reports', actions: ['create', 'read', 'update', 'export'] },
      { resource: 'users', actions: ['read'] },
      { resource: 'settings', actions: ['read'] },
    ],
    createdAt: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'role-3',
    name: 'user',
    displayName: 'Sales Representative',
    description: 'Standard CRM user handling customer leads and generating solar quotations.',
    isSystem: true,
    userCount: 5,
    permissions: [
      { resource: 'leads', actions: ['create', 'read', 'update', 'export'] },
      { resource: 'quotations', actions: ['create', 'read', 'update', 'export'] },
      { resource: 'reports', actions: ['read'] },
    ],
    createdAt: new Date('2026-01-01').toISOString(),
  },
];

// ─── User API Calls ─────────────────────────────────────────────────────────

/**
 * Retrieves list of users from the server.
 * GET /users
 */
export async function listUsers(): Promise<UsersResponse> {
  try {
    const response = await apiClient.get<UsersResponse | { data: User[] }>('/users');
    if (response.data) {
      if (Array.isArray(response.data)) {
        return {
          data: response.data,
          pagination: { page: 1, limit: response.data.length, total: response.data.length, totalPages: 1 },
        };
      }
      if ('data' in response.data && Array.isArray(response.data.data)) {
        return {
          data: response.data.data,
          pagination: ('pagination' in response.data && response.data.pagination)
            ? response.data.pagination
            : { page: 1, limit: response.data.data.length, total: response.data.data.length, totalPages: 1 },
        };
      }
    }
  } catch (err: any) {
    // If backend hasn't implemented GET /users yet (404), return fallback initial list
    if (err?.response?.status === 404) {
      return {
        data: [
          {
            id: 'u-1',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@upskalor.com',
            role: 'super_admin',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
          },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
    }
    throw err;
  }

  return {
    data: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  };
}

/**
 * Creates a new user in the system.
 * POST /users
 */
export async function createUser(payload: CreateUserPayload): Promise<{ data: User }> {
  const response = await apiClient.post<{ data: User } | User>('/users', payload);
  if ('data' in response.data && response.data.data) {
    return { data: response.data.data };
  }
  return { data: response.data as User };
}

/**
 * Updates an existing user's profile, role or status.
 * PATCH /users/:id
 */
export async function updateUser(id: string, payload: UpdateUserPayload): Promise<{ data: User }> {
  const response = await apiClient.patch<{ data: User } | User>(`/users/${id}`, payload);
  if ('data' in response.data && response.data.data) {
    return { data: response.data.data };
  }
  return { data: response.data as User };
}

/**
 * Deletes or deactivates a user account.
 * DELETE /users/:id
 */
export async function deleteUser(id: string): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>(`/users/${id}`);
  return response.data;
}

// ─── Role API Calls ─────────────────────────────────────────────────────────

/**
 * Retrieves all defined roles and resource permissions.
 * GET /roles
 */
export async function listRoles(): Promise<RolesResponse> {
  try {
    const response = await apiClient.get<RolesResponse | { data: Role[] } | Role[]>('/roles');
    if (response.data) {
      if (Array.isArray(response.data)) {
        return { data: response.data };
      }
      if ('data' in response.data && Array.isArray(response.data.data)) {
        return { data: response.data.data };
      }
    }
  } catch (err: any) {
    // If backend /roles endpoint is not yet mounted (404), return standard initial roles
    if (err?.response?.status === 404) {
      return { data: DEFAULT_INITIAL_ROLES };
    }
    throw err;
  }

  return { data: DEFAULT_INITIAL_ROLES };
}

/**
 * Creates a new role with assigned resource permissions.
 * POST /roles
 */
export async function createRole(payload: CreateRolePayload): Promise<{ data: Role }> {
  const response = await apiClient.post<{ data: Role } | Role>('/roles', payload);
  if ('data' in response.data && response.data.data) {
    return { data: response.data.data };
  }
  return { data: response.data as Role };
}

/**
 * Updates role permissions or details.
 * PATCH /roles/:id or PUT /roles/:id
 */
export async function updateRole(id: string, payload: UpdateRolePayload): Promise<{ data: Role }> {
  try {
    const response = await apiClient.patch<{ data: Role } | Role>(`/roles/${id}`, payload);
    if ('data' in response.data && response.data.data) {
      return { data: response.data.data };
    }
    return { data: response.data as Role };
  } catch (err: any) {
    if (err?.response?.status === 405) {
      const response = await apiClient.put<{ data: Role } | Role>(`/roles/${id}`, payload);
      if ('data' in response.data && response.data.data) {
        return { data: response.data.data };
      }
      return { data: response.data as Role };
    }
    if (err?.response?.status === 404) {
      return {
        data: {
          id,
          name: payload.name || id,
          displayName: payload.displayName || id,
          description: payload.description,
          permissions: payload.permissions || [],
          updatedAt: new Date().toISOString(),
        },
      };
    }
    throw err;
  }
}

/**
 * Deletes a custom role.
 * DELETE /roles/:id
 */
export async function deleteRole(id: string): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>(`/roles/${id}`);
  return response.data;
}
