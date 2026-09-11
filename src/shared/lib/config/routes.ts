export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

export const PUBLIC_ROUTES = [ROUTES.HOME] as const;

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.PROFILE,
  ROUTES.SETTINGS,
] as const;

export const AUTH_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
] as const;

const publicSet = new Set<string>(PUBLIC_ROUTES);
const protectedSet = new Set<string>(PROTECTED_ROUTES);
const authSet = new Set<string>(AUTH_ROUTES);

export const isPublicRoute = (path: string): boolean => publicSet.has(path);
export const isProtectedRoute = (path: string): boolean =>
  protectedSet.has(path);
export const isAuthRoute = (path: string): boolean => authSet.has(path);
