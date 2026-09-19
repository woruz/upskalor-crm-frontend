import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import { setToken, clearAuth } from '@/shared/lib/store/slices/authSlice';
import {
  setUser,
  setCompany,
  clearUser,
} from '@/shared/lib/store/slices/userSlice';
import { logoutUser } from '@/shared/lib/api/authApi';
import { refreshAccessToken } from '@/shared/lib/api/axios';
import type { User, Company } from '@/shared/lib/types';

export function useAuth() {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const token = useAppSelector((state) => state.auth.token);
  const refreshToken = useAppSelector((state) => state.auth.refreshToken);
  const user = useAppSelector((state) => state.user.user);
  const company = useAppSelector((state) => state.user.company);

  const login = useCallback(
    (
      tokenValue: string,
      refreshTokenValue: string,
      userData: User,
      companyData: Company,
    ) => {
      dispatch(
        setToken({ token: tokenValue, refreshToken: refreshTokenValue }),
      );
      dispatch(setUser(userData));
      dispatch(setCompany(companyData));
    },
    [dispatch],
  );

  const refresh = useCallback(async () => {
    return refreshAccessToken();
  }, []);

  const logout = useCallback(async () => {
    // Attempt to revoke the refresh token on the server.
    // If the call fails (e.g. token already expired), we still clear local state.
    if (refreshToken) {
      try {
        await logoutUser(refreshToken);
      } catch {
        // Silently ignore — we still want to clear client state.
      }
    }
    dispatch(clearAuth());
    dispatch(clearUser());
  }, [dispatch, refreshToken]);

  return { isLoggedIn, token, refreshToken, user, company, login, logout, refresh };
}
