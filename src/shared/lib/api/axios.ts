import axios from 'axios';
import { store } from '@/shared/lib/store/store';
import { setToken, clearAuth } from '@/shared/lib/store/slices/authSlice';
import { setUser, setCompany, clearUser } from '@/shared/lib/store/slices/userSlice';
import { ROUTES } from '@/shared/lib/config/routes';

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Decode JWT payload without external dependencies.
 */
function parseJwt(token: string): { exp?: number; [key: string]: any } | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Check if an API error indicates an expired or invalid JWT.
 * Handles standard HTTP 401 as well as backend 500 responses containing "jwt expired".
 */
function isTokenExpiredError(error: any): boolean {
  if (!error || !error.response) return false;

  const status = error.response.status;
  const data = error.response.data;
  const errObj = data?.error || data;

  if (status === 401) return true;

  const code = String(errObj?.code || '').toUpperCase();
  if (code === 'TOKEN_EXPIRED' || code === 'UNAUTHORIZED') return true;

  const details = String(errObj?.details || '').toLowerCase();
  const message = String(errObj?.message || '').toLowerCase();

  return (
    details.includes('jwt expired') ||
    details.includes('token expired') ||
    message.includes('jwt expired') ||
    message.includes('token expired')
  );
}

// Global in-flight promise to deduplicate concurrent refresh calls
let refreshPromise: Promise<string> | null = null;

/**
 * Perform session refresh and update Redux store & localStorage.
 */
export async function refreshAccessToken(): Promise<string> {
  // Return existing in-flight refresh promise if already underway
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const currentRefreshToken = store.getState().auth.refreshToken;
      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      // Use a clean axios call to avoid interceptor loops
      const response = await axios.post(
        `${BASE_URL}/auth/refresh`,
        { refreshToken: currentRefreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      );

      const payload = response.data?.data || response.data;
      const newToken = payload?.token;
      const newRefreshToken = payload?.refreshToken || currentRefreshToken;

      if (!newToken) {
        throw new Error('Refresh response missing access token');
      }

      // Update Redux state (persisted via redux-persist to localStorage)
      store.dispatch(setToken({ token: newToken, refreshToken: newRefreshToken }));

      if (payload.user) {
        store.dispatch(setUser(payload.user));
      }
      if (payload.company) {
        store.dispatch(setCompany(payload.company));
      }

      return newToken;
    } catch (err) {
      store.dispatch(clearAuth());
      store.dispatch(clearUser());
      if (
        typeof window !== 'undefined' &&
        window.location.pathname !== ROUTES.LOGIN &&
        window.location.pathname !== ROUTES.REGISTER
      ) {
        window.location.href = ROUTES.LOGIN;
      }
      throw err;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ─── Request Interceptor ───────────────────────────────────────────────────────
// Proactively refreshes the access token if it is expired or expiring within 30s.
axiosInstance.interceptors.request.use(async (config) => {
  const isAuthRoute =
    config.url?.includes('/auth/login') ||
    config.url?.includes('/auth/register') ||
    config.url?.includes('/auth/refresh') ||
    config.url?.includes('/auth/logout');

  if (isAuthRoute) {
    return config;
  }

  let token = store.getState().auth.token;
  const refreshToken = store.getState().auth.refreshToken;

  if (token) {
    const decoded = parseJwt(token);
    // If token expires in <= 30 seconds and a refresh token is available
    if (decoded?.exp && Date.now() >= (decoded.exp - 30) * 1000 && refreshToken) {
      try {
        token = await refreshAccessToken();
      } catch {
        // Proactive refresh failed; proceed with existing token so response interceptor can handle it
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// ─── Response Interceptor ──────────────────────────────────────────────────────
// Reactively catches expired token errors (401 or 500 "jwt expired") and retries requests.
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/logout');

    if (isTokenExpiredError(error) && !originalRequest?._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  },
);
