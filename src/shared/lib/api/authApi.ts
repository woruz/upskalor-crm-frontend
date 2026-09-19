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
  email: string;
  password: string;
  companySlug?: string;
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
      response?: {
        data?: {
          error?: {
            message?: string;
            details?: string | string[];
            code?: string;
          } | string;
          message?: string;
        };
        status?: number;
      };
    };

    const errObj = axiosError.response?.data?.error;
    if (typeof errObj === 'string') return errObj;

    if (errObj && typeof errObj === 'object') {
      if (typeof errObj.details === 'string' && errObj.details.trim()) {
        return errObj.details;
      }
      if (Array.isArray(errObj.details) && errObj.details.length > 0) {
        return errObj.details.join(', ');
      }
      if (typeof errObj.message === 'string' && errObj.message.trim()) {
        return errObj.message;
      }
    }

    const topMessage = axiosError.response?.data?.message;
    if (typeof topMessage === 'string' && topMessage.trim()) {
      return topMessage;
    }

    // Fallback based on status code
    const status = axiosError.response?.status;
    if (status === 400) return 'Invalid request data. Please check your inputs.';
    if (status === 409) return 'Resource or email is already taken';
    if (status === 401) return 'Invalid credentials or session expired';
    if (status === 403) return 'You do not have permission to perform this action';
    if (status === 404) return 'Requested resource not found';
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
