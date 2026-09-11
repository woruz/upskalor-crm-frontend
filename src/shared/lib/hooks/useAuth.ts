import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import { setToken, clearAuth } from '@/shared/lib/store/slices/authSlice';
import { setUser, clearUser } from '@/shared/lib/store/slices/userSlice';
import type { User } from '@/shared/lib/types';

export function useAuth() {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.user.user);

  const login = useCallback(
    async (tokenValue: string, refreshTokenValue: string, userData: User) => {
      dispatch(
        setToken({ token: tokenValue, refreshToken: refreshTokenValue }),
      );
      dispatch(setUser(userData));
    },
    [dispatch],
  );

  const logout = useCallback(() => {
    dispatch(clearAuth());
    dispatch(clearUser());
  }, [dispatch]);

  return { isLoggedIn, token, user, login, logout };
}
