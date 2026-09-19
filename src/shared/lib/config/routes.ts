export const ROUTES = {
  HOME: '/',
  LEADS: '/leads',
  LEAD_DETAILS: '/leads/:id',
  QUOTATIONS: '/quotations',
  CREATE_QUOTATION: '/quotations/new',
  QUOTATION_DETAILS: '/quotations/:id',
  USERS: '/users',
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
  ROUTES.LEADS,
  ROUTES.LEAD_DETAILS,
  ROUTES.QUOTATIONS,
  ROUTES.CREATE_QUOTATION,
  ROUTES.QUOTATION_DETAILS,
  ROUTES.USERS,
] as const;

export const AUTH_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
] as const;

export const LEAD_ROUTES = [
  ROUTES.LEADS,
  ROUTES.LEAD_DETAILS,
] as const;

export const QUOTATION_ROUTES = [
  ROUTES.QUOTATIONS,
  ROUTES.CREATE_QUOTATION,
  ROUTES.QUOTATION_DETAILS,
] as const;

const publicSet = new Set<string>(PUBLIC_ROUTES);
const protectedSet = new Set<string>(PROTECTED_ROUTES);
const authSet = new Set<string>(AUTH_ROUTES);
const leadSet = new Set<string>(LEAD_ROUTES);
const quotationSet = new Set<string>(QUOTATION_ROUTES);

export const isPublicRoute = (path: string): boolean => publicSet.has(path);
export const isProtectedRoute = (path: string): boolean =>
  protectedSet.has(path);
export const isAuthRoute = (path: string): boolean => authSet.has(path);
export const isLeadRoute = (path: string): boolean =>
  path === ROUTES.LEADS || path.startsWith('/leads/') || leadSet.has(path);
export const isQuotationRoute = (path: string): boolean =>
  path === ROUTES.QUOTATIONS || path.startsWith('/quotations/') || quotationSet.has(path);


