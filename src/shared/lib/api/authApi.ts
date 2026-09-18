import { apiClient } from './client';
import type { AuthResponse, RegisterResponse } from '@/shared/lib/types';

export interface RegisterPayload {
  companyName: string;
  companySlug: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  companySlug: string;
  email: string;
  password: string;
}

/**
 * Register a new company and its owner (super_admin).
 * POST /auth/register
 */
export async function registerCompany(
  data: RegisterPayload,
): Promise<RegisterResponse> {
  const response = await apiClient.post<RegisterResponse>(
    '/auth/register',
    data,
  );
  return response.data;
}

/**
 * Authenticate a user for a specific tenant company.
 * POST /auth/login
 */
export async function loginUser(data: LoginPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  return response.data;
}

/**
 * Exchange a refresh token for a new access + refresh token pair.
 * POST /auth/refresh
 */
export async function refreshSession(
  refreshToken: string,
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/refresh', {
    refreshToken,
  });
  return response.data;
}

/**
 * Revoke the refresh token (server-side invalidation).
 * POST /auth/logout
 */
export async function logoutUser(
  refreshToken: string,
): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>('/auth/logout', {
    refreshToken,
  });
  return response.data;
}

/**
 * Validate access token and get current user details.
 * GET /admin/users
 */
export async function getCurrentUser(token: string) {
  const response = await apiClient.get('/admin/users', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

/**
 * Extract a user-friendly error message from an API error response.
 * The backend returns errors as: { error: { code, message, requestId } }
 */
export function extractApiError(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: { data?: { error?: { message?: string } }; status?: number };
    };
    const serverMessage = axiosError.response?.data?.error?.message;
    if (serverMessage) return serverMessage;

    // Fallback based on status code
    const status = axiosError.response?.status;
    if (status === 409) return 'Company slug or email is already taken';
    if (status === 401) return 'Invalid credentials';
    if (status === 413) return 'Request payload is too large';
  }
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Extract the error code from an API error response.
 */
export function extractApiErrorCode(error: unknown): string | null {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: { data?: { error?: { code?: string } } };
    };
    return axiosError.response?.data?.error?.code ?? null;
  }
  return null;
}
